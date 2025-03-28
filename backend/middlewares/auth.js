const jwt = require("jsonwebtoken");

const authMiddleware = (req) => {
  if (!req || !req.headers || !req.headers.authorization) {
    return { user: null };
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) return { user: null };

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return { user };
  } catch (err) {
    console.error("❌ JWT invalide :", err.message);
    return { user: null };
  }
};


module.exports = authMiddleware;
