const prisma = require("../config/database");
const OtpService = require("../services/otpService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class OtpController {
  constructor() {
    this.register = this.register.bind(this);
    this.sendOtp = this.sendOtp.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
    this.verifyUser = this.verifyUser.bind(this);
    this.login = this.login.bind(this);
    this._storeFcmToken = this._storeFcmToken.bind(this);
  }

  /**
   * STEP 1: Register a new user
   * POST /api/auth/register
   * Body: { name, email, mobile, password, confirm_password }
   */
  async register(req, res) {
    try {
      const { name, email, mobile, password, confirm_password, fcm_token, device_type, app_type } = req.body || {};

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

      await this._storeFcmToken(user.id, fcm_token, device_type, app_type);

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
      const { mobile } = req.body || {};

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
      const { mobile, otp, fcm_token, device_type, app_type } = req.body || {};

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

      await this._storeFcmToken(user.id, fcm_token, device_type, app_type);

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

  /**
   * Verify User Existence (by email or mobile)
   * GET /api/auth/verify-user?type=mobile&value=9168242849
   */
  async verifyUser(req, res) {
    try {
      const { type, value } = req.query;

      if (!type || !value) {
        return res.status(400).json({
          success: false,
          message: "Validation failed: type and value are required"
        });
      }

      let user = null;

      if (type === 'email') {
        user = await prisma.user.findFirst({ where: { email: value } });
      } else if (type === 'mobile') {
        const sanitizedMobile = OtpService.sanitizeMobile(value);
        user = await prisma.user.findFirst({ where: { mobile: sanitizedMobile } });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid type. Must be 'email' or 'mobile'"
        });
      }

      const exists = user !== null;

      const responseData = {
        exists,
        is_registered: exists,
        type,
        value
      };

      if (exists) {
        return res.json({
          success: true,
          message: "User found",
          data: responseData
        });
      } else {
        // According to original PHP behavior, it just returns json response with false status
        return res.json({
          success: false,
          message: "User not found",
          data: responseData
        });
      }

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  /**
   * Traditional Login with Password
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      // Support both query params and body, though body is standard for POST
      const mobile = req.body?.mobile || req.query?.mobile;
      const password = req.body?.password || req.query?.password;
      const fcm_token = req.body?.fcm_token || req.query?.fcm_token;
      const device_type = req.body?.device_type || req.query?.device_type;
      const app_type = req.body?.app_type || req.query?.app_type;

      if (!mobile || !password) {
        return res.status(400).json({
          success: false,
          message: "Mobile and password are required"
        });
      }

      const sanitizedMobile = OtpService.sanitizeMobile(mobile);

      const user = await prisma.user.findUnique({
        where: { mobile: sanitizedMobile }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found. Please register first."
        });
      }

      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: "Account does not have a password set. Please use OTP login."
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      }

      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, mobile: user.mobile },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "30d" }
      );

      await this._storeFcmToken(user.id, fcm_token, device_type, app_type);

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
        message: "Internal server error"
      });
    }
  }

  async _storeFcmToken(userId, fcmToken, deviceType, appType) {
    if (!fcmToken) return;

    try {
      const existing = await prisma.userFcmToken.findFirst({
        where: { fcm_token: fcmToken }
      });

      if (existing) {
        if (existing.user_id !== userId || existing.app_type !== appType || existing.device_type !== deviceType) {
          await prisma.userFcmToken.update({
            where: { id: existing.id },
            data: {
              user_id: userId,
              app_type: appType,
              device_type: deviceType
            }
          });
        }
      } else {
        await prisma.userFcmToken.create({
          data: {
            user_id: userId,
            fcm_token: fcmToken,
            device_type: deviceType,
            app_type: appType
          }
        });
      }
    } catch (error) {
      console.error("Error storing FCM token:", error);
    }
  }
}

module.exports = new OtpController();