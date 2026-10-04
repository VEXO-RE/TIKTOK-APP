const requiredAlways = [
  "PORT"
];

export function validateEnvironment(env = process.env) {
  const missing = requiredAlways.filter(
    key => env[key] === undefined || env[key] === ""
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  const port = Number(env.PORT);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("PORT must be a valid TCP port.");
  }
}

export function publicConfig(env = process.env) {
  return {
    nodeEnv: env.NODE_ENV || "development",
    port: Number(env.PORT || 4100),
    website: env.APP_WEBSITE_URL || null
  };
}
