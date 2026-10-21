import { createHash } from "node:crypto";
import { createReadStream,createWriteStream } from "node:fs";
import { mkdir,mkdtemp,readFile,writeFile,copyFile,rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve,join,dirname,basename } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
if(process.platform!=="win32")throw Error("Este instalador portátil está preparado para Windows.");
const VERSION="9.0.2";
const URL="https://www.gyan.dev/ffmpeg/builds/packages/ffmpeg-9.0.2-essentials_build.zip";
const EXPECTED="60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba";
const target=fileURLToPath(new globalThis.URL("../tools/ffmpeg/",import.meta.url));
const directory=await mkdtemp(join(tmpdir(),"tiktok-ffmpeg-setup-"));
try {
  console.log("Preparando FFmpeg portátil "+VERSION+" (sin instalación global)...");
  const args=process.argv.slice(2);
  if(args.length && (args.length!==2 || args[0]!=="--archive"))throw Error("Uso: node scripts/setup-media.mjs [--archive archivo.zip]");
  const archive=args.length?resolve(args[1]):join(directory,"ffmpeg.zip");
  if(!args.length){
    const response=await fetch(URL,{signal:AbortSignal.timeout(600000)});
    if(!response.ok)throw Error("Descarga HTTP "+response.status);
    await pipeline(Readable.fromWeb(response.body),createWriteStream(archive));
  }
  const digest=createHash("sha256");for await(const chunk of createReadStream(archive))digest.update(chunk);
  if(digest.digest("hex")!==EXPECTED)throw Error("SHA256 distinto: no se instala.");
  const run=promisify(execFile);
  const listing=(await run("tar",["-tf",archive],{windowsHide:true,timeout:30000})).stdout.split(/\r?\n/);
  const members=listing.filter(name=>/^ffmpeg-[A-Za-z0-9_.-]+\/(bin\/ffmpeg.exe|bin\/ffprobe.exe|LICENSE|README.txt)$/.test(name));
  if(members.length!==4)throw Error("Estructura inesperada del paquete.");
  await run("tar",["-xf",archive,"-C",directory,...members],{windowsHide:true,timeout:60000});
  await mkdir(join(target,"bin"),{recursive:true});
  for(const member of members) {
    const name=member.split("/").pop();
    const destination=join(target,name.endsWith(".exe")?"bin":"",name);
    if(!resolve(destination).startsWith(resolve(target)+"\\"))throw Error("Destino inválido.");
    await copyFile(join(directory,member),destination);
  }
  await writeFile(join(target,"install-manifest.json"),JSON.stringify({version:VERSION,url:URL,sha256:EXPECTED,license:"GPLv3",installedAt:new Date().toISOString()},null,2));
  console.log("FFmpeg/ffprobe listos; SHA256 verificado. LICENSE conservada.");
}finally {
  if(dirname(resolve(directory))!==resolve(tmpdir())||!basename(directory).startsWith("tiktok-ffmpeg-setup-"))throw Error("Ruta temporal inválida.");
  await rm(directory,{recursive:true,force:true});
}
