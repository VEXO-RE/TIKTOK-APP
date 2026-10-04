import test from "node:test";
import assert from "node:assert/strict";
import express from "express";

import { errorHandler } from "../../src/core/errors.js";
import { createTikTokAuthRouter } from "../../src/tiktok/developer/auth/routes.js";
import {
  exchangeAuthorizationCode,
  TIKTOK_TOKEN_URL
} from "../../src/tiktok/developer/auth/oauth.service.js";
import { createStateStore } from "../../src/tiktok/developer/auth/state.store.js";
import { createTokenStore } from "../../src/tiktok/developer/tokens/token.store.js";

const configuredEnv = {
  TIKTOK_CLIENT_KEY: "test-client-key",
  TIKTOK_CLIENT_SECRET: "test-client-secret",
  TIKTOK_REDIRECT_URI: "https://example.test/auth/tiktok/callback"
};

async function withServer(routerOptions, run) {
  const app = express();
  app.use("/auth/tiktok", createTikTokAuthRouter(routerOptions));
  app.use(errorHandler);

  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test("feature flag disabled fails closed", async () => {
  await withServer({
    isLoginEnabled: () => false,
    env: configuredEnv
  }, async baseUrl => {
    const response = await fetch(`${baseUrl}/auth/tiktok`, {
      redirect: "manual"
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.error.code, "TIKTOK_LOGIN_DISABLED");
  });
});

test("missing OAuth environment fails clearly without secret values", async () => {
  await withServer({
    isLoginEnabled: () => true,
    env: {}
  }, async baseUrl => {
    const response = await fetch(`${baseUrl}/auth/tiktok`, {
      redirect: "manual"
    });
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.error.code, "TIKTOK_OAUTH_NOT_CONFIGURED");
    assert.match(body.error.message, /TIKTOK_CLIENT_KEY/);
  });
});

test("authorization creates a state and redirects with documented parameters", async () => {
  await withServer({
    isLoginEnabled: () => true,
    env: configuredEnv
  }, async baseUrl => {
    const response = await fetch(`${baseUrl}/auth/tiktok`, {
      redirect: "manual"
    });
    const location = new URL(response.headers.get("location"));

    assert.equal(response.status, 302);
    assert.equal(location.origin, "https://www.tiktok.com");
    assert.equal(location.pathname, "/v2/auth/authorize/");
    assert.equal(location.searchParams.get("client_key"), "test-client-key");
    assert.equal(location.searchParams.get("response_type"), "code");
    assert.equal(location.searchParams.get("scope"), "user.info.basic");
    assert.equal(
      location.searchParams.get("redirect_uri"),
      configuredEnv.TIKTOK_REDIRECT_URI
    );
    assert.ok(location.searchParams.get("state").length >= 40);
    assert.deepEqual(
      [...location.searchParams.keys()].sort(),
      ["client_key", "redirect_uri", "response_type", "scope", "state"].sort()
    );
  });
});

test("authorization requests video.upload only when Content Upload is enabled", async () => {
  await withServer({
    isLoginEnabled: () => true,
    isContentUploadEnabled: () => true,
    env: configuredEnv
  }, async baseUrl => {
    const response = await fetch(`${baseUrl}/auth/tiktok`, {
      redirect: "manual"
    });
    const location = new URL(response.headers.get("location"));

    assert.equal(
      location.searchParams.get("scope"),
      "user.info.basic,video.upload"
    );
  });
});

test("state store rejects nonexistent state", () => {
  const store = createStateStore();

  assert.deepEqual(store.consume("unknown"), {
    ok: false,
    reason: "not_found"
  });
});

test("state store expires state", () => {
  let currentTime = 1000;
  const store = createStateStore({
    ttlMs: 50,
    now: () => currentTime
  });
  const state = store.create();

  currentTime = 1050;

  assert.deepEqual(store.consume(state), {
    ok: false,
    reason: "expired"
  });
});

test("state store allows state only once", () => {
  const store = createStateStore();
  const state = store.create();

  assert.deepEqual(store.consume(state), { ok: true });
  assert.deepEqual(store.consume(state), {
    ok: false,
    reason: "not_found"
  });
});

test("callback rejects a state mismatch without exchanging code", async () => {
  let exchangeCalled = false;

  await withServer({
    isLoginEnabled: () => true,
    env: configuredEnv,
    store: createStateStore(),
    exchangeCode: async () => {
      exchangeCalled = true;
    }
  }, async baseUrl => {
    const response = await fetch(
      `${baseUrl}/auth/tiktok/callback?code=test-code&state=mismatch`
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "TIKTOK_STATE_INVALID");
    assert.equal(exchangeCalled, false);
  });
});

test("callback handles a TikTok authorization error without token exchange", async () => {
  let exchangeCalled = false;
  const store = createStateStore();
  const state = store.create();

  await withServer({
    isLoginEnabled: () => true,
    env: configuredEnv,
    store,
    exchangeCode: async () => {
      exchangeCalled = true;
    }
  }, async baseUrl => {
    const response = await fetch(
      `${baseUrl}/auth/tiktok/callback?error=access_denied&error_description=denied&state=${encodeURIComponent(state)}`
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "TIKTOK_AUTHORIZATION_ERROR");
    assert.equal(exchangeCalled, false);
    assert.doesNotMatch(JSON.stringify(body), /test-client-secret/);
    assert.deepEqual(store.consume(state), {
      ok: false,
      reason: "not_found"
    });
  });
});

test("successful callback stores the access token but never returns it", async () => {
  const store = createStateStore();
  const state = store.create();
  const tokens = createTokenStore();

  await withServer({
    isLoginEnabled: () => true,
    env: configuredEnv,
    store,
    tokens,
    exchangeCode: async () => ({
      openId: "test-open-id",
      scope: "user.info.basic,video.upload",
      accessToken: "opaque-server-only-value",
      expiresIn: 3600
    })
  }, async baseUrl => {
    const response = await fetch(
      `${baseUrl}/auth/tiktok/callback?code=test-code&state=${encodeURIComponent(state)}`
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(tokens.get().accessToken, "opaque-server-only-value");
    assert.doesNotMatch(JSON.stringify(body), /opaque-server-only-value/);
    assert.deepEqual(body, {
      ok: true,
      connected: true,
      provider: "tiktok",
      openId: "test-open-id",
      scope: "user.info.basic,video.upload"
    });
  });
});

test("token exchange uses the documented form request for server-side storage", async () => {
  let request;
  const result = await exchangeAuthorizationCode({
    code: "decoded-code",
    config: {
      clientKey: configuredEnv.TIKTOK_CLIENT_KEY,
      clientSecret: configuredEnv.TIKTOK_CLIENT_SECRET,
      redirectUri: configuredEnv.TIKTOK_REDIRECT_URI
    },
    fetchFn: async (url, options) => {
      request = { url, options };

      return new Response(JSON.stringify({
        open_id: "test-open-id",
        scope: "user.info.basic",
        access_token: "must-not-escape",
        expires_in: 86400,
        refresh_token: "must-not-escape"
      }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }
  });

  assert.equal(request.url, TIKTOK_TOKEN_URL);
  assert.equal(request.options.method, "POST");
  assert.equal(
    request.options.headers["content-type"],
    "application/x-www-form-urlencoded"
  );
  assert.deepEqual(
    [...request.options.body.keys()].sort(),
    ["client_key", "client_secret", "code", "grant_type", "redirect_uri"].sort()
  );
  assert.deepEqual(result, {
    openId: "test-open-id",
    scope: "user.info.basic",
    accessToken: "must-not-escape",
    expiresIn: 86400
  });
});
