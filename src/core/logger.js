function entry(level, message, meta = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };
}

export const logger = {
  info(message, meta) {
    console.log(JSON.stringify(entry("info", message, meta)));
  },

  warn(message, meta) {
    console.warn(JSON.stringify(entry("warn", message, meta)));
  },

  error(message, meta) {
    console.error(JSON.stringify(entry("error", message, meta)));
  }
};
