// src/controllers/passwordReset.controller.js

const bcrypt = require("bcryptjs");
const User = require("../models/User");
const PasswordResetToken = require("../models/PasswordResetToken");

const passwordResetService = require("../services/passwordReset.service");

// Send Reset Link
exports.sendResetLinkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const token =
      await passwordResetService.generateToken(email);

    return res.json({
      success: true,
      message: "Password reset token generated",
      token, // later send via email
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const {
      email,
      token,
      password,
      password_confirmation,
    } = req.body;

    if (password !== password_confirmation) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const tokenRecord =
      await passwordResetService.verifyToken(
        email,
        token
      );

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await user.update({
      password: hashedPassword,
    });

    await PasswordResetToken.destroy({
      where: { email },
    });

    return res.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};