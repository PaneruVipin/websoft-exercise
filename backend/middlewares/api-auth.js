const jwt = require('jsonwebtoken');
const { UnauthorizedException } = require('../execeptions/cutsom-exception');
const { verifyToken } = require('../lib/jwt');
const User = require('../models/User');

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new UnauthorizedException('No token provided');
  try {
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.id);
    next();
  } catch {
    throw new UnauthorizedException('Invalid token');
  }
}

module.exports = authenticate;
