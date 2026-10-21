import { AppError } from "../../../core/errors.js";
import { logger } from "../../../core/logger.js";

export const TIKTOK_UPLOAD_INIT_URL =
  "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/";
export const TIKTOK_STATUS_URL =
  "https://open.tiktokapis.com/v2/post/publish/status/fetch/";

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function assertTikTokSuccess(response, payload, code) {
  if (
    !response.ok ||
    !payload ||
    !payload.error ||
    payload.error.code !== "ok"
  ) {
    throw new AppError(
      "TikTok Content Posting request was rejected.",
      502,
      code
    );
  }
}

export async function initializeVideoUpload({
  accessToken,
  videoSize,
  fetchFn = globalThis.fetch
}) {
  let response;

  try {
    response = await fetchFn(TIKTOK_UPLOAD_INIT_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videoSize,
          chunk_size: videoSize,
          total_chunk_count: 1
        }
      })
    });
  } catch {
    throw new AppError(
      "TikTok upload initialization could not be completed.",
      502,
      "TIKTOK_UPLOAD_INIT_FAILED"
    );
  }

  const payload = await readJson(response);
  assertTikTokSuccess(response, payload, "TIKTOK_UPLOAD_INIT_REJECTED");

  const publishId = payload.data?.publish_id;
  const uploadUrl = payload.data?.upload_url;

  if (typeof publishId !== "string" || publishId.length === 0) {
    throw new AppError(
      "TikTok upload initialization response is incomplete.",
      502,
      "TIKTOK_PUBLISH_ID_REQUIRED"
    );
  }

  if (typeof uploadUrl !== "string" || uploadUrl.length === 0) {
    throw new AppError(
      "TikTok upload initialization response is incomplete.",
      502,
      "TIKTOK_UPLOAD_URL_REQUIRED"
    );
  }

  let parsedUploadUrl;

  try {
    parsedUploadUrl = new URL(uploadUrl);
  } catch {
    parsedUploadUrl = null;
  }

  if (!parsedUploadUrl || parsedUploadUrl.protocol !== "https:") {
    throw new AppError(
      "TikTok upload URL is invalid.",
      502,
      "TIKTOK_UPLOAD_URL_INVALID"
    );
  }

  return { publishId, uploadUrl };
}

export async function putVideo({
  uploadUrl,
  buffer,
  contentType,
  fetchFn = globalThis.fetch,
  sleepFn = delayMs => new Promise(resolve => setTimeout(resolve, delayMs)),
  logRejectedAttempt = diagnostics => {
    logger.warn("tiktok_video_transfer_rejected", diagnostics);
  }
}) {
  const size = buffer.length;
  const headers = {
    "content-type": contentType,
    "content-length": String(size),
    "content-range": `bytes 0-${size - 1}/${size}`
  };

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let response;

    try {
      response = await fetchFn(uploadUrl, {
        method: "PUT",
        headers,
        body: buffer
      });
    } catch {
      throw new AppError(
        "TikTok video transfer could not be completed.",
        502,
        "TIKTOK_VIDEO_TRANSFER_FAILED"
      );
    }

    if (response.status === 201) {
      return;
    }

    let providerErrorCode;

    try {
      const payload = await response.clone().json();
      const candidate = payload?.error?.code ?? payload?.code ?? payload?.error;

      if (
        typeof candidate === "string" &&
        /^[A-Za-z0-9_.:-]{1,100}$/.test(candidate)
      ) {
        providerErrorCode = candidate;
      }
    } catch {
      providerErrorCode = undefined;
    }

    const responseContentRange = response.headers.get("content-range");
    const safeContentRange =
      typeof responseContentRange === "string" &&
      /^bytes\s+\d+-\d+\/\d+$/i.test(responseContentRange)
        ? responseContentRange
        : undefined;
    const safeStatusText =
      typeof response.statusText === "string" &&
      /^[A-Za-z0-9 ._():-]{0,100}$/.test(response.statusText)
        ? response.statusText
        : "";
    const transferDiagnostics = {
      attempt,
      httpStatus: response.status,
      statusText: safeStatusText,
      ...(safeContentRange
        ? { responseContentRange: safeContentRange }
        : {}),
      ...(providerErrorCode
        ? { providerErrorCode }
        : {})
    };

    logRejectedAttempt({
      attempt,
      httpStatus: response.status,
      statusText: safeStatusText
    });

    if (response.status >= 500 && response.status <= 599 && attempt < 3) {
      await sleepFn(attempt * 500);
      continue;
    }

    const error = new AppError(
      "TikTok video transfer was rejected.",
      502,
      "TIKTOK_VIDEO_TRANSFER_REJECTED"
    );

    error.transferDiagnostics = transferDiagnostics;

    throw error;
  }
}

export async function getPostStatus({
  accessToken,
  publishId,
  fetchFn = globalThis.fetch
}) {
  let response;

  try {
    response = await fetchFn(TIKTOK_STATUS_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({ publish_id: publishId })
    });
  } catch {
    throw new AppError(
      "TikTok status request could not be completed.",
      502,
      "TIKTOK_STATUS_FAILED"
    );
  }

  const payload = await readJson(response);
  assertTikTokSuccess(response, payload, "TIKTOK_STATUS_REJECTED");

  if (typeof payload.data?.status !== "string") {
    throw new AppError(
      "TikTok status response is incomplete.",
      502,
      "TIKTOK_STATUS_RESPONSE_INVALID"
    );
  }

  const result = { status: payload.data.status };

  if (typeof payload.data.fail_reason === "string") {
    result.failReason = payload.data.fail_reason;
  }

  if (Number.isSafeInteger(payload.data.uploaded_bytes)) {
    result.uploadedBytes = payload.data.uploaded_bytes;
  }

  if (
    Array.isArray(payload.data.publicaly_available_post_id) &&
    payload.data.publicaly_available_post_id.every(value =>
      typeof value === "string" || Number.isSafeInteger(value)
    )
  ) {
    result.publiclyAvailablePostIds = payload.data.publicaly_available_post_id;
  }

  return result;
}
