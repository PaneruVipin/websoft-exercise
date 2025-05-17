var express = require('express');
const authenticate = require('../middlewares/api-auth');
const { get_threads, get_messages_with_user, markThreadAsRead } = require('../controllers/mesage');
var router = express.Router();

router.get("/thread/me", authenticate, get_threads)
router.get("/thread/:id/me", authenticate, get_messages_with_user)
router.post("/thread/mark-as-read", authenticate, markThreadAsRead)
module.exports = router;