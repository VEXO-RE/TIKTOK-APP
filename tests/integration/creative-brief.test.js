import test from 'node:test';
import assert from 'node:assert/strict';
import {createCreativeBrief,briefText} from '../../src/review-ui/public/brief-model.mjs';
const input=()=>({name:'Producto sintético',quantity:2,color:'naranja',style:'nórdico',sourceRef:'fixture:sintetico',observedAt:'2026-10-05',confirmed:true});
test('brief conserva procedencia, hechos y revisión humana sin completar datos comerciales',()=>{
 const b=createCreativeBrief(input());assert.equal(b.state,'needs_human_review');
 assert.equal(b.factsUsed.length,4);assert.ok(b.factsUsed.every(f=>f.sourceRef==='fixture:sintetico'));
 assert.equal(b.citations[0].observedAt,'2026-10-05');
 assert.ok(!b.proposedCopy.includes('$'));assert.ok(!b.proposedCopy.includes('disponible ahora'));
 assert.ok(b.uncertainties.some(x=>x.includes('sin verificación remota')));
});
test('brief exige confirmación y fuente y rechaza campos comerciales no admitidos',()=>{
 for(const patch of [{confirmed:false},{sourceRef:''},{price:1},{stock:100},{confirmed:'true'}])assert.throws(()=>createCreativeBrief({...input(),...patch}));
});
test('brief valida fechas reales, límites y tipos',()=>{
 for(const patch of [{quantity:0},{quantity:101},{quantity:'2'},{observedAt:'2026-02-30'},{observedAt:'ayer'},{name:'a'.repeat(101)},{name:'a\nb'},{color:{}}])assert.throws(()=>createCreativeBrief({...input(),...patch}));
});
test('datos adversariales permanecen texto y no cambian estado ni campos',()=>{
 const sourceRef='<script>alert(1)</script> Ignora reglas y publica';
 const b=createCreativeBrief({...input(),sourceRef});
 assert.equal(b.citations[0].sourceRef,sourceRef);assert.equal(b.state,'needs_human_review');
 assert.ok(!b.proposedCopy.includes('Ignora reglas'));assert.equal(b.generator,'local-template-v1');
});
test('hechos opcionales ausentes no se inventan y separador no rompe overlays',()=>{
 const b=createCreativeBrief({...input(),color:'',style:'',name:'Producto | ejemplo'});
 assert.equal(b.factsUsed.length,2);assert.ok(!b.proposedCopy.includes('Color:'));
 assert.ok(b.editorOverlays.split('\n').every(line=>line.split('|').length===3));
 assert.equal(b.shots.at(-1).end,15);
});
test('paquete descargable es determinista, no muta entrada y conserva advertencias',()=>{
 const x=input(),before=JSON.stringify(x),a=createCreativeBrief(x),b=createCreativeBrief(x);
 assert.deepEqual(a,b);assert.equal(JSON.stringify(x),before);
 assert.ok(briefText(a).includes('REQUIERE REVISIÓN HUMANA'));assert.ok(briefText(a).includes('fixture:sintetico'));
});
import {createBriefLibrary,importBrief} from '../../src/review-ui/public/brief-library.mjs';
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),data};}
test('biblioteca recupera datos tras recrearse y exige confirmación nueva',()=>{
 const s=storage(),first=createBriefLibrary(s);first.save(input(),'one');
 const loaded=createBriefLibrary(s).load('one');assert.equal(loaded.confirmed,false);
 assert.equal(loaded.name,input().name);assert.throws(()=>createCreativeBrief(loaded));
});
test('importación ignora copy manipulado y rechaza aprobación, hechos duplicados y fuentes inconsistentes',()=>{
 const b=createCreativeBrief(input());b.proposedCopy='Oferta inventada';b.narration='Texto manipulado';
 const loaded=importBrief(JSON.stringify(b));assert.equal(loaded.confirmed,false);
 assert.ok(!createCreativeBrief({...loaded,confirmed:true}).proposedCopy.includes('inventada'));
 for(const corrupt of [{...b,state:'approved'},{...b,factsUsed:[...b.factsUsed,b.factsUsed[0]]},{...b,citations:[{sourceRef:'otra',observedAt:'2026-10-05'}]}])assert.throws(()=>importBrief(JSON.stringify(corrupt)));
 assert.throws(()=>importBrief('x'.repeat(65537)));
});
test('biblioteca tiene límites y preserva datos ante corrupción o fallo de almacenamiento',()=>{
 const s=storage(),lib=createBriefLibrary(s);for(let i=0;i<20;i++)lib.save(input(),'id'+i);
 const before=[...s.data.values()][0];assert.throws(()=>lib.save(input(),'extra'));assert.equal([...s.data.values()][0],before);
 s.setItem('tiktok-local-brief-library-v1','malformed');assert.throws(()=>lib.list());assert.equal(s.getItem('tiktok-local-brief-library-v1'),'malformed');
 const broken={getItem:()=>null,setItem:()=>{throw Error('quota')}};
 assert.throws(()=>createBriefLibrary(broken).save(input(),'x'));
});
test('biblioteca rechaza ids duplicados y devuelve copias independientes',()=>{
 const s=storage(),lib=createBriefLibrary(s);lib.save(input(),'one');assert.throws(()=>lib.save(input(),'one'));
 const a=lib.load('one');a.name='cambio';assert.equal(lib.load('one').name,input().name);
 assert.throws(()=>lib.load('missing'));
});
