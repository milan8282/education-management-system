export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err.name === "CastError") {
    statusCode = 404;
    err.message = "Resource not found";
  }

  if (err.code === 11000) {
    statusCode = 400;
    err.message = "Duplicate field value entered";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    err.message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    err.message = "Token expired";
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};