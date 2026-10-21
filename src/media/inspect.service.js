import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { AppError } from "../core/errors.js";
import { toolDirectory } from "./render.service.js";

const run = promisify(execFile);
const ffprobe = join(toolDirectory, process.platform === "win32" ? "ffprobe.exe" : "ffprobe");
const SAFE_FORMATS = "mov,matroska,webm,ogg,wav,mp3,aac,image2,png_pipe,jpeg_pipe";

function fps(value) {
  const [numerator, denominator] = String(value || "").split("/").map(Number);
  const rate = numerator / denominator;
  return Number.isFinite(rate) && rate > 0 ? Number(rate.toFixed(3)) : null;
}

export function summarizeVideoProbe(payload) {
  const video = payload?.streams?.find(stream => stream.codec_type === "video");
  if (!video?.width || !video?.height) {
    throw new AppError("El archivo no contiene una pista de video válida.", 400, "MEDIA_PROBE_FAILED");
  }
  const duration = Number(payload.format?.duration);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new AppError("No se pudo determinar la duración del video.", 400, "MEDIA_PROBE_FAILED");
  }
  const aspect = Number((video.width / video.height).toFixed(4));
  const vertical = video.height > video.width;
  const audio = payload.streams.some(stream => stream.codec_type === "audio");
  const alerts = [];
  if (!vertical) alerts.push("El video no es vertical; revisa el encuadre 9:16 antes de exportar.");
  if (duration > 180) alerts.push("El editor local limita la exportación a 180 segundos.");
  if (!audio) alerts.push("No se detectó audio; agrega música propia/licenciada o una voz si corresponde.");
  if (video.codec_name !== "h264") alerts.push("El original no usa H.264; la exportación local lo convertirá a MP4/H.264.");
  return {
    detectedAt: new Date().toISOString(),
    video: { width: video.width, height: video.height, aspectRatio: aspect, orientation: vertical ? "vertical" : "horizontal", codec: video.codec_name || null, frameRate: fps(video.avg_frame_rate || video.r_frame_rate), duration: Number(duration.toFixed(3)) },
    audio: { present: audio, tracks: payload.streams.filter(stream => stream.codec_type === "audio").length },
    alerts,
    limitation: "Este análisis valida propiedades técnicas; no identifica productos, personas ni marcas dentro de los fotogramas."
  };
}

export async function inspectVideo({ buffer, now = () => new Date() }) {
  if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > 64 * 1024 * 1024) {
    throw new AppError("Video inválido para analizar.", 400, "MEDIA_PROBE_FAILED");
  }
  let directory;
  try {
    directory = await mkdtemp(join(tmpdir(), "tiktok-inspect-"));
    await writeFile(join(directory, "input"), buffer);
    const { stdout } = await run(ffprobe, ["-v", "error", "-protocol_whitelist", "file,pipe", "-format_whitelist", SAFE_FORMATS, "-show_streams", "-show_format", "-of", "json", "input"], { cwd: directory, windowsHide: true, timeout: 15000, maxBuffer: 1000000 });
    const summary = summarizeVideoProbe(JSON.parse(stdout));
    return { ...summary, detectedAt: now().toISOString() };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("No se pudo inspeccionar el archivo multimedia.", 400, "MEDIA_PROBE_FAILED");
  } finally {
    if (directory) {
      if (dirname(resolve(directory)) !== resolve(tmpdir()) || !basename(directory).startsWith("tiktok-inspect-")) throw new Error("Unsafe temporary inspection path.");
      await rm(directory, { recursive: true, force: true });
    }
  }
}
