// Manejo de errores estándar
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: true,
    message: err.message || "Error interno del servidor",
  });
}

// Helper de paginación: ?page=1&limit=10
function getPagination(req) {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

module.exports = { errorHandler, getPagination };
