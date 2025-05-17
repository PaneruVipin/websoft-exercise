const { UnauthorizedException } = require("../execeptions/cutsom-exception");
const jwt = require("jsonwebtoken");
const generateToken = (user) => {
  const payload = {
    id: user._id,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
      throw new UnauthorizedException("Invalid token");
  }
};

module.exports = {
    generateToken,
    verifyToken
}