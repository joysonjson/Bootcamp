const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { register, login, profile } = require('../controller/auth');

router.post('/register', register);
router.post('/login', login);

router.get('/profile', protect, profile);

module.exports = router;
