import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, readFile, copyFile, rm, stat, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { AppError } from "../core/errors.js";
const run = promisify(execFile);
export const toolDirectory = fileURLToPath(new URL("../../tools/ffmpeg/bin/", import.meta.url));
const binary = name => join(toolDirectory, process.platform === "win32" ? name + ".exe" : name);
const sha = b => createHash("sha256").update(b).digest("hex");
const SAFE_FORMATS = "mov,matroska,webm,ogg,wav,mp3,aac,image2,png_pipe,jpeg_pipe";
const bad = message => { throw new AppError(message, 400, "MEDIA_RECIPE_INVALID"); };
const POSITIONS = ["top", "center", "bottom"];
const FORMATS = { vertical: [720,1280], square: [720,720], landscape: [1280,720] };
export const templates = Object.freeze({
  clean: { name: "Limpia", box: false, color: "#ffffff" },
  editorial: { name: "Editorial", box: true, color: "#ffffff" },
  contrast: { name: "Alto contraste", box: true, color: "#ffe08a" }
});
function number(value, fallback, min, max, field) {
  const n = value === undefined ? fallback : value;
  if (typeof n !== "number" || !Number.isFinite(n) || n < min || n > max) bad(field + " fuera de rango.");
  return n;
}
function object(value, fields) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      Object.keys(value).some(k => !fields.includes(k))) bad("Campos de edición inválidos.");
}
export function validateRecipe(input = {}) {
  object(input, ["schemaVersion","start","end","speed","format","fit","resolution","rotate","flip","brightness","contrast","saturation","fade","originalVolume","musicVolume","voiceVolume","musicOffset","voiceOffset","musicStart","voiceStart","template","overlays","subtitles","imagePosition","imageWidth","rights"]);
  if (input.schemaVersion !== undefined && input.schemaVersion !== "1.0.0") bad("Versión de receta no soportada.");
  if (!Object.hasOwn(templates, input.template || "clean")) bad("Plantilla no soportada.");
  if (!["vertical","square","landscape","original"].includes(input.format || "vertical")) bad("Formato no soportado.");
  if (!["contain","cover"].includes(input.fit || "contain")) bad("Ajuste no soportado.");
  if (![720,1080].includes(input.resolution ?? 720)) bad("Resolución no soportada.");
  if (![0,90,180,270].includes(input.rotate ?? 0)) bad("Rotación inválida.");
  if (input.flip !== undefined && typeof input.flip !== "boolean") bad("Espejo inválido.");
  object(input.rights, ["type","evidence"]);
  if (!["owned","licensed"].includes(input.rights.type) || typeof input.rights.evidence !== "string" ||
      !input.rights.evidence.trim() || input.rights.evidence.length > 500) bad("Indica derechos propios o licencia y su referencia.");
  function texts(items, limit, field) {
    if (items === undefined) return [];
    if (!Array.isArray(items) || items.length > limit) bad("Demasiados " + field);
    return items.map(item => {
      object(item, ["text","start","end","position","fontSize","color"]);
      if (typeof item.text !== "string" || !item.text.trim() || item.text.length > 300) bad("Texto inválido.");
      const start = number(item.start, 0, 0, 180, "Inicio de texto");
      const end = number(item.end, 180, 0.01, 180, "Fin de texto");
      if (end <= start) bad("El fin del texto debe ser posterior.");
      if (!POSITIONS.includes(item.position || "bottom")) bad("Posición inválida.");
      if (item.color !== undefined && !/^#[a-fA-F0-9]{6}$/.test(item.color)) bad("Color inválido.");
      return { text: item.text, start, end, position: item.position || "bottom",
        fontSize: number(item.fontSize, 32, 16, 96, "Tamaño de texto"), color: item.color || templates[input.template || "clean"].color };
    });
  }
  if (input.imagePosition !== undefined && !POSITIONS.includes(input.imagePosition)) bad("Posición de imagen inválida.");
  const start = number(input.start,0,0,600,"Inicio");
  const end = input.end === undefined || input.end === null ? null : number(input.end,1,0.1,600,"Fin");
  if (end !== null && end <= start) bad("El fin debe ser posterior al inicio.");
  return { schemaVersion:"1.0.0", start, end, speed:number(input.speed,1,.5,2,"Velocidad"),
    format:input.format || "vertical", fit:input.fit || "contain", resolution:input.resolution ?? 720,
    rotate:input.rotate ?? 0, flip:input.flip ?? false,
    brightness:number(input.brightness,0,-.3,.3,"Brillo"), contrast:number(input.contrast,1,.5,2,"Contraste"),
    saturation:number(input.saturation,1,0,2,"Saturación"), fade:number(input.fade,0,0,3,"Fundido"),
    originalVolume:number(input.originalVolume,1,0,2,"Audio original"),
    musicVolume:number(input.musicVolume,.25,0,2,"Música"), voiceVolume:number(input.voiceVolume,1,0,2,"Voz"),
    musicOffset:number(input.musicOffset,0,0,180,"Entrada música"), voiceOffset:number(input.voiceOffset,0,0,180,"Entrada voz"),
    musicStart:number(input.musicStart,0,0,600,"Recorte música"), voiceStart:number(input.voiceStart,0,0,600,"Recorte voz"),
    template:input.template || "clean", overlays:texts(input.overlays,8,"capas"), subtitles:texts(input.subtitles,80,"subtítulos"),
    imagePosition:input.imagePosition || "top",
    imageWidth:number(input.imageWidth,.2,.05,.5,"Tamaño imagen"), rights:{type:input.rights.type,evidence:input.rights.evidence.trim()} };
}
export async function mediaCapabilities() {
  try {
    await Promise.all([access(binary("ffmpeg")),access(binary("ffprobe"))]);
    const { stdout } = await run(binary("ffmpeg"),["-version"],{windowsHide:true,timeout:10000,maxBuffer:100000});
    return { available:true, version:stdout.split(/\r?\n/)[0], templates, formats:["vertical","square","landscape","original"], resolutions:[720,1080] };
  } catch { return { available:false, message:"Falta FFmpeg portátil. Consulta la guía del editor." }; }
}
async function probe(path, cwd) {
  try {
    const { stdout } = await run(binary("ffprobe"),["-v","error","-protocol_whitelist","file,pipe","-format_whitelist",SAFE_FORMATS,"-show_streams","-show_format","-of","json",path],
      {cwd,windowsHide:true,timeout:15000,maxBuffer:1000000});
    return JSON.parse(stdout);
  } catch { throw new AppError("No se pudo inspeccionar el archivo multimedia.",400,"MEDIA_PROBE_FAILED"); }
}
let rendering = false;
export async function renderVideo({ buffer, recipe: input, tracks = {}, image = null, diagnostic = () => {} }) {
  const recipe = validateRecipe(input);
  if (!(await mediaCapabilities()).available) throw new AppError("FFmpeg no está disponible.",503,"MEDIA_TOOLS_REQUIRED",true);
  if (rendering) throw new AppError("Hay otra exportación en curso. Espera a que termine.",429,"MEDIA_RENDER_BUSY");
  if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > 64*1024*1024) bad("Video original inválido.");
  rendering = true;
  let directory;
  try {
    directory = await mkdtemp(join(tmpdir(),"tiktok-editor-"));
    await writeFile(join(directory,"input"),buffer);
    const info = await probe("input",directory);
    const video = info.streams?.find(s => s.codec_type === "video");
    if (!video || video.width > 4096 || video.height > 4096) bad("Video inválido o superior a 4096 píxeles.");
    const sourceDuration = Number(info.format?.duration);
    if (!Number.isFinite(sourceDuration) || sourceDuration <= 0) bad("Duración inválida.");
    const end = recipe.end ?? sourceDuration;
    if (end > sourceDuration+.05 || recipe.start >= sourceDuration) bad("El recorte excede el video.");
    const duration = (end-recipe.start)/recipe.speed;
    if (duration < .1 || duration > 180) bad("Exportación local: duración entre 0.1 y 180 segundos.");
    let [w,h] = FORMATS[recipe.format] || [video.width,video.height];
    if (recipe.format === "original") {
      if ([90,270].includes(recipe.rotate)) [w,h]=[h,w];
      const factor = Math.min(1,recipe.resolution/Math.min(w,h));
      w=Math.max(2,Math.floor(w*factor/2)*2); h=Math.max(2,Math.floor(h*factor/2)*2);
    } else if (recipe.resolution === 1080) { w=Math.round(w*1.5); h=Math.round(h*1.5); }
    const args=["-hide_banner","-loglevel","error","-nostdin","-y","-threads","2",
      "-protocol_whitelist","file,pipe","-format_whitelist",SAFE_FORMATS,"-ss",String(recipe.start),"-t",String(end-recipe.start),"-i","input"];
    const filters=[];
    let vf=["setpts=PTS-STARTPTS", "setpts=PTS/"+recipe.speed];
    if (recipe.rotate === 90) vf.push("transpose=1");
    if (recipe.rotate === 270) vf.push("transpose=2");
    if (recipe.rotate === 180) vf.push("hflip","vflip");
    if (recipe.flip) vf.push("hflip");
    vf.push(recipe.fit === "cover"
      ? `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`
      : `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black`);
    vf.push(`eq=brightness=${recipe.brightness}:contrast=${recipe.contrast}:saturation=${recipe.saturation}`);
    const fade = Math.min(recipe.fade,duration/2);
    if (fade) vf.push(`fade=t=in:st=0:d=${fade},fade=t=out:st=${duration-fade}:d=${fade}`);
    const captions=[...recipe.overlays,...recipe.subtitles];
    if (captions.length) {
      await copyFile(process.platform === "win32" ? "C:/Windows/Fonts/arial.ttf" : "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",join(directory,"font.ttf"));
      for (const [i,c] of captions.entries()) {
        await writeFile(join(directory,`text${i}.txt`),c.text);
        const y=c.position==="top"?"h*0.10":c.position==="center"?"(h-text_h)/2":"h*0.82-text_h";
        vf.push(`drawtext=fontfile=font.ttf:textfile=text${i}.txt:expansion=none:fontsize=${Math.round(c.fontSize*recipe.resolution/720)}:fontcolor=0x${c.color.slice(1)}:x=(w-text_w)/2:y=${y}:borderw=2:bordercolor=black${templates[recipe.template].box?":box=1:boxcolor=black@0.65:boxborderw=12":""}:enable='between(t,${c.start},${Math.min(c.end,duration)})'`);
      }
    }
    filters.push("[0:v]"+vf.join(",")+"[base]");
    let inputIndex=1, videoLabel="base";
    if (image) {
      if (!["owned","licensed"].includes(image.rights?.type) || !image.rights.evidence) bad("Faltan derechos de la imagen.");
      await writeFile(join(directory,"image"),image.buffer);
      const meta=await probe("image",directory), stream=meta.streams?.find(s=>s.codec_type==="video");
      if (!stream || !["png","mjpeg"].includes(stream.codec_name) || stream.width>4096 || stream.height>4096) bad("Imagen PNG/JPEG inválida.");
      args.push("-protocol_whitelist","file,pipe","-format_whitelist",SAFE_FORMATS,"-loop","1","-i","image");
      filters.push(`[${inputIndex}:v]scale=${Math.max(2,Math.round(w*recipe.imageWidth/2)*2)}:-1[logo]`);
      const y=recipe.imagePosition==="top"?"H*0.08":recipe.imagePosition==="center"?"(H-h)/2":"H*0.85-h";
      filters.push(`[base][logo]overlay=x=(W-w)/2:y=${y}:shortest=1[composed]`);
      videoLabel="composed";inputIndex++;
    }
    const audio=[];
    if (info.streams.some(s=>s.codec_type==="audio") && recipe.originalVolume>0) {
      filters.push(`[0:a]asetpts=PTS-STARTPTS,atempo=${recipe.speed},volume=${recipe.originalVolume},apad,atrim=duration=${duration}[original]`);
      audio.push("[original]");
    }
    for (const name of ["music","voice"]) {
      const track=tracks[name];if (!track) continue;
      if (!["owned","licensed"].includes(track.rights?.type) || !track.rights.evidence) bad("Faltan derechos del audio.");
      await writeFile(join(directory,name),track.buffer);
      const metadata=await probe(name,directory);
      if (!metadata.streams?.some(s=>s.codec_type==="audio")) bad("El archivo no contiene audio.");
      args.push("-protocol_whitelist","file,pipe","-format_whitelist",SAFE_FORMATS,"-i",name);
      filters.push(`[${inputIndex}:a]atrim=start=${recipe[name+"Start"]},asetpts=PTS-STARTPTS,volume=${recipe[name+"Volume"]},adelay=${Math.round(recipe[name+"Offset"]*1000)}:all=1,apad,atrim=duration=${duration}[${name}]`);
      audio.push("["+name+"]"); inputIndex++;
    }
    if (audio.length) {
      filters.push(audio.join("")+`amix=inputs=${audio.length}:duration=longest:normalize=0,alimiter=limit=0.95${fade?",afade=t=in:st=0:d="+fade+",afade=t=out:st="+(duration-fade)+":d="+fade:""}[mixed]`);
    }
    await writeFile(join(directory,"filters.txt"),filters.join(";"));
    args.push("-/filter_complex","filters.txt","-map","["+videoLabel+"]");
    if (audio.length) args.push("-map","[mixed]","-c:a","aac","-b:a","128k");
    else args.push("-an");
    args.push("-t",String(duration),"-c:v","libx264","-preset","veryfast","-crf","23","-maxrate","2400k","-bufsize","4800k",
      "-pix_fmt","yuv420p","-r","30","-threads","2","-filter_complex_threads","1","-movflags","+faststart","output.mp4");
    try { await run(binary("ffmpeg"),args,{cwd:directory,windowsHide:true,timeout:180000,maxBuffer:2000000}); }
    catch (error) { diagnostic(String(error.stderr || "").slice(-4000)); throw new AppError("La exportación falló o excedió tres minutos. Prueba un recorte más corto.",422,"MEDIA_RENDER_FAILED"); }
    const size=(await stat(join(directory,"output.mp4"))).size;
    if (size>64*1024*1024) bad("La exportación excede 64 MiB.");
    const output=await readFile(join(directory,"output.mp4")), qc=await probe("output.mp4",directory);
    const stream=qc.streams.find(s=>s.codec_type==="video");
    if (stream?.codec_name!=="h264" || !qc.format.format_name.includes("mp4")) bad("La exportación no pasó la inspección MP4/H.264.");
    return { buffer:output, contentType:"video/mp4", hash:sha(output), sourceSha256:sha(buffer),
      recipe, recipeSha256:sha(JSON.stringify({recipe,sources:{video:sha(buffer),music:tracks.music?sha(tracks.music.buffer):null,voice:tracks.voice?sha(tracks.voice.buffer):null,image:image?sha(image.buffer):null}})),
      sources:{video:sha(buffer),music:tracks.music?sha(tracks.music.buffer):null,voice:tracks.voice?sha(tracks.voice.buffer):null,image:image?sha(image.buffer):null}, qc:{width:stream.width,height:stream.height,duration:Number(qc.format.duration),codec:stream.codec_name,audio:qc.streams.some(s=>s.codec_type==="audio"),bytes:size} };
  } finally {
    rendering=false;
    // Only our mkdtemp output directory is removed; originals remain in memory.
    if (directory) {
    if (dirname(resolve(directory)) !== resolve(tmpdir()) || !basename(directory).startsWith("tiktok-editor-")) throw new Error("Unsafe temporary render path.");
    await rm(directory,{recursive:true,force:true});
    }
  }
}
