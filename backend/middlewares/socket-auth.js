const User = require("../models/User"); 
const { UnauthorizedException } = require("../execeptions/cutsom-exception");
const { verifyToken } = require("../lib/jwt");

const authenticate = async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.warn("Socket connection rejected: No token provided");
    return next(new UnauthorizedException("Invalid token"));
  }

  try {
    const decoded = verifyToken(token);
    socket.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    console.error("Socket auth failed:", err.message);
    return next(new UnauthorizedException("Invalid token"));
  }
};

module.exports = authenticate;
