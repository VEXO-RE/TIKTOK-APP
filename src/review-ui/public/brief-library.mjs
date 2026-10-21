import {createCreativeBrief} from './brief-model.mjs';
const key='tiktok-local-brief-library-v1',fields=['name','quantity','color','style'];
export function importBrief(raw){
 if(typeof raw!=='string'||raw.length>65536)throw Error('Archivo demasiado grande.');
 const b=JSON.parse(raw);
 if(b?.schemaVersion!=='1.0.0'||b.generator!=='local-template-v1'||b.state!=='needs_human_review'||!Array.isArray(b.factsUsed)||b.factsUsed.length<2||b.factsUsed.length>4||!Array.isArray(b.citations)||b.citations.length!==1)throw Error('Formato de brief no admitido.');
 const input={confirmed:false};
 const c=b.citations[0];if(!c||typeof c.sourceRef!=='string'||typeof c.observedAt!=='string')throw Error('Fuente inválida.');
 for(const f of b.factsUsed){
 if(!f||!fields.includes(f.field)||Object.hasOwn(input,f.field)||f.sourceRef!==c.sourceRef||f.observedAt!==c.observedAt)throw Error('Hechos duplicados o fuente inconsistente.');
 input[f.field]=f.value;
 }
 Object.assign(input,{sourceRef:c.sourceRef,observedAt:c.observedAt});
 createCreativeBrief({...input,confirmed:true});
 return input;
}
function cleanInput(input){const brief=createCreativeBrief({...input,confirmed:true});return importBrief(JSON.stringify(brief));}
export function createBriefLibrary(storage){
 function read(){
 const raw=storage.getItem(key);if(raw===null)return [];
 if(raw.length>200000)throw Error('Biblioteca local inválida; conserva una copia antes de recuperarla.');
 const data=JSON.parse(raw);
 if(data?.version!==1||!Array.isArray(data.entries)||data.entries.length>20)throw Error('Biblioteca local inválida.');
 const ids=new Set();
 return data.entries.map(e=>{
 if(!e||typeof e.id!=='string'||e.id.length>100||ids.has(e.id))throw Error('Biblioteca local inválida.');
 ids.add(e.id);return {id:e.id,input:cleanInput(e.input)};
 });
 }
 return {
 list:()=>read(),
 save(input,id){
 const normalized=cleanInput(input),entries=read();
 if(typeof id!=='string'||!id||id.length>100||entries.some(e=>e.id===id))throw Error('Identificador inválido.');
 if(entries.length>=20)throw Error('Máximo veinte briefs: descarga los existentes para conservarlos.');
 entries.push({id,input:normalized});
 storage.setItem(key,JSON.stringify({version:1,entries}));
 return {id,input:normalized};
 },
 load(id){const e=read().find(e=>e.id===id);if(!e)throw Error('Brief no encontrado.');return e.input;}
 };
}
