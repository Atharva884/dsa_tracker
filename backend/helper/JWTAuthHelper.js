const jwt = require("jsonwebtoken");
const JsonResponse = require("./JsonResponse");

exports.verifyToken = function (req, res, next) {
  try {
    let token;
    const bearerToken = req.headers["authorization"];

    if (bearerToken && bearerToken.startsWith("Bearer ")) {
      // Extract token from "Bearer token" format
      token = bearerToken.split(" ")[1];
    } else if (bearerToken) {
      // Direct token without Bearer prefix
      token = bearerToken;
    } else {
      // No authorization header
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    req.apiUser = decoded;

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};
