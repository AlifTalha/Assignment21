const jwt = require("jsonwebtoken");
const { User } = require("../models");

const getTokenFromRequest = (req) => {
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
};

const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = { authenticate, getTokenFromRequest };
