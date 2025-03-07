const jwt = require("jsonwebtoken");
const { tokenBlacklist } = require("../utils/tokenBlacklist");

const SECRET_KEY = "your_secret_key";

/**
 * Middleware to verify JWT and check if it's blacklisted.
 */
exports.authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  if (tokenBlacklist.has(token)) {
    console.warn(`Blocked request with blacklisted token: ${token}`);
    return res.status(401).json({ error: "Unauthorized: Token has been invalidated" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};
