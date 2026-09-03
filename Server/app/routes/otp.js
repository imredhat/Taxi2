const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

router.post('/api/otp/send', otpController.sendOtp);
router.post('/api/otp/verify', otpController.verifyOtp);

module.exports = router;
