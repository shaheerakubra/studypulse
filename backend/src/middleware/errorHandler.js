function notFound(_req, res) {
  res.status(404).json({
    error: "Not found",
    message: "The requested endpoint does not exist.",
  });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const isServerError = status >= 500;
  if (isServerError) {
    console.error(err);
  }
  res.status(status).json({
    error: isServerError ? "Server error" : "Request error",
    message: isServerError ? "Unexpected server error." : err.message || "Request failed.",
    details: isServerError ? undefined : err.details || undefined,
  });
}

function httpError(status, message, details) {
  const err = new Error(message);
  err.status = status;
  err.details = details;
  return err;
}

module.exports = { notFound, errorHandler, httpError };
