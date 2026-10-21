import {createCreativeBrief,briefText} from './brief-model.mjs';
const $=id=>document.getElementById(id);let current=null;
const buttons=['copy-brief','copy-overlays','download'];
function invalidate(){current=null;buttons.forEach(id=>$(id).disabled=true);$('output').textContent='Datos modificados: prepara de nuevo el guion.';}
$('brief-form').addEventListener('input',invalidate);
$('brief-form').addEventListener('submit',event=>{
 event.preventDefault();invalidate();
 try{
 const input=Object.fromEntries(['name','color','style','sourceRef','observedAt'].map(id=>[id,$(id).value]));
 input.quantity=Number($('quantity').value);input.confirmed=$('confirmed').checked;
 current=createCreativeBrief(input);$('output').textContent=briefText(current);
 buttons.forEach(id=>$(id).disabled=false);$('status').textContent='Borrador preparado. Requiere revisión humana.';
 }catch(error){$('status').textContent=error.message;}
});
async function copy(value){try{await navigator.clipboard.writeText(value);$('status').textContent='Copiado.';}catch{$('status').textContent='No se pudo copiar. Selecciona el texto o descarga el borrador.';}}
$('copy-brief').addEventListener('click',()=>{if(current)copy(briefText(current));});
$('copy-overlays').addEventListener('click',()=>{if(current)copy(current.editorOverlays);});
$('download').addEventListener('click',()=>{
 if(!current)return;
 const url=URL.createObjectURL(new Blob([JSON.stringify(current,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='brief-local.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

import {createBriefLibrary,importBrief} from './brief-library.mjs';
let library;
function libraryList(){
 try{
 library??=createBriefLibrary(window.localStorage);
 $('saved-briefs').replaceChildren();
 for(const e of library.list()){const option=document.createElement('option');option.value=e.id;option.textContent=e.input.quantity+' × '+e.input.name;$('saved-briefs').append(option);}
 $('load-brief').disabled=!$('saved-briefs').options.length;
 }catch(error){$('library-status').textContent='No se pudo leer la biblioteca: '+error.message;$('load-brief').disabled=true;}
}
function restoreInput(input){
 for(const id of ['name','quantity','color','style','sourceRef','observedAt'])$(id).value=input[id]??'';
 $('confirmed').checked=false;invalidate();$('save-brief').disabled=true;
 $('status').textContent='Datos recuperados. Revisa la fuente y confirma de nuevo.';
}
$('brief-form').addEventListener('input',()=>{$('save-brief').disabled=true;});
$('brief-form').addEventListener('submit',()=>{$('save-brief').disabled=!current;});
$('save-brief').addEventListener('click',()=>{
 if(!current)return;
 try{library??=createBriefLibrary(window.localStorage);library.save(importBrief(JSON.stringify(current)),crypto.randomUUID());libraryList();$('library-status').textContent='Brief guardado en este navegador.';}
 catch(error){$('library-status').textContent='No se pudo guardar: '+error.message;}
});
$('load-brief').addEventListener('click',()=>{try{restoreInput(library.load($('saved-briefs').value));}catch(error){$('library-status').textContent=error.message;}});
$('import-brief').addEventListener('change',async()=>{
 const file=$('import-brief').files[0];if(!file)return;
 try{if(file.size>65536)throw Error('Máximo 64 KiB.');restoreInput(importBrief(await file.text()));$('library-status').textContent='Archivo importado como datos; texto generado y aprobación anteriores descartados.';}
 catch(error){$('library-status').textContent='No se importó el archivo: '+error.message;}
 finally{$('import-brief').value='';}
});
libraryList();
