export class AppError extends Error {
  constructor(message, status = 500, code = "INTERNAL_ERROR", expose = false) {
    super(message);

    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.expose = expose;
  }
}

export function errorHandler(error, req, res, next) {
  const status = Number(error.status || 500);

  res.status(status).json({
    ok: false,
    error: {
      code: error.code || "INTERNAL_ERROR",
      message:
        status >= 500 && !error.expose
          ? "Internal server error"
          : error.message
    }
  });
}
