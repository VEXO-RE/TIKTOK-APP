import multer from "multer";
import { AppError } from "../core/errors.js";
const TYPES=new Set(["audio/mpeg","audio/mp3","audio/wav","audio/x-wav","audio/ogg","audio/mp4","audio/x-m4a","audio/webm","image/png","image/jpeg"]);
const parser=multer({storage:multer.memoryStorage(),limits:{fileSize:8*1024*1024,files:1,fields:0,parts:2},
  fileFilter(req,file,cb){cb(null,TYPES.has(file.mimetype));}}).single("asset");
export function parseEditorAsset(req,res,next) {
  parser(req,res,error=>{
    if(error) return next(new AppError("Archivo de audio/imagen inválido o superior a 8 MiB.",400,"MEDIA_ASSET_INVALID"));
    if(!req.file?.buffer?.length) return next(new AppError("Selecciona audio o imagen compatible.",400,"MEDIA_ASSET_REQUIRED"));
    next();
  });
}
