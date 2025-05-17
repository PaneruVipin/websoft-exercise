var express = require('express');
const authenticate = require('../middlewares/api-auth');
var router = express.Router();

router.get('/me',authenticate, (req, res) => {
  const user = req.user;
  if (!user) {
    throw new UnauthorizedException('User not found');
  }
  res.json(user);
});

module.exports = router;
