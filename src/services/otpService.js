const prisma = require("../config/database");

class OtpService {
  sanitizeMobile(mobile) {
    if (!mobile) return "";
    return mobile.toString().replace(/[^0-9]/g, "");
  }

  async sendOtp(mobile) {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.userOtp.create({
        data: {
          mobile,
          otp,
          expires_at: expiresAt,
        },
      });

      // In a real application, you would send the SMS here via a provider like Twilio or AWS SNS

      return {
        success: true,
        message: "OTP sent successfully",
        expires_in: 600, // seconds
      };
    } catch (error) {
      console.error("Error sending OTP:", error);
      return {
        success: false,
        message: "Failed to send OTP",
      };
    }
  }

  async verifyOtp(mobile, otp) {
    try {
      // Find the latest OTP for this mobile
      const record = await prisma.userOtp.findFirst({
        where: { mobile },
        orderBy: { createdAt: "desc" },
      });

      if (!record) {
        return { success: false, message: "No OTP found for this mobile number" };
      }

      if (record.verified_at) {
        return { success: false, message: "OTP already verified" };
      }

      if (new Date() > new Date(record.expires_at)) {
        return { success: false, message: "OTP has expired" };
      }

      if (record.otp !== otp) {
        // Increment attempts
        await prisma.userOtp.update({
          where: { id: record.id },
          data: { attempts: { increment: 1 } },
        });
        return { success: false, message: "Invalid OTP" };
      }

      // Mark verified
      await prisma.userOtp.update({
        where: { id: record.id },
        data: { verified_at: new Date() },
      });

      return { success: true, message: "OTP verified successfully" };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, message: "Failed to verify OTP" };
    }
  }
}

module.exports = new OtpService();
