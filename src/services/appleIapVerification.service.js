const jwt = require("jsonwebtoken");
const axios = require("axios");
const fs = require("fs");

class AppleIapVerificationService {
  async verify(transactionId, productId, plan) {
    if (!this.productBelongsToPlan(productId, plan)) {
      return this.failure(
        "product_mismatch",
        "Apple product id does not belong to the selected plan."
      );
    }

    if (process.env.APPLE_IAP_ALLOW_UNVERIFIED === "true") {
      return this.success({
        mode: "unverified_config_override",
        transaction_id: transactionId,
        product_id: productId,
      });
    }

    if (!this.isConfigured()) {
      return this.failure(
        "apple_not_configured",
        "Apple IAP verification is not configured."
      );
    }

    try {
      const response = await axios.get(
        `${this.baseUrl()}/inApps/v1/transactions/${encodeURIComponent(
          transactionId
        )}`,
        {
          timeout: 15000,
          headers: {
            Authorization: `Bearer ${this.generateJwt()}`,
          },
        }
      );

      const payload = response.data || {};

      const transaction = this.decodeSignedPayload(
        payload.signedTransactionInfo || ""
      );

      const verifiedProductId = transaction.productId || "";

      if (verifiedProductId !== productId) {
        return this.failure(
          "product_mismatch",
          "Verified Apple product id does not match request.",
          payload
        );
      }

      if (!this.bundleMatches(transaction)) {
        return this.failure(
          "bundle_mismatch",
          "Verified Apple bundle id does not match backend configuration.",
          payload
        );
      }

      if (this.isExpired(transaction)) {
        return this.failure(
          "expired_subscription",
          "Apple subscription is expired.",
          payload
        );
      }

      return this.success({
        apple_response: payload,
        transaction,
      });
    } catch (error) {
      return this.failure(
        "apple_verification_failed",
        error.message
      );
    }
  }

  productBelongsToPlan(productId, plan) {
    if (plan.apple_product_id) {
      return productId === plan.apple_product_id;
    }

    const mapped =
      process.env[`APPLE_PLAN_${plan.id}_PRODUCT_ID`];

    if (mapped) {
      return productId === mapped;
    }

    const allowedProducts = (
      process.env.APPLE_PRODUCT_IDS || ""
    )
      .split(",")
      .map((item) => item.trim());

    if (!allowedProducts.includes(productId)) {
      return false;
    }

    const planName = (plan.name || "").toLowerCase();
    const productName = productId.toLowerCase();

    const keywords = [
      "trail",
      "trial",
      "basic",
      "standard",
      "premium",
      "enterprise",
    ];

    for (const keyword of keywords) {
      if (
        planName.includes(keyword) &&
        productName.includes(keyword)
      ) {
        return true;
      }
    }

    return false;
  }

  isConfigured() {
    return (
      process.env.APPLE_BUNDLE_ID &&
      process.env.APPLE_ISSUER_ID &&
      process.env.APPLE_KEY_ID &&
      this.privateKey()
    );
  }

  baseUrl() {
    return process.env.APPLE_ENVIRONMENT === "sandbox"
      ? "https://api.storekit-sandbox.itunes.apple.com"
      : "https://api.storekit.itunes.apple.com";
  }

  generateJwt() {
    return jwt.sign(
      {
        iss: process.env.APPLE_ISSUER_ID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 1200,
        aud: "appstoreconnect-v1",
        bid: process.env.APPLE_BUNDLE_ID,
      },
      this.privateKey(),
      {
        algorithm: "ES256",
        keyid: process.env.APPLE_KEY_ID,
      }
    );
  }

  privateKey() {
    const inline = process.env.APPLE_PRIVATE_KEY;

    if (inline) {
      return inline.replace(/\\n/g, "\n");
    }

    const filePath =
      process.env.APPLE_PRIVATE_KEY_PATH;

    if (filePath && fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }

    return null;
  }

  decodeSignedPayload(token) {
    const parts = token.split(".");

    if (parts.length < 2) {
      return {};
    }

    try {
      return JSON.parse(
        Buffer.from(parts[1], "base64").toString()
      );
    } catch {
      return {};
    }
  }

  bundleMatches(transaction) {
    const bundleId = process.env.APPLE_BUNDLE_ID;

    return (
      !bundleId ||
      String(transaction.bundleId || "") ===
        String(bundleId)
    );
  }

  isExpired(transaction) {
    const expiresDate = Number(
      transaction.expiresDate || 0
    );

    return (
      expiresDate > 0 &&
      expiresDate < Date.now()
    );
  }

  success(data) {
    return {
      success: true,
      status: "verified",
      data,
    };
  }

  failure(code, message, data = {}) {
    return {
      success: false,
      status: code,
      message,
      data,
    };
  }
}

module.exports = new AppleIapVerificationService();