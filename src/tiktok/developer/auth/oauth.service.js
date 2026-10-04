import { AppError } from "../../../core/errors.js";

export const TIKTOK_AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";
export const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
export const TIKTOK_LOGIN_SCOPE = "user.info.basic";

const REQUIRED_CONFIG = [
  "TIKTOK_CLIENT_KEY",
  "TIKTOK_CLIENT_SECRET",
  "TIKTOK_REDIRECT_URI"
];

export function getOauthConfig(env = process.env) {
  const missing = REQUIRED_CONFIG.filter(key => !env[key]);

  if (missing.length > 0) {
    throw new AppError(
      `TikTok Login is not configured. Missing: ${missing.join(", ")}`,
      503,
      "TIKTOK_OAUTH_NOT_CONFIGURED",
      true
    );
  }

  return {
    clientKey: env.TIKTOK_CLIENT_KEY,
    clientSecret: env.TIKTOK_CLIENT_SECRET,
    redirectUri: env.TIKTOK_REDIRECT_URI
  };
}

export function buildAuthorizationUrl({ clientKey, redirectUri, state }) {
  const url = new URL(TIKTOK_AUTHORIZE_URL);

  url.search = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: TIKTOK_LOGIN_SCOPE,
    redirect_uri: redirectUri,
    state
  }).toString();

  return url.toString();
}

export async function exchangeAuthorizationCode({
  code,
  config = getOauthConfig(),
  fetchFn = globalThis.fetch
}) {
  if (typeof code !== "string" || code.length === 0) {
    throw new AppError(
      "TikTok authorization code is required.",
      400,
      "TIKTOK_CODE_MISSING"
    );
  }

  const body = new URLSearchParams({
    client_key: config.clientKey,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri
  });

  let response;

  try {
    response = await fetchFn(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      body
    });
  } catch {
    throw new AppError(
      "TikTok token exchange could not be completed.",
      502,
      "TIKTOK_TOKEN_EXCHANGE_FAILED"
    );
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.error) {
    throw new AppError(
      "TikTok token exchange was rejected.",
      502,
      "TIKTOK_TOKEN_EXCHANGE_REJECTED"
    );
  }

  if (typeof payload.open_id !== "string" || typeof payload.scope !== "string") {
    throw new AppError(
      "TikTok token response is incomplete.",
      502,
      "TIKTOK_TOKEN_RESPONSE_INVALID"
    );
  }

  return {
    openId: payload.open_id,
    scope: payload.scope
  };
}
