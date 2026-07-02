const { AppError } = require("../utils/errors");

function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = { errorHandler };
