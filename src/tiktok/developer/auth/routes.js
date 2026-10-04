import express from "express";

import { features } from "../../../config/features.js";
import { AppError } from "../../../core/errors.js";
import {
  buildAuthorizationUrl,
  exchangeAuthorizationCode,
  getOauthConfig,
  TIKTOK_LOGIN_SCOPE,
  TIKTOK_UPLOAD_SCOPE
} from "./oauth.service.js";
import { stateStore } from "./state.store.js";
import { tokenStore } from "../tokens/token.store.js";

export function createTikTokAuthRouter({
  isLoginEnabled = () => features.tiktokLogin,
  isContentUploadEnabled = () => features.tiktokContentUpload,
  env = process.env,
  store = stateStore,
  tokens = tokenStore,
  exchangeCode = exchangeAuthorizationCode
} = {}) {
  const router = express.Router();

  router.get("/", (req, res, next) => {
    try {
      if (!isLoginEnabled()) {
        throw new AppError(
          "TikTok Login is disabled.",
          404,
          "TIKTOK_LOGIN_DISABLED"
        );
      }

      const config = getOauthConfig(env);
      const state = store.create();

      res.redirect(buildAuthorizationUrl({
        clientKey: config.clientKey,
        redirectUri: config.redirectUri,
        state,
        scopes: isContentUploadEnabled()
          ? [TIKTOK_LOGIN_SCOPE, TIKTOK_UPLOAD_SCOPE]
          : [TIKTOK_LOGIN_SCOPE]
      }));
    } catch (error) {
      next(error);
    }
  });

  router.get("/callback", async (req, res, next) => {
    try {
      if (!isLoginEnabled()) {
        throw new AppError(
          "TikTok Login is disabled.",
          404,
          "TIKTOK_LOGIN_DISABLED"
        );
      }

      const stateResult = store.consume(req.query.state);

      if (!stateResult.ok) {
        const code = stateResult.reason === "expired"
          ? "TIKTOK_STATE_EXPIRED"
          : "TIKTOK_STATE_INVALID";

        throw new AppError(
          "TikTok OAuth state is invalid or expired.",
          400,
          code
        );
      }

      if (req.query.error) {
        throw new AppError(
          "TikTok authorization was not completed.",
          400,
          "TIKTOK_AUTHORIZATION_ERROR"
        );
      }

      const config = getOauthConfig(env);
      const result = await exchangeCode({
        code: req.query.code,
        config
      });

      tokens.set({
        accessToken: result.accessToken,
        openId: result.openId,
        scope: result.scope,
        expiresIn: result.expiresIn
      });

      res.json({
        ok: true,
        connected: true,
        provider: "tiktok",
        openId: result.openId,
        scope: result.scope
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const tiktokAuthRouter = createTikTokAuthRouter();
