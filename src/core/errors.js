export class AppError extends Error {
  constructor(message, status = 500, code = "INTERNAL_ERROR") {
    super(message);

    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export function errorHandler(error, req, res, next) {
  const status = Number(error.status || 500);

  res.status(status).json({
    ok: false,
    error: {
      code: error.code || "INTERNAL_ERROR",
      message:
        status >= 500
          ? "Internal server error"
          : error.message
    }
  });
}
