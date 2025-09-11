const express = require('express');
const router = express.Router();
const {
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    resetPassword,
    resendPasswordResetOTP
} = require('../controllers/ForgotPasswordController');

// @route   POST /api/auth/forgot-password/send-otp
// @desc    Send OTP for password reset
// @access  Public
router.post('/send-otp', sendPasswordResetOTP);

// @route   POST /api/auth/forgot-password/verify-otp
// @desc    Verify OTP for password reset
// @access  Public
router.post('/verify-otp', verifyPasswordResetOTP);

// @route   POST /api/auth/forgot-password/reset
// @desc    Reset password after OTP verification
// @access  Public
router.post('/reset', resetPassword);

// @route   POST /api/auth/forgot-password/resend-otp
// @desc    Resend OTP for password reset
// @access  Public
router.post('/resend-otp', resendPasswordResetOTP);

module.exports = router;
