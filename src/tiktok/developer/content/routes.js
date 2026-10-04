import express from "express";

import { features } from "../../../config/features.js";
import { AppError } from "../../../core/errors.js";
import { tokenStore } from "../tokens/token.store.js";
import { parseSingleVideo, validateVideoFile } from "./media.js";
import {
  getPostStatus,
  initializeVideoUpload,
  putVideo
} from "./upload.service.js";

function requirePublishId(value) {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) {
    throw new AppError(
      "A valid TikTok publishId is required.",
      400,
      "TIKTOK_PUBLISH_ID_INVALID"
    );
  }

  return value;
}

export function createTikTokContentRouter({
  isContentUploadEnabled = () => features.tiktokContentUpload,
  isDirectPostEnabled = () => features.tiktokDirectPost,
  tokens = tokenStore,
  initialize = initializeVideoUpload,
  transfer = putVideo,
  fetchStatus = getPostStatus,
  multipart = parseSingleVideo
} = {}) {
  const router = express.Router();

  function requireUploadEnabled(req, res, next) {
    if (!isContentUploadEnabled()) {
      next(new AppError(
        "TikTok Content Upload is disabled.",
        404,
        "TIKTOK_CONTENT_UPLOAD_DISABLED"
      ));
      return;
    }

    next();
  }

  function requireConnectedToken() {
    const token = tokens.get();

    if (!token) {
      throw new AppError(
        "Connect TikTok before uploading content.",
        401,
        "TIKTOK_CONNECTION_REQUIRED"
      );
    }

    const scopes = token.scope.split(",").map(scope => scope.trim());

    if (!scopes.includes("video.upload")) {
      throw new AppError(
        "The connected TikTok user did not grant video.upload.",
        403,
        "TIKTOK_UPLOAD_SCOPE_REQUIRED"
      );
    }

    return token;
  }

  router.get("/connection", (req, res) => {
    const token = tokens.get();

    res.json({
      ok: true,
      connected: Boolean(token),
      provider: "tiktok",
      contentUploadEnabled: isContentUploadEnabled(),
      directPostEnabled: isDirectPostEnabled()
    });
  });

  router.post(
    "/upload",
    requireUploadEnabled,
    multipart,
    async (req, res, next) => {
      try {
        const token = requireConnectedToken();
        const video = validateVideoFile(req.file);
        const initialized = await initialize({
          accessToken: token.accessToken,
          videoSize: video.size
        });

        await transfer({
          uploadUrl: initialized.uploadUrl,
          buffer: video.buffer,
          contentType: video.contentType
        });

        res.json({
          ok: true,
          publishId: initialized.publishId,
          nextStep: "After upload, open TikTok Inbox to continue editing and publish."
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.post("/status", requireUploadEnabled, async (req, res, next) => {
    try {
      const token = requireConnectedToken();
      const publishId = requirePublishId(req.body?.publishId);
      const result = await fetchStatus({
        accessToken: token.accessToken,
        publishId
      });

      res.json({
        ok: true,
        publishId,
        ...result
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const tiktokContentRouter = createTikTokContentRouter();
