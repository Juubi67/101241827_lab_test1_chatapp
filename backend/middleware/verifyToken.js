const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const extractedToken = token.split("Bearer ")[1];

  jwt.verify(extractedToken, process.env.JWTSECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.userId = decoded.userId;
    next();
  });
};

module.exports = verifyToken;
