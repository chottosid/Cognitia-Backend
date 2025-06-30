// Global error handler middleware
export default function errorHandler(err, req, res, next) {
  console.error("Error:", err)

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "Duplicate entry",
      message: "A record with this information already exists",
    })
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Record not found",
      message: "The requested record does not exist",
    })
  }

  if (err.code === "P2003") {
    return res.status(400).json({
      error: "Foreign key constraint failed",
      message: "Referenced record does not exist",
    })
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      message: "The provided token is invalid",
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      message: "The provided token has expired",
    })
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      message: err.message,
    })
  }

  // Default error
  const statusCode = err.statusCode || err.status || 500
  const message = err.message || "Internal server error"

  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}
