const express = require("express");
const router = express.Router();

const otpController = require("../controllers/otpController");

// Step 1: Register new account
router.post("/register", otpController.register);

// Step 2: Send OTP to registered mobile
router.post("/send-otp", otpController.sendOtp);

// Step 3: Verify OTP and login
router.post("/verify-otp", otpController.verifyOtp);

module.exports = router;