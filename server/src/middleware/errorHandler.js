exports.notFound = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};

exports.errorHandler = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ message });
  }
  if (err.name === "CastError") {
    return res.status(404).json({ message: "Resource not found" });
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
};