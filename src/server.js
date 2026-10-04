import "dotenv/config";

import express from "express";

import { features } from "./config/features.js";
import {
  validateEnvironment,
  publicConfig
} from "./config/env.js";

import { logger } from "./core/logger.js";
import { errorHandler } from "./core/errors.js";
import { tiktokAuthRouter } from "./tiktok/developer/auth/routes.js";

validateEnvironment();

const app = express();

app.disable("x-powered-by");

app.use(express.json({
  limit: "2mb"
}));

app.use(express.urlencoded({
  extended: false
}));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "shopinistameta-tiktok-app",
    version: "0.1.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/config/status", (req, res) => {
  res.json({
    ok: true,
    config: publicConfig(),
    features
  });
});

app.use("/auth/tiktok", tiktokAuthRouter);

app.use(errorHandler);

const port = Number(process.env.PORT || 4100);

const server = app.listen(port, () => {
  logger.info("server_started", {
    port
  });
});

server.on("error", error => {
  logger.error("server_error", {
    code: error.code,
    message: error.message
  });

  process.exit(1);
});

function shutdown(signal) {
  logger.info("shutdown_started", { signal });

  server.close(() => {
    logger.info("shutdown_complete");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
