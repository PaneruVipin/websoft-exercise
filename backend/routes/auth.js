var express = require('express');
const { login, register } = require('../controllers/auth');
var router = express.Router();

router.post('/login', login);
router.post('/register', register);
module.exports = router;