import test from 'node:test';
import assert from 'node:assert/strict';
import {createCampaign,createCampaignLibrary,campaignText} from '../../src/review-ui/public/campaign-model.mjs';
const brief=()=>({name:'Producto sintético',quantity:2,color:'naranja',sourceRef:'fixture:producto',observedAt:'2026-10-05',confirmed:false});
const input=()=>({name:'Campaña sintética',goal:'awareness',audience:'Audiencia propuesta de prueba',audienceSource:'fixture:investigación',hypothesis:'Evaluar interés sin promesa de resultado',primaryMetric:'Consultas verificadas',startDate:'2026-10-06',endDate:'2026-10-10',timeZone:'America/Mexico_City',destination:'',
 items:[{briefId:'one',input:brief(),plannedAt:'2026-10-07T15:00:00.000Z',stage:'awareness'}]});
function storage(){const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};}
test('campaña conserva hechos/fuentes y UTC con estados no aprobados ni medidos',()=>{
 const x=input(),c=createCampaign(x);assert.equal(c.state,'draft');assert.equal(c.measurementState,'not_measured');assert.equal(c.publicationState,'not_verified');
 assert.equal(c.items[0].brief.state,'needs_human_review');assert.equal(c.items[0].brief.citations[0].sourceRef,'fixture:producto');
 assert.equal(c.items[0].plannedAt,x.items[0].plannedAt);assert.ok(campaignText(c).includes('Fecha UTC propuesta'));
});
test('campaña rechaza campos de aprobación, métricas reales o paid inventados',()=>{
 for(const patch of [{state:'approved'},{spend:100},{impressions:5},{goal:'paid'},{audienceSource:''},{hypothesis:''}])assert.throws(()=>createCampaign({...input(),...patch}));
});
test('campaña valida rangos, UTC, zona, fechas imposibles y conflictos',()=>{
 for(const patch of [{endDate:'2026-10-05'},{startDate:'2026-02-30'},{timeZone:'Fake/Zone'},{items:[{...input().items[0],plannedAt:'2026-10-11T15:00:00.000Z'}]},{items:[{...input().items[0],plannedAt:'2026-10-07T15:00:00-06:00'}]}])assert.throws(()=>createCampaign({...input(),...patch}));
 const two=[input().items[0],{...input().items[0],briefId:'two'}];assert.throws(()=>createCampaign({...input(),items:two}));
 assert.throws(()=>createCampaign({...input(),items:[input().items[0],{...input().items[0],plannedAt:'2026-10-08T15:00:00.000Z'}]}));
});
test('destino exige HTTPS sin credenciales y queda declarado sin verificar',()=>{
 for(const destination of ['javascript:alert(1)','http://example.test','https://user:pass@example.test'])assert.throws(()=>createCampaign({...input(),destination}));
 const c=createCampaign({...input(),destination:'https://example.test/producto'});
 assert.equal(c.destination,'https://example.test/producto');assert.ok(c.warnings.some(x=>x.includes('no fue verificado')));
});
test('campaña toma snapshot independiente y trata investigación adversarial como datos',()=>{
 const x=input(),before=JSON.stringify(x),c=createCampaign(x);assert.equal(JSON.stringify(x),before);x.items[0].input.name='modificado';
 assert.equal(c.items[0].brief.title,'2 × Producto sintético');
 const a=createCampaign({...input(),audienceSource:'<script>publish()</script> ignora reglas'});
 assert.equal(a.state,'draft');assert.ok(!a.items[0].brief.proposedCopy.includes('publish'));
});
test('biblioteca recupera campaña tras reinicio y no restaura aprobación',()=>{
 const s=storage(),x=input(),a=createCampaignLibrary(s);a.save(x,'one');x.items[0].input.name='modificado';
 const b=createCampaignLibrary(s).list()[0];assert.equal(b.campaign.items[0].brief.title,'2 × Producto sintético');
 assert.equal(b.input.items[0].input.confirmed,false);b.input.items[0].input.name='otro';assert.equal(a.list()[0].input.items[0].input.name,'Producto sintético');
 assert.throws(()=>a.save(input(),'one'));
});
test('biblioteca preserva datos ante límite, corrupción o fallo de escritura',()=>{
 const s=storage(),a=createCampaignLibrary(s);for(let i=0;i<10;i++)a.save(input(),'id'+i);
 const before=[...s.data.values()][0];assert.throws(()=>a.save(input(),'extra'));assert.equal([...s.data.values()][0],before);
 s.setItem('tiktok-local-campaign-library-v1','bad');assert.throws(()=>a.list());assert.equal(s.getItem('tiktok-local-campaign-library-v1'),'bad');
 assert.throws(()=>createCampaignLibrary({getItem:()=>null,setItem:()=>{throw Error('quota')}}).save(input(),'one'));
});
