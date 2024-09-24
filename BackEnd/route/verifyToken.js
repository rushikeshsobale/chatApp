const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || "mySecreateKey";
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization'] || req.query.token;
  if (!token) {
      return res.status(401).json({ message: "Token not provided" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.decoded = decoded; 
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: "Invalid token" });
  }
};
module.exports = verifyToken;
