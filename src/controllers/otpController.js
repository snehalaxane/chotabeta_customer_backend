const prisma = require("../config/database");
const OtpService = require("../services/otpService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class OtpController {

  /**
   * STEP 1: Register a new user
   * POST /api/auth/register
   * Body: { name, email, mobile, password, confirm_password }
   */
  async register(req, res) {
    try {
      const { name, email, mobile, password, confirm_password } = req.body;

      // --- Validation ---
      if (!name || !email || !mobile || !password || !confirm_password) {
        return res.status(400).json({
          success: false,
          message: "All fields are required: name, email, mobile, password, confirm_password",
        });
      }

      if (password !== confirm_password) {
        return res.status(400).json({
          success: false,
          message: "Password and confirm password do not match",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      const sanitizedMobile = OtpService.sanitizeMobile(mobile);

      // --- Check if mobile already registered ---
      const existingUser = await prisma.user.findUnique({
        where: { mobile: sanitizedMobile },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Mobile number is already registered. Please login.",
        });
      }

      // --- Check if email already registered ---
      const existingEmail = await prisma.user.findFirst({
        where: { email },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered. Please login.",
        });
      }

      // --- Hash Password ---
      const hashedPassword = await bcrypt.hash(password, 10);

      // --- Create User ---
      const user = await prisma.user.create({
        data: {
          name,
          email,
          mobile: sanitizedMobile,
          password: hashedPassword,
          status: "active",
        },
      });

      return res.status(201).json({
        success: true,
        message: "Account created successfully. You can now login using your mobile number.",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
        },
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * STEP 2: Send OTP to registered mobile
   * POST /api/auth/send-otp
   * Body: { mobile }
   */
  async sendOtp(req, res) {
    try {
      const { mobile } = req.body;

      if (!mobile) {
        return res.status(400).json({
          success: false,
          message: "Validation failed: mobile is required",
        });
      }

      const sanitizedMobile = OtpService.sanitizeMobile(mobile);

      // --- Check user exists ---
      const user = await prisma.user.findUnique({
        where: { mobile: sanitizedMobile },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Mobile number is not registered. Please create an account first.",
        });
      }

      // --- Send OTP ---
      const result = await OtpService.sendOtp(sanitizedMobile);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json({
        success: true,
        message: result.message,
        data: {
          mobile,
          expires_in: result.expires_in,
        },
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * STEP 3: Verify OTP and Login
   * POST /api/auth/verify-otp
   * Body: { mobile, otp }
   */
  async verifyOtp(req, res) {
    try {
      const { mobile, otp } = req.body;

      if (!mobile || !otp) {
        return res.status(400).json({
          success: false,
          message: "Validation failed: mobile and otp are required",
        });
      }

      const sanitizedMobile = OtpService.sanitizeMobile(mobile);

      // --- Verify OTP ---
      const verification = await OtpService.verifyOtp(sanitizedMobile, otp);

      if (!verification.success) {
        return res.status(400).json(verification);
      }

      // --- Find existing user (must be registered) ---
      const user = await prisma.user.findUnique({
        where: { mobile: sanitizedMobile },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Mobile number is not registered. Please create an account first.",
        });
      }

      // --- Generate JWT Token ---
      const token = jwt.sign(
        { id: user.id, mobile: user.mobile },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "30d" }
      );

      return res.json({
        success: true,
        message: "Login successful",
        access_token: token,
        token_type: "Bearer",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          status: user.status,
        },
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new OtpController();