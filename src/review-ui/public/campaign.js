import {createBriefLibrary} from './brief-library.mjs';
import {createCampaign,createCampaignLibrary,campaignText} from './campaign-model.mjs';
const $=id=>document.getElementById(id);
let library,briefs=[],rows=[],current=null,currentInput=null;
function invalidate(){current=null;currentInput=null;$('save').disabled=true;$('download').disabled=true;$('output').textContent='Datos modificados: prepara nuevamente la campaña.';}
function listSaved(){
 try{
 library??=createCampaignLibrary(window.localStorage);$('saved').replaceChildren();
 for(const e of library.list()){const option=document.createElement('option');option.value=e.id;option.textContent=e.campaign.name;$('saved').append(option);}
 $('show').disabled=!$('saved').options.length;
 }catch(e){$('status').textContent='No se pudo leer la biblioteca: '+e.message;$('show').disabled=true;}
}
function loadBriefs(){
 try{
 briefs=createBriefLibrary(window.localStorage).list();$('brief-items').replaceChildren();rows=[];
 for(const b of briefs){
 const field=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=b.input.quantity+' × '+b.input.name;field.append(legend);
 const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.setAttribute('aria-label','Incluir '+b.input.name);label.append(check,document.createTextNode(' Incluir esta pieza'));field.append(label);
 const stage=document.createElement('select');stage.setAttribute('aria-label','Etapa de '+b.input.name);
 for(const [value,name]of [['awareness','Descubrimiento'],['consideration','Consideración'],['action','Acción']]){const o=document.createElement('option');o.value=value;o.textContent=name;stage.append(o);}
 const stageLabel=document.createElement('label');stageLabel.append(document.createTextNode('Etapa del embudo'),stage);field.append(stageLabel);
 const planned=document.createElement('input');planned.type='datetime-local';planned.setAttribute('aria-label','Fecha UTC de '+b.input.name);planned.step='60';
 const timeLabel=document.createElement('label');timeLabel.append(document.createTextNode('Fecha y hora propuesta (UTC)'),planned);field.append(timeLabel);
 $('brief-items').append(field);rows.push({b,check,stage,planned});
 }
 $('brief-status').textContent=briefs.length?'Revisa las fuentes de cada pieza antes de exportar.':'No hay briefs guardados. Prepáralos y guárdalos primero en la biblioteca.';
 }catch(e){$('brief-status').textContent='No se pudo leer briefs: '+e.message;}
}
$('campaign-form').addEventListener('input',invalidate);
$('campaign-form').addEventListener('submit',event=>{
 event.preventDefault();invalidate();
 try{
 const input=Object.fromEntries(['name','goal','audience','audienceSource','hypothesis','primaryMetric','startDate','endDate','timeZone','destination'].map(id=>[id,$(id).value]));
 input.items=rows.filter(r=>r.check.checked).map(r=>{
 if(!r.planned.value)throw Error('Indica la fecha UTC de cada pieza.');
 const plannedAt=r.planned.value.length===16?r.planned.value+':00.000Z':r.planned.value+'.000Z';
 return {briefId:r.b.id,input:r.b.input,plannedAt,stage:r.stage.value};
 });
 current=createCampaign(input);currentInput=input;$('output').textContent=campaignText(current);
 $('save').disabled=false;$('download').disabled=false;$('status').textContent='Plan preparado como borrador. No se ejecutará ningún envío.';
 }catch(e){$('status').textContent=e.message;}
});
$('save').addEventListener('click',()=>{
 if(!currentInput)return;
 try{library??=createCampaignLibrary(window.localStorage);library.save(currentInput,crypto.randomUUID());listSaved();$('status').textContent='Campaña guardada en este navegador.';$('save').disabled=true;}
 catch(e){$('status').textContent='No se pudo guardar: '+e.message;}
});
$('show').addEventListener('click',()=>{
 try{const e=library.list().find(e=>e.id===$('saved').value);if(!e)throw Error('Campaña no encontrada.');
 current=e.campaign;currentInput=null;$('output').textContent=campaignText(current);$('save').disabled=true;$('download').disabled=false;$('status').textContent='Plan guardado: borrador, sin aprobación ni publicación comprobada.';
 }catch(e){$('status').textContent=e.message;}
});
$('download').addEventListener('click',()=>{
 if(!current)return;
 const url=URL.createObjectURL(new Blob([JSON.stringify(current,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='campana-local.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
loadBriefs();listSaved();
