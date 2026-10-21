let editorDirty = false, editorAvailable = false, recording = false, recorder, recordingStream;
const editorNumbers = { start:"start", speed:"speed", resolution:"resolution", brightness:"brightness", contrast:"contrast",
  saturation:"saturation", fade:"fade", originalVolume:"original-volume", musicVolume:"music-volume", voiceVolume:"voice-volume",
  musicOffset:"music-offset", voiceOffset:"voice-offset", musicStart:"music-start", voiceStart:"voice-start", imageWidth:"image-width", rotate:"rotate" };
const editorStrings = { template:"template", format:"format", fit:"fit", imagePosition:"image-position" };
function editorButtons() {
  const locked = busy || recording || !content || content.state === "archived" || Boolean(attempt) || dirty;
  document.querySelectorAll("#editor-panel input,#editor-panel select,#editor-panel textarea,#editor-panel button")
    .forEach(el => { el.disabled = locked; });
  for(const kind of ["music","voice","image"]) $("ed-remove-"+kind).disabled=locked || !(kind==="image"?editorMetadata?.image:editorMetadata?.tracks?.[kind]);
  $("ed-stop").disabled = !recording;
  $("ed-render").disabled = locked || !assetHash || !editorAvailable;
  $("ed-analyze").disabled = locked || !assetHash;
  $("ed-preflight").disabled = locked || !assetHash;
  $("ed-restore").disabled = locked || !assetHash;
  $("ed-record").disabled = locked || !assetHash || !navigator.mediaDevices?.getUserMedia;
  if(recording) for(const id of ["create","video","new-draft","approve","send","archive","plan","refresh"]) $(id).disabled = true;
  if(editorDirty) for(const id of ["approve","send","plan"]) $(id).disabled = true;
}
function editorLoad(data,{preserveRights=false}={}) {
  editorMetadata=data.editor || null;
  const r = data.editor?.recipe || {};
  const defaults = {start:0,speed:1,resolution:720,brightness:0,contrast:1,saturation:1,fade:0,originalVolume:1,
    musicVolume:.25,voiceVolume:1,musicOffset:0,voiceOffset:0,musicStart:0,voiceStart:0,imageWidth:.2,rotate:0,
    template:"clean",format:"vertical",fit:"contain",imagePosition:"top"};
  for(const [field,id] of Object.entries({...editorNumbers,...editorStrings})) $("ed-"+id).value = r[field] ?? defaults[field];
  $("ed-end").value = r.end ?? ""; $("ed-flip").checked = r.flip ?? false;
  const lines = items => (items || []).map(c => c.start+" | "+c.end+" | "+c.text.replace(/\n/g," ")).join("\n");
  $("ed-overlays").value = lines(r.overlays); $("ed-subtitles").value = lines(r.subtitles);
  const style = r.overlays?.[0] || r.subtitles?.[0];
  $("ed-position").value = style?.position || "bottom"; $("ed-font").value = style?.fontSize || 32;
  $("ed-color").value = style?.color || "#ffffff";
  if(!preserveRights || r.rights) {
    $("ed-rights").value = r.rights?.type || "owned";
    $("ed-evidence").value = r.rights?.evidence || "";
  }
  editorDirty = Boolean(data.editor?.needsRender);
  const tracks = Object.keys(data.editor?.tracks || {});
  if(data.editor?.image) tracks.push("image");
  const names = {music:"Música",voice:"Voz",image:"Imagen"};
  $("ed-assets").textContent = tracks.length ? "Archivos preparados: "+tracks.map(t=>names[t]).join(", ") : "Sin pistas adicionales.";
  $("ed-download").hidden = !data.editor?.qc;
  if(data.editor?.qc) {
    $("ed-download").href = "/api/editorial/drafts/"+content.id+"/video?revision="+content.revision;
    $("ed-download").download = "video-editado.mp4";
    $("ed-result").textContent = "MP4 listo: "+data.editor.qc.width+" × "+data.editor.qc.height+" · "+data.editor.qc.duration.toFixed(1)+" s. Reprodúcelo antes de aprobar.";
  }
  if (data.editor?.analysis) {
    const a = data.editor.analysis;
    $("ed-analysis").textContent = `Detectado: ${a.video.width} × ${a.video.height}, ${a.video.duration.toFixed(1)} s, ${a.video.orientation}, ${a.audio.present ? "con audio" : "sin audio"}. ${a.alerts.join(" ")}`;
  }
  if (data.editor?.preflight) showPreflight(data.editor.preflight);
  for(const id of ["music","voice","image","srt"]) $("ed-"+id).value = "";
}
function editorRecipe() {
  const rights={type:$("ed-rights").value,evidence:$("ed-evidence").value.trim()};
  if(!["owned","licensed"].includes(rights.type) || !rights.evidence) {
    throw Error("Indica derechos propios o licencia y su referencia.");
  }
  const r = {schemaVersion:"1.0.0",end:$("ed-end").value===""?null:Number($("ed-end").value),
    flip:$("ed-flip").checked,rights};
  for(const [field,id] of Object.entries(editorNumbers)) r[field] = Number($("ed-"+id).value);
  for(const [field,id] of Object.entries(editorStrings)) r[field] = $("ed-"+id).value;
  function cues(id) {
    return $(id).value.split("\n").filter(line=>line.trim()).map(line=>{
      const [start,end,...text] = line.split("|");
      if(!text.length || !start.trim() || !end.trim()) throw Error("Cada línea necesita inicio | fin | texto.");
      return {start:Number(start.trim()),end:Number(end.trim()),text:text.join("|").trim(),
        position:$("ed-position").value,fontSize:Number($("ed-font").value),color:$("ed-color").value};
    });
  }
  r.overlays=cues("ed-overlays"); r.subtitles=cues("ed-subtitles");
  return r;
}
async function editorUpload(kind,file) {
  if(!$("ed-evidence").value.trim()) throw Error("Indica la referencia de autoría/licencia antes de cargar audio o imagen.");
  const form = new FormData(); form.set("asset",file);
  const result = await api("/drafts/"+content.id+"/track/"+kind,null,{method:"POST",body:form,
    headers:{"X-Content-Revision":String(content.revision),"X-Rights-Type":$("ed-rights").value,
      "X-Rights-Evidence":encodeURIComponent($("ed-evidence").value.trim())}});
  content = result.content; $("confirm").checked = false; editorDirty = true;
  editorMetadata ||= {tracks:{}};
  if(kind==="image")editorMetadata.image={hash:result.assetHash};else {editorMetadata.tracks ||= {};editorMetadata.tracks[kind]={hash:result.assetHash};}
  $("ed-assets").textContent = "Archivo "+({music:"de música",voice:"de voz",image:"de imagen"}[kind])+" preparado. Exporta para escucharlo o verlo en el video.";
  await lists();
}
for(const kind of ["music","voice","image"]) $("ed-"+kind).addEventListener("change",()=>{
  const file=$("ed-"+kind).files[0]; if(file)run(()=>editorUpload(kind,file));
});
document.querySelectorAll("#editor-panel input:not([type=file]),#editor-panel select,#editor-panel textarea").forEach(el=>{
  el.addEventListener("input",()=>{editorDirty=Boolean(content);$("confirm").checked=false;buttons();});
});
$("ed-use-title").addEventListener("click",()=>{
  $("ed-overlays").value="0 | 5 | "+$("title").value.replace(/[\n|]/g," ");
  editorDirty=true;$("confirm").checked=false;buttons();
});
$("ed-render").addEventListener("click",()=>run(async()=>{
  try {
    const recipe=editorRecipe();
    $("ed-result").textContent="Exportando MP4… Puede tardar hasta tres minutos.";
    const result=await api("/drafts/"+content.id+"/render",{expectedRevision:content.revision,recipe});
    await select(result.content.id);await lists();
    $("ed-result").textContent="MP4 exportado y aprobación revocada. Revisa imagen y sonido antes de aprobar.";
  } catch(error) {
    $("ed-result").textContent=error.message;
    throw error;
  }
}));
$("ed-analyze").addEventListener("click",()=>run(async()=>{
  const result = await api("/drafts/"+content.id+"/analyze",{});
  editorMetadata ||= {}; editorMetadata.analysis = result.analysis;
  const a = result.analysis;
  $("ed-analysis").textContent = `Detectado: ${a.video.width} × ${a.video.height}, ${a.video.duration.toFixed(1)} s, ${a.video.orientation}, ${a.audio.present ? "con audio" : "sin audio"}. ${a.alerts.join(" ")}`;
}));
function showPreflight(result) {
  const messages = (result.checks || []).filter(check => check.status !== "pass").map(check => check.message);
  const label = result.status === "ready" ? "Listo para revisión local." : result.status === "blocked" ? "Bloqueado en el editor local." : "Revisión manual necesaria.";
  $("ed-preflight-result").textContent = `${label} ${messages.join(" ")} ${result.limitation || ""}`.trim();
}
$("ed-preflight").addEventListener("click",()=>run(async()=>{
  const result = await api("/drafts/"+content.id+"/preflight",{});
  editorMetadata ||= {}; editorMetadata.analysis = result.analysis; editorMetadata.preflight = result.preflight;
  const a = result.analysis;
  $("ed-analysis").textContent = `Detectado: ${a.video.width} × ${a.video.height}, ${a.video.duration.toFixed(1)} s, ${a.video.orientation}, ${a.audio.present ? "con audio" : "sin audio"}. ${a.alerts.join(" ")}`;
  showPreflight(result.preflight);
}));
$("ed-restore").addEventListener("click",()=>run(async()=>{
  const result=await api("/drafts/"+content.id+"/restore",{expectedRevision:content.revision});
  await select(result.content.id);await lists();$("ed-result").textContent="Video original restaurado; sin pistas añadidas. Revisa y aprueba de nuevo.";
}));
$("ed-copy").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText($("copy").value);$("ed-result").textContent="Texto copiado. Pégalo al editar el borrador en TikTok.";}
  catch{$("ed-result").textContent="No se pudo copiar automáticamente. Selecciona y copia el texto editorial.";}
});
$("ed-srt").addEventListener("change",()=>run(async()=>{
  const file=$("ed-srt").files[0];if(!file)return;
  if(file.size>100000)throw Error("El SRT excede 100 KB.");
  const text=await file.text();
  const seconds=t=>{const parts=t.replace(",",".").split(":").map(Number);return parts[0]*3600+parts[1]*60+parts[2];};
  const cues=text.replace(/\r/g,"").trim().split(/\n\s*\n/).map(block=>{
    const lines=block.split("\n"), index=lines.findIndex(line=>line.includes("-->"));
    if(index<0)throw Error("Bloque SRT inválido.");
    const match=lines[index].match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/);
    if(!match)throw Error("Tiempos SRT inválidos.");
    return seconds(match[1])+" | "+seconds(match[2])+" | "+lines.slice(index+1).join(" ").replace(/\|/g," ");
  });
  $("ed-subtitles").value=cues.join("\n");editorDirty=true;$("confirm").checked=false;
  $("ed-result").textContent="Subtítulos importados. Ajusta los tiempos al video editado y exporta.";
}));
$("ed-record").addEventListener("click",async()=>{
  if(busy || recording || !content || attempt)return;
  if(!$("ed-evidence").value.trim()){$("ed-result").textContent="Indica que la grabación es propia y su referencia.";return;}
  const id=content.id;
  try {
    recording=true;buttons();
    recordingStream=await navigator.mediaDevices.getUserMedia({audio:true});
    const chunks=[];recorder=new MediaRecorder(recordingStream);
    recorder.addEventListener("dataavailable",event=>{if(event.data.size)chunks.push(event.data);});
    recorder.addEventListener("stop",()=>{
      const blob=new Blob(chunks,{type:recorder.mimeType});
      recordingStream.getTracks().forEach(track=>track.stop());recording=false;buttons();
      if(content?.id!==id)return;
      run(async()=>{await editorUpload("voice",new File([blob],"voz.webm",{type:blob.type.split(";")[0]}));$("ed-result").textContent="Voz grabada. Exporta para incorporarla.";});
    },{once:true});
    recording=true;recorder.start();buttons();$("ed-result").textContent="Grabando tu voz. Pulsa Terminar grabación.";
    const capturedRecorder=recorder;
    setTimeout(()=>{if(capturedRecorder.state==="recording")capturedRecorder.stop();},180000);
  }catch{recordingStream?.getTracks().forEach(t=>t.stop());recording=false;buttons();$("ed-result").textContent="No se pudo acceder al micrófono.";}
});
$("ed-stop").addEventListener("click",()=>{if(recorder?.state==="recording")recorder.stop();});
window.addEventListener("beforeunload",()=>recordingStream?.getTracks().forEach(t=>t.stop()));
async function editorInit() {
  try{
    const result=await api("/media/capabilities");editorAvailable=result.available;
    $("editor-tools").textContent=editorAvailable?"Exportación MP4 disponible.":"Exportación no disponible: falta FFmpeg.";
  }catch{$("editor-tools").textContent="Reinicia el servidor para cargar el editor.";}
  buttons();
}
if(session)editorInit();

$("ed-template").addEventListener("change",()=>{$("ed-color").value=$("ed-template").value==="contrast"?"#ffe08a":"#ffffff";});

let editorMetadata = null;
function storedPresets() {
  try { const value=JSON.parse(localStorage.getItem("tiktok-editor-presets-v1")||"[]");return Array.isArray(value)?value.filter(x=>typeof x.name==="string" && x.recipe && typeof x.recipe==="object").slice(0,20):[]; }
  catch{return [];}
}
function presetList() {
  $("ed-saved-preset").replaceChildren();
  const empty=document.createElement("option");empty.value="";empty.textContent="Selecciona una plantilla guardada";$("ed-saved-preset").append(empty);
  for(const preset of storedPresets()){const option=document.createElement("option");option.value=preset.name;option.textContent=preset.name;$("ed-saved-preset").append(option);}
}
$("ed-save-preset").addEventListener("click",()=>{
  try {
    const name=$("ed-preset-name").value.trim();
    if(!name || name.length>60)throw Error("Indica un nombre de plantilla (máximo 60 caracteres).");
    const recipe=editorRecipe();delete recipe.rights;
    const presets=storedPresets().filter(p=>p.name!==name);presets.push({name,recipe});
    if(presets.length>20)throw Error("Máximo veinte plantillas en este navegador.");
    localStorage.setItem("tiktok-editor-presets-v1",JSON.stringify(presets));presetList();
    $("ed-result").textContent="Plantilla guardada en este navegador. Los derechos se confirman para cada video.";
  }catch(error){$("ed-result").textContent=error.message;}
});
$("ed-apply-preset").addEventListener("click",()=>{
  const preset=storedPresets().find(p=>p.name===$("ed-saved-preset").value);
  if(!preset)return;
  editorLoad({editor:{...editorMetadata,recipe:preset.recipe,needsRender:true}},{preserveRights:true});
  editorDirty=true;$("confirm").checked=false;buttons();
  $("ed-result").textContent="Plantilla aplicada. Revisa tiempos y derechos; exporta para obtener el resultado.";
});
for(const kind of ["music","voice","image"]) $("ed-remove-"+kind).addEventListener("click",()=>run(async()=>{
  const result=await api("/drafts/"+content.id+"/track/"+kind+"/remove",{expectedRevision:content.revision});
  content=result.content;editorDirty=true;$("confirm").checked=false;
  if(kind==="image" && editorMetadata)editorMetadata.image=null;
  else if(editorMetadata?.tracks)delete editorMetadata.tracks[kind];
  $("ed-assets").textContent="Pista retirada. Exporta para actualizar el video.";
  await lists();
}));
presetList();
