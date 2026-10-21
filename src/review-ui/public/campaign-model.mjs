import {createCreativeBrief} from './brief-model.mjs';
const stages=['awareness','consideration','action'];
const fields=['name','goal','audience','audienceSource','hypothesis','primaryMetric','startDate','endDate','timeZone','destination','items'];
function fail(){throw Error('Revisa los datos de la campaña, fuentes y fechas.');}
function text(s,max,required=true){if(typeof s!=='string'||s.length>max||/[\u0000-\u001f]/.test(s)||(required&&!s.trim()))fail();return s.trim();}
function date(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s)||new Date(s+'T00:00:00.000Z').toISOString().slice(0,10)!==s)fail();return s;}
export function createCampaign(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!fields.includes(k)))fail();
 const name=text(input.name,120),audience=text(input.audience,500),audienceSource=text(input.audienceSource,500);
 const hypothesis=text(input.hypothesis,500),primaryMetric=text(input.primaryMetric,120);
 if(!['awareness','consideration','enquiries'].includes(input.goal))fail();
 const startDate=date(input.startDate),endDate=date(input.endDate);
 if(endDate<startDate)fail();
 const timeZone=text(input.timeZone,100);
 try{new Intl.DateTimeFormat('es',{timeZone}).format();}catch{fail();}
 const destination=text(input.destination??'',500,false);
 if(destination){const url=new URL(destination);if(url.protocol!=='https:'||url.username||url.password)fail();}
 if(!Array.isArray(input.items)||input.items.length<1||input.items.length>20)fail();
 const ids=new Set(),times=new Set();
 const items=input.items.map(item=>{
 if(!item||Object.keys(item).some(k=>!['briefId','input','plannedAt','stage'].includes(k)))fail();
 const briefId=text(item.briefId,100);
 if(ids.has(briefId)||!stages.includes(item.stage))fail();ids.add(briefId);
 const plannedAt=text(item.plannedAt,24);
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(plannedAt)||new Date(plannedAt).toISOString()!==plannedAt||plannedAt.slice(0,10)<startDate||plannedAt.slice(0,10)>endDate||times.has(plannedAt))fail();
 times.add(plannedAt);
 const brief=createCreativeBrief({...item.input,confirmed:true});
 return {briefId,plannedAt,stage:item.stage,brief,state:'needs_human_review'};
 });
 return {schemaVersion:'1.0.0',kind:'local-organic-campaign',state:'draft',name,goal:input.goal,
 audience,audienceSource,hypothesis,primaryMetric,startDate,endDate,timeZone,destination,items,
 measurementState:'not_measured',publicationState:'not_verified',
 warnings:['Plan local: no programa ni ejecuta envíos.','Fuentes declaradas por el operador; confirmar vigencia, derechos y datos antes de aprobar.','El destino no fue verificado; una URL no demuestra un enlace clicable en TikTok.']};
}
export function campaignText(c){
 const labels={awareness:'Descubrimiento',consideration:'Consideración',action:'Acción',enquiries:'Consultas'};
 return [c.name,'BORRADOR ORGÁNICO · REQUIERE REVISIÓN','Objetivo: '+labels[c.goal],
 'Audiencia: '+c.audience,'Fuente de audiencia: '+c.audienceSource,'Hipótesis: '+c.hypothesis,
 'Métrica propuesta (sin resultados): '+c.primaryMetric,'Zona de referencia: '+c.timeZone,
 'Destino declarado: '+(c.destination||'pendiente'),
 ...c.items.flatMap(i=>['','Fecha UTC propuesta: '+i.plannedAt,'Etapa: '+labels[i.stage],i.brief.title,i.brief.proposedCopy,
 'Fuente: '+i.brief.citations[0].sourceRef,'Consulta de fuente: '+i.brief.citations[0].observedAt]),
 '',...c.warnings].join('\n');
}
const key='tiktok-local-campaign-library-v1';
export function createCampaignLibrary(storage){
 function read(){
 const raw=storage.getItem(key);if(raw===null)return [];
 if(raw.length>500000)fail();
 const entries=JSON.parse(raw);
 if(!Array.isArray(entries)||entries.length>10)fail();
 const ids=new Set();
 return entries.map(e=>{
 if(!e||typeof e.id!=='string'||!e.id||e.id.length>100||ids.has(e.id))fail();ids.add(e.id);
 return {id:e.id,input:e.input,campaign:createCampaign(e.input)};
 });
 }
 return {list:()=>read(),save(input,id){
 const campaign=createCampaign(input),entries=read();
 if(entries.length>=10)throw Error('Máximo diez campañas locales. Conserva copias descargadas.');
 if(typeof id!=='string'||!id||id.length>100||entries.some(e=>e.id===id))fail();
 const normalized={name:campaign.name,goal:campaign.goal,audience:campaign.audience,audienceSource:campaign.audienceSource,
 hypothesis:campaign.hypothesis,primaryMetric:campaign.primaryMetric,startDate:campaign.startDate,endDate:campaign.endDate,
 timeZone:campaign.timeZone,destination:campaign.destination,
 items:input.items.map(i=>({...i,input:{...i.input,confirmed:false}}))};
 const next=[...entries.map(e=>({id:e.id,input:e.input})),{id,input:normalized}];
 const serialized=JSON.stringify(next);if(serialized.length>500000)throw Error('Las campañas exceden el límite local.');
 storage.setItem(key,serialized);return {id,campaign};
 }};
}
