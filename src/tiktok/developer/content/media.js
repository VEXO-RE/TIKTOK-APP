import multer from "multer";

import { AppError } from "../../../core/errors.js";

export const MAX_SINGLE_CHUNK_BYTES = 64 * 1024 * 1024;

export const SUPPORTED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm"
]);

const parser = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_SINGLE_CHUNK_BYTES,
    files: 1,
    fields: 0,
    parts: 2
  },
  fileFilter(req, file, callback) {
    if (!SUPPORTED_VIDEO_TYPES.has(file.mimetype)) {
      callback(new AppError(
        "Unsupported TikTok video content type.",
        400,
        "TIKTOK_VIDEO_TYPE_UNSUPPORTED"
      ));
      return;
    }

    callback(null, true);
  }
}).single("video");

export function parseSingleVideo(req, res, next) {
  parser(req, res, error => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof AppError) {
      next(error);
      return;
    }

    if (error instanceof multer.MulterError) {
      next(new AppError(
        "Invalid video upload form.",
        400,
        error.code === "LIMIT_FILE_SIZE"
          ? "TIKTOK_VIDEO_TOO_LARGE"
          : "TIKTOK_VIDEO_FORM_INVALID"
      ));
      return;
    }

    next(new AppError(
      "Invalid video upload form.",
      400,
      "TIKTOK_VIDEO_FORM_INVALID"
    ));
  });
}

export function validateVideoFile(file) {
  if (!file || !Buffer.isBuffer(file.buffer) || file.size <= 0) {
    throw new AppError(
      "A non-empty video file is required.",
      400,
      "TIKTOK_VIDEO_REQUIRED"
    );
  }

  if (!SUPPORTED_VIDEO_TYPES.has(file.mimetype)) {
    throw new AppError(
      "Unsupported TikTok video content type.",
      400,
      "TIKTOK_VIDEO_TYPE_UNSUPPORTED"
    );
  }

  if (file.size > MAX_SINGLE_CHUNK_BYTES) {
    throw new AppError(
      "Video exceeds the single-chunk development limit.",
      400,
      "TIKTOK_VIDEO_TOO_LARGE"
    );
  }

  return {
    buffer: file.buffer,
    contentType: file.mimetype,
    size: file.size
  };
}
