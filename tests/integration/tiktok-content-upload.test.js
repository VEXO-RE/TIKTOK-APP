import test from "node:test";
import assert from "node:assert/strict";
import express from "express";

import { errorHandler } from "../../src/core/errors.js";
import { createTikTokContentRouter } from "../../src/tiktok/developer/content/routes.js";
import {
  getPostStatus,
  initializeVideoUpload,
  putVideo,
  TIKTOK_STATUS_URL,
  TIKTOK_UPLOAD_INIT_URL
} from "../../src/tiktok/developer/content/upload.service.js";
import { createTokenStore } from "../../src/tiktok/developer/tokens/token.store.js";

function connectedStore() {
  const store = createTokenStore();
  store.set({
    accessToken: "opaque-access-value",
    openId: "sandbox-user",
    scope: "user.info.basic,video.upload",
    expiresIn: 3600
  });
  return store;
}

async function withServer(options, run) {
  const app = express();
  app.use(express.json());
  app.use("/api/tiktok/content", createTikTokContentRouter(options));
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

test("content upload disabled fails closed before parsing a file", async () => {
  await withServer({
    isContentUploadEnabled: () => false
  }, async baseUrl => {
    const response = await fetch(`${baseUrl}/api/tiktok/content/upload`, {
      method: "POST"
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.error.code, "TIKTOK_CONTENT_UPLOAD_DISABLED");
  });
});

test("upload rejects a missing connected token", async () => {
  const form = new FormData();
  form.set("video", new Blob(["video"], { type: "video/mp4" }), "clip.mp4");

  await withServer({
    isContentUploadEnabled: () => true,
    tokens: createTokenStore()
  }, async baseUrl => {
    const response = await fetch(`${baseUrl}/api/tiktok/content/upload`, {
      method: "POST",
      body: form
    });
    const body = await response.json();

    assert.equal(response.status, 401, JSON.stringify(body));
    assert.equal(body.error.code, "TIKTOK_CONNECTION_REQUIRED");
  });
});

test("upload rejects a missing file", async () => {
  await withServer({
    isContentUploadEnabled: () => true,
    tokens: connectedStore()
  }, async baseUrl => {
    const response = await fetch(`${baseUrl}/api/tiktok/content/upload`, {
      method: "POST",
      body: new FormData()
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "TIKTOK_VIDEO_REQUIRED");
  });
});

test("upload rejects an unsupported content type", async () => {
  const form = new FormData();
  form.set("video", new Blob(["not-video"], { type: "text/plain" }), "clip.txt");

  await withServer({
    isContentUploadEnabled: () => true,
    tokens: connectedStore()
  }, async baseUrl => {
    const response = await fetch(`${baseUrl}/api/tiktok/content/upload`, {
      method: "POST",
      body: form
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "TIKTOK_VIDEO_TYPE_UNSUPPORTED");
  });
});

test("initialization maps the official single-chunk FILE_UPLOAD request", async () => {
  let request;
  const result = await initializeVideoUpload({
    accessToken: "opaque-access-value",
    videoSize: 4194304,
    fetchFn: async (url, options) => {
      request = { url, options };
      return Response.json({
        data: {
          publish_id: "v_inbox_file~v2.test",
          upload_url: "https://open-upload.tiktokapis.com/video/?opaque=value"
        },
        error: { code: "ok", message: "", log_id: "log" }
      });
    }
  });

  assert.equal(request.url, TIKTOK_UPLOAD_INIT_URL);
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers.authorization, "Bearer opaque-access-value");
  assert.deepEqual(JSON.parse(request.options.body), {
    source_info: {
      source: "FILE_UPLOAD",
      video_size: 4194304,
      chunk_size: 4194304,
      total_chunk_count: 1
    }
  });
  assert.equal(result.publishId, "v_inbox_file~v2.test");
});

test("TikTok initialization errors are sanitized", async () => {
  await assert.rejects(
    initializeVideoUpload({
      accessToken: "opaque-access-value",
      videoSize: 1024,
      fetchFn: async () => Response.json({
        error: {
          code: "access_token_invalid",
          message: "sensitive provider detail",
          log_id: "provider-log-id"
        }
      }, { status: 401 })
    }),
    error => {
      assert.equal(error.code, "TIKTOK_UPLOAD_INIT_REJECTED");
      assert.doesNotMatch(error.message, /sensitive|provider-log-id|opaque/);
      return true;
    }
  );
});

test("initialization requires an upload URL", async () => {
  await assert.rejects(
    initializeVideoUpload({
      accessToken: "opaque-access-value",
      videoSize: 1024,
      fetchFn: async () => Response.json({
        data: { publish_id: "v_inbox_file~v2.test" },
        error: { code: "ok", message: "", log_id: "log" }
      })
    }),
    error => error.code === "TIKTOK_UPLOAD_URL_REQUIRED"
  );
});

test("PUT uses the complete upload URL and required headers", async () => {
  let request;
  const uploadUrl = "https://open-upload.tiktokapis.com/video/?opaque=value";
  const buffer = Buffer.from("video-bytes");

  await putVideo({
    uploadUrl,
    buffer,
    contentType: "video/mp4",
    fetchFn: async (url, options) => {
      request = { url, options };
      return new Response(null, { status: 201 });
    }
  });

  assert.equal(request.url, uploadUrl);
  assert.equal(request.options.method, "PUT");
  assert.equal(request.options.headers["content-type"], "video/mp4");
  assert.equal(request.options.headers["content-length"], String(buffer.length));
  assert.equal(
    request.options.headers["content-range"],
    `bytes 0-${buffer.length - 1}/${buffer.length}`
  );
  assert.equal(request.options.body, buffer);
});

test("successful upload returns publishId without token or upload URL", async () => {
  const form = new FormData();
  form.set("video", new Blob(["video"], { type: "video/mp4" }), "clip.mp4");

  await withServer({
    isContentUploadEnabled: () => true,
    tokens: connectedStore(),
    initialize: async () => ({
      publishId: "v_inbox_file~v2.safe",
      uploadUrl: "https://upload.example.test/?secret=hidden"
    }),
    transfer: async () => {}
  }, async baseUrl => {
    const response = await fetch(`${baseUrl}/api/tiktok/content/upload`, {
      method: "POST",
      body: form
    });
    const body = await response.json();
    const serialized = JSON.stringify(body);

    assert.equal(response.status, 200, JSON.stringify(body));
    assert.equal(body.publishId, "v_inbox_file~v2.safe");
    assert.doesNotMatch(serialized, /opaque-access-value|upload\.example|hidden/);
  });
});

test("status maps the official request and sanitizes documented fields", async () => {
  let request;
  const result = await getPostStatus({
    accessToken: "opaque-access-value",
    publishId: "v_inbox_file~v2.safe",
    fetchFn: async (url, options) => {
      request = { url, options };
      return Response.json({
        data: {
          status: "SEND_TO_USER_INBOX",
          uploaded_bytes: 123,
          ignored_field: "not-returned"
        },
        error: { code: "ok", message: "", log_id: "not-returned" }
      });
    }
  });

  assert.equal(request.url, TIKTOK_STATUS_URL);
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers.authorization, "Bearer opaque-access-value");
  assert.deepEqual(JSON.parse(request.options.body), {
    publish_id: "v_inbox_file~v2.safe"
  });
  assert.deepEqual(result, {
    status: "SEND_TO_USER_INBOX",
    uploadedBytes: 123
  });
});

test("Direct Post remains disabled in the connection status", async () => {
  await withServer({
    isContentUploadEnabled: () => false,
    isDirectPostEnabled: () => false,
    tokens: connectedStore()
  }, async baseUrl => {
    const response = await fetch(`${baseUrl}/api/tiktok/content/connection`);
    const body = await response.json();

    assert.equal(body.directPostEnabled, false);
    assert.equal(body.contentUploadEnabled, false);
  });
});

test("development token store expires and clears the in-memory token", () => {
  let currentTime = 1000;
  const store = createTokenStore({ now: () => currentTime });
  store.set({
    accessToken: "opaque-access-value",
    openId: "sandbox-user",
    scope: "user.info.basic,video.upload",
    expiresIn: 1
  });

  assert.equal(store.get().openId, "sandbox-user");
  currentTime = 2000;
  assert.equal(store.get(), null);
});
