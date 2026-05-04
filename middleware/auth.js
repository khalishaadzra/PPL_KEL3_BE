const jwt = require("jsonwebtoken");

function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token tidak ada" });

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    if (decoded.role !== "admin") return res.status(403).json({ message: "Bukan admin" });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token tidak valid" });
  }
}

module.exports = { verifyAdmin };