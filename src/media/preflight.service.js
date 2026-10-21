const CHECKS = Object.freeze({
  validVideo: "video-valid", duration: "editor-duration", orientation: "vertical-framing",
  resolution: "mobile-resolution", audio: "audio-track", codec: "source-codec"
});

function check(id, status, message) { return Object.freeze({ id, status, message }); }

// Local editing readiness only. TikTok validates the eventual Inbox draft itself.
export function evaluateVideoPreflight(analysis, { now = () => new Date() } = {}) {
  const video = analysis?.video;
  if (!video || !Number.isFinite(video.width) || !Number.isFinite(video.height) || !Number.isFinite(video.duration) || video.width <= 0 || video.height <= 0 || video.duration <= 0) {
    return Object.freeze({ status: "blocked", checkedAt: now().toISOString(), checks: [check(CHECKS.validVideo, "blocked", "No hay información técnica válida del video. Analiza o vuelve a cargar el archivo.")], limitation: "Este preflight es local y técnico; no confirma aceptación, revisión ni publicación por TikTok." });
  }
  const checks = [check(CHECKS.validVideo, "pass", "Se detectó una pista de video válida.")];
  checks.push(video.duration > 180 ? check(CHECKS.duration, "blocked", "El editor local no exporta videos de más de 180 segundos.") : check(CHECKS.duration, "pass", "La duración cabe en el límite del editor local."));
  checks.push(video.height > video.width ? check(CHECKS.orientation, "pass", "El video es vertical para revisión móvil.") : check(CHECKS.orientation, "warning", "El video no es vertical; revisa el encuadre antes de exportar."));
  checks.push(video.height >= 720 ? check(CHECKS.resolution, "pass", "La altura es de al menos 720 px.") : check(CHECKS.resolution, "warning", "La altura es menor de 720 px; revisa la nitidez en móvil."));
  checks.push(analysis?.audio?.present ? check(CHECKS.audio, "pass", "Se detectó al menos una pista de audio.") : check(CHECKS.audio, "warning", "No se detectó audio; agrega voz o música propia/licenciada si corresponde."));
  checks.push(video.codec === "h264" ? check(CHECKS.codec, "pass", "El origen usa H.264.") : check(CHECKS.codec, "warning", "El origen no usa H.264; la exportación local lo convertirá a MP4/H.264."));
  const status = checks.some(item => item.status === "blocked") ? "blocked" : checks.some(item => item.status === "warning") ? "review_required" : "ready";
  return Object.freeze({ status, checkedAt: now().toISOString(), checks: Object.freeze(checks), limitation: "Este preflight es local y técnico; no confirma aceptación, revisión ni publicación por TikTok." });
}
