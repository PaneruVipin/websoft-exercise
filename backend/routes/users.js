var express = require("express");
const authenticate = require("../middlewares/api-auth");
const { get_users } = require("../controllers/users");
var router = express.Router();

router.get("/me", authenticate, (req, res) => {
  const user = req.user;
  if (!user) {
    throw new UnauthorizedException("User not found");
  }
  res.json(user);
});

router.get("/me/contacts", authenticate, get_users);

module.exports = router;
