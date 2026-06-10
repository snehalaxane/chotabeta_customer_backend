const prisma = require("../config/database");

class SettingsController {
  async getSettings(req, res) {
    try {
      const settings = await prisma.setting.findMany();
      
      const formattedData = settings.map(setting => {
        let parsedValue = {};
        try {
          parsedValue = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
        } catch (e) {
          parsedValue = setting.value;
        }
        return {
          variable: setting.variable,
          value: parsedValue
        };
      });

      // If the database has settings, use them. Otherwise, fallback to the default static data you provided.
      if (formattedData.length > 0) {
        return res.json({
          success: true,
          message: "Settings Fetched Successfully",
          data: formattedData
        });
      }

      // Fallback to static data if database is empty
      return res.json({
        success: true,
        message: "Settings Fetched Successfully (Defaults)",
        data: [
          {
              "variable": "system",
              "value": {
                  "appName": "Chota Beta | More Sellers. More Choices. Better Deals.",
                  "sellerSupportNumber": "8897790031",
                  "sellerSupportEmail": "sellers@chotabeta.com",
                  "systemTimezone": "India/Chennai",
                  "copyrightDetails": "© 2026 Chota Beta | All Rights Reserved.",
                  "logo": "https://superadmin.chotabeta.com/storage/settings/logo-1779430322.png",
                  "favicon": "https://superadmin.chotabeta.com/storage/settings/favicon-1779430322.png",
                  "companyAddress": "9/483-2-C, Raju Nagar Road, Y.S.R. Kadapa, Rajampet, Annamayya, Andhra Pradesh-516115",
                  "adminSignature": "https://superadmin.chotabeta.com/storage/settings/admin-signature-1779430322.png",
                  "enableThirdPartyStoreSync": false,
                  "Shopify": false,
                  "Woocommerce": false,
                  "etsy": false,
                  "systemVendorType": "multiple",
                  "checkoutType": "multi_store",
                  "minimumCartAmount": 149,
                  "maximumItemsAllowedInCart": 9999,
                  "lowStockLimit": "10",
                  "maximumDistanceToNearestStore": "",
                  "enableWallet": false,
                  "welcomeWalletBalanceAmount": 10,
                  "sellerAppMaintenanceMode": false,
                  "sellerAppMaintenanceMessage": "",
                  "webMaintenanceMode": false,
                  "webMaintenanceMessage": "",
                  "demoMode": false,
                  "adminDemoModeMessage": "",
                  "sellerDemoModeMessage": "",
                  "customerDemoModeMessage": "",
                  "customerLocationDemoModeMessage": "",
                  "deliveryBoyDemoModeMessage": "",
                  "referEarnStatus": false,
                  "referEarnMethodUser": "",
                  "referEarnBonusUser": "",
                  "referEarnMaximumBonusAmountUser": "",
                  "referEarnMethodReferral": "",
                  "referEarnBonusReferral": "",
                  "referEarnMaximumBonusAmountReferral": "",
                  "referEarnMinimumOrderAmount": "",
                  "referEarnNumberOfTimesBonus": "",
                  "currency": "INR",
                  "currencySymbol": "₹",
                  "notificationType": [
                      "general",
                      "order",
                      "payment",
                      "delivery",
                      "promotion",
                      "system",
                      "product",
                      "order_update",
                      "new_order",
                      "return_order",
                      "return_order_update",
                      "wallet_transaction",
                      "withdrawal_request",
                      "withdrawal_process",
                      "settlement_process",
                      "settlement_create",
                      "order_ready_for_pickup",
                      "return_order_available"
                  ],
                  "dataFilterEnum": [
                      "last_30_minutes",
                      "last_1_hour",
                      "last_5_hours",
                      "last_1_day",
                      "last_7_days",
                      "last_30_days",
                      "last_365_days"
                  ],
                  "orderStatusEnum": [
                      "pending",
                      "awaiting_store_response",
                      "partially_accepted",
                      "rejected_by_seller",
                      "accepted_by_seller",
                      "ready_for_pickup",
                      "assigned",
                      "preparing",
                      "out_for_delivery",
                      "delivered",
                      "cancelled",
                      "failed"
                  ]
              }
          },
          {
              "variable": "storage",
              "value": {
                  "awsRegion": "",
                  "awsBucket": "",
                  "awsAssetUrl": ""
              }
          },
          {
              "variable": "email",
              "value": {
                  "smtpHost": "mail.chotabeta.com",
                  "smtpPort": "587",
                  "smtpEmail": "info@chotabeta.com",
                  "smtpEncryption": "tls",
                  "smtpContentType": "text"
              }
          },
          {
              "variable": "payment",
              "value": {
                  "stripePayment": false,
                  "stripePaymentMode": "test",
                  "stripePublishableKey": "",
                  "stripeCurrencyCode": "USD",
                  "razorpayPayment": true,
                  "razorpayPaymentMode": "live",
                  "razorpayKeyId": "rzp_live_SxuEiwLVZdoGEt",
                  "paystackPayment": false,
                  "paystackPaymentMode": "test",
                  "paystackPublicKey": "",
                  "wallet": false,
                  "cod": true,
                  "directBankTransfer": false,
                  "bankAccountName": "",
                  "bankAccountNumber": "",
                  "bankName": "",
                  "bankCode": "",
                  "bankExtraNote": "",
                  "flutterwavePayment": false,
                  "flutterwavePaymentMode": "test",
                  "flutterwavePublicKey": "",
                  "flutterwaveCurrencyCode": "NGN",
                  "easebuzzPayment": false,
                  "easebuzzPaymentMode": "test"
              }
          },
          {
              "variable": "authentication",
              "value": {
                  "customSms": true,
                  "customSmsUrl": "https://alots.io/api/v1/sms/mt",
                  "customSmsMethod": "POST",
                  "googleRecaptchaSiteKey": "6LdsXbgsAAAAAPgkCgSFHRNILu8EtKGOEgGCTI54",
                  "firebase": true,
                  "fireBaseApiKey": "AIzaSyCnVJgVEerONZ-Ak1muSOeG3uFB61yOsm4",
                  "fireBaseAuthDomain": "chota-beta-customer.firebaseapp.com",
                  "fireBaseDatabaseURL": "https://chota-beta-customer-default-rtdb.firebaseio.com",
                  "fireBaseProjectId": "chota-beta-customer",
                  "fireBaseStorageBucket": "chota-beta-customer.firebasestorage.app",
                  "fireBaseMessagingSenderId": "569340863234",
                  "fireBaseAppId": "1:569340863234:web:28ede03b6233b8abe9581b",
                  "fireBaseMeasurementId": "G-PB27LMT6HS",
                  "appleLogin": false,
                  "googleLogin": false,
                  "facebookLogin": false,
                  "googleApiKey": "AIzaSyAKHbbax8rKjSNi0jO_yOPY5zhnm93whcg",
                  "smsGateway": "custom"
              }
          },
          {
              "variable": "notification",
              "value": {
                  "firebaseProjectId": "chota-beta-customer",
                  "userRequest": "",
                  "vapIdKey": "BOx3B5X3P5YT6gq099k7I1OlloIKfOOKXxlCpH_F8pAAewIbnOqvLZ8uEPWDn-O-nuc0divMaEqtoc0f-5Fb9Hw",
                  "notification_unread_count": 0
              }
          },
          {
              "variable": "web",
              "value": {
                  "siteName": "Chota Beta – More Sellers. More Choices. Better Deals.",
                  "customerWebUrl": "https://chotabeta.com",
                  "siteCopyright": "2026 Chota Beta. All rights reserved.",
                  "supportNumber": "8897790031",
                  "supportEmail": "support@chotabeta.com",
                  "address": "9/483-2-C, Raju Nagar Road, Y.S.R. Kadapa, Rajampet, Annamayya, Andhra Pradesh-516115",
                  "shortDescription": "Chota Beta is a dynamic multi-seller online marketplace that connects customers with trusted local and regional sellers, offering a wide range of products with better choices, competitive prices, and convenient doorstep delivery. Built under Shanaya Market Place, Chota Beta aims to simplify shopping with a seamless digital experience for customers, sellers, and delivery partners.",
                  "siteHeaderLogo": "https://superadmin.chotabeta.com/storage/settings/site-header-logo-1778782410.png?v=1781086330",
                  "siteHeaderDarkLogo": "https://superadmin.chotabeta.com/storage/settings/site-header-dark-logo-1778782410.png?v=1781086330",
                  "siteFooterLogo": "https://superadmin.chotabeta.com/storage/settings/site-footer-logo-1778782410.png?v=1781086330",
                  "siteFavicon": "https://superadmin.chotabeta.com/storage/settings/site-favicon-1778782410.png",
                  "headerScript": "",
                  "footerScript": "",
                  "googleMapKey": "AIzaSyAKHbbax8rKjSNi0jO_yOPY5zhnm93whcg",
                  "mapIframe": "",
                  "appDownloadSection": false,
                  "appSectionTitle": "",
                  "appSectionTagline": "",
                  "appSectionPlaystoreLink": "",
                  "appSectionAppstoreLink": "",
                  "appSectionShortDescription": "",
                  "facebookLink": "https://www.facebook.com/share/18MQjtYTYA/",
                  "instagramLink": "https://www.instagram.com/chotabeta.app?igsh=bGdrcXJsajBrN3d3",
                  "xLink": "",
                  "youtubeLink": "https://youtube.com/@chotabeta007?si=ALX2auAXli3VFY1N",
                  "shippingFeatureSection": "",
                  "shippingFeatureSectionTitle": "",
                  "shippingFeatureSectionDescription": "",
                  "returnFeatureSection": "",
                  "returnFeatureSectionTitle": "",
                  "returnFeatureSectionDescription": "",
                  "safetySecurityFeatureSection": "",
                  "safetySecurityFeatureSectionTitle": "",
                  "safetySecurityFeatureSectionDescription": "",
                  "supportFeatureSection": "",
                  "supportFeatureSectionTitle": "",
                  "supportFeatureSectionDescription": "",
                  "metaKeywords": "",
                  "metaDescription": "",
                  "defaultLatitude": "14.1955",
                  "defaultLongitude": "79.1603",
                  "enableCountryValidation": false,
                  "allowedCountries": [],
                  "returnRefundPolicy": "<h2>Return &amp; Refund Policy</h2>\r\n<p>Welcome to <strong>Chota Beta &ndash; More Sellers. More Choices. Better Deals.</strong><br>Chota Beta is operated by <strong>Shanaya Market Place</strong>. This Return &amp; Refund Policy explains how returns, replacements, cancellations, and refunds are handled on our platform.</p>\r\n<h3>1. Return Eligibility</h3>\r\n<p>Customers can request a return if:</p>\r\n<p>The product received is damaged, defective, expired, wrong, missing items, or different from the product description shown on the platform.</p>\r\n<p>Return requests must be raised within the allowed return period mentioned for the product/category.</p>\r\n<h3>2. Non-Returnable Products</h3>\r\n<p>Returns may not be accepted for:</p>\r\n<p>Fresh food, perishable items, personal care products, opened/used products, customized products, innerwear, hygiene-related products, and products marked as <strong>Non-Returnable</strong>.</p>\r\n<h3>3. Return Conditions</h3>\r\n<p>To qualify for return:</p>\r\n<p>The product must be unused, undamaged, and in original packaging with invoice, tags, accessories, and free items if any.</p>\r\n<h3>4. Refund Process</h3>\r\n<p>After return approval and product verification, refund will be processed to the original payment method or wallet, based on the payment mode.</p>\r\n<p>Refunds may take <strong>5&ndash;7 working days</strong> depending on bank/payment gateway processing time.</p>\r\n<h3>5. Replacement</h3>\r\n<p>If replacement is available, Chota Beta may offer replacement instead of refund for damaged, defective, or wrong products.</p>\r\n<h3>6. Cancellation</h3>\r\n<p>Orders can be cancelled before seller acceptance or dispatch. Once the order is packed, dispatched, or out for delivery, cancellation may not be allowed.</p>\r\n<h3>7. Seller Responsibility</h3>\r\n<p>Sellers are responsible for product quality, correct listing, packaging, and return/refund approval as per platform policy.</p>\r\n<h3>8. Chota Beta Rights</h3>\r\n<p>Chota Beta reserves the right to reject return/refund requests in case of misuse, false claims, used products, damaged packaging, or violation of policy.</p>\r\n<h3>9. Contact</h3>\r\n<p>For return or refund support, contact:</p>\r\n<p><strong>Email:</strong> <a href=\"mailto:support@chotabeta.com\">support@chotabeta.com</a><br><strong>Brand:</strong> Chota Beta<br><strong>Company:</strong> Shanaya Market Place</p>",
                  "shippingPolicy": "<h2>Shipping Policy</h2>\r\n<p>Welcome to <strong>Chota Beta &ndash; More Sellers. More Choices. Better Deals.</strong><br>Chota Beta is operated by <strong>Shanaya Market Place</strong>. This Shipping Policy explains how orders are processed, packed, dispatched, and delivered through our platform.</p>\r\n<h3>1. Order Processing</h3>\r\n<p>Once an order is placed, the seller will review, accept, and prepare the order for dispatch. Order processing time may vary depending on product availability, seller location, delivery area, and order volume.</p>\r\n<h3>2. Delivery Time</h3>\r\n<p>Estimated delivery time will be shown during checkout or order tracking. Delivery timelines may vary due to distance, weather conditions, traffic, seller preparation time, courier availability, or unforeseen circumstances.</p>\r\n<h3>3. Shipping Charges</h3>\r\n<p>Shipping or delivery charges, if applicable, will be displayed before order confirmation. Charges may vary based on order value, delivery location, product weight, seller location, and delivery partner availability.</p>\r\n<h3>4. Delivery Areas</h3>\r\n<p>Chota Beta delivers to selected serviceable locations. If a location is not serviceable, the customer may not be able to place an order or complete delivery for that address.</p>\r\n<h3>5. Order Tracking</h3>\r\n<p>Customers can track their order status through the Chota Beta app or website. Status updates may include order placed, seller accepted, packed, dispatched, out for delivery, and delivered.</p>\r\n<h3>6. Failed Delivery</h3>\r\n<p>Delivery may fail if the customer is unavailable, address is incorrect, phone number is unreachable, payment is pending, or the delivery location cannot be accessed. In such cases, the order may be cancelled, rescheduled, or returned as per platform policy.</p>\r\n<h3>7. Seller Responsibility</h3>\r\n<p>Sellers are responsible for proper product packing, accurate order handling, timely dispatch, and ensuring that products are handed over in good condition.</p>\r\n<h3>8. Delivery Partner Responsibility</h3>\r\n<p>Delivery partners are responsible for safe pickup and delivery of orders within the assigned route and time, while following platform guidelines.</p>\r\n<h3>9. Delays</h3>\r\n<p>Chota Beta will try to ensure timely delivery, but delays may occur due to operational, technical, weather, logistics, or local restrictions. Chota Beta shall not be liable for delays caused by events beyond reasonable control.</p>\r\n<h3>10. Contact</h3>\r\n<p>For shipping or delivery support, contact:</p>\r\n<p><strong>Email:</strong> <a href=\"mailto:support@chotabeta.com\">support@chotabeta.com</a><br><strong>Brand:</strong> Chota Beta<br><strong>Company:</strong> Shanaya Market Place</p>",
                  "privacyPolicy": "<h2>Privacy Policy</h2>\r\n<p>Welcome to <strong>Chota Beta &ndash; More Sellers. More Choices. Better Deals.</strong><br>This Privacy Policy explains how <strong>Chota Beta</strong>, operated by <strong>Shanaya Market Place</strong>, collects, uses, stores, and protects your personal information when you use our website, mobile applications, and related services.</p>\r\n<h3>1. Information We Collect</h3>\r\n<p>We may collect the following information:</p>\r\n<ul>\r\n<li>\r\n<p>Full name</p>\r\n</li>\r\n<li>\r\n<p>Mobile number</p>\r\n</li>\r\n<li>\r\n<p>Email address</p>\r\n</li>\r\n<li>\r\n<p>Delivery address</p>\r\n</li>\r\n<li>\r\n<p>Billing information</p>\r\n</li>\r\n<li>\r\n<p>Profile details</p>\r\n</li>\r\n<li>\r\n<p>Device information</p>\r\n</li>\r\n<li>\r\n<p>Location data</p>\r\n</li>\r\n<li>\r\n<p>Payment transaction details</p>\r\n</li>\r\n<li>\r\n<p>Order history</p>\r\n</li>\r\n<li>\r\n<p>Communication records</p>\r\n</li>\r\n<li>\r\n<p>Login and authentication data</p>\r\n</li>\r\n</ul>\r\n<h3>2. How We Use Your Information</h3>\r\n<p>Your information may be used for:</p>\r\n<ul>\r\n<li>\r\n<p>Account registration and login</p>\r\n</li>\r\n<li>\r\n<p>Order processing and fulfillment</p>\r\n</li>\r\n<li>\r\n<p>Delivery coordination</p>\r\n</li>\r\n<li>\r\n<p>Customer support</p>\r\n</li>\r\n<li>\r\n<p>Seller onboarding and management</p>\r\n</li>\r\n<li>\r\n<p>Payment processing</p>\r\n</li>\r\n<li>\r\n<p>Sending order updates and notifications</p>\r\n</li>\r\n<li>\r\n<p>Promotional offers and marketing communication</p>\r\n</li>\r\n<li>\r\n<p>Improving app performance and user experience</p>\r\n</li>\r\n<li>\r\n<p>Fraud prevention and security monitoring</p>\r\n</li>\r\n<li>\r\n<p>Legal and regulatory compliance</p>\r\n</li>\r\n</ul>\r\n<h3>3. Location Information</h3>\r\n<p>Chota Beta may collect location data to:</p>\r\n<ul>\r\n<li>\r\n<p>Detect nearby sellers</p>\r\n</li>\r\n<li>\r\n<p>Provide delivery services</p>\r\n</li>\r\n<li>\r\n<p>Improve delivery accuracy</p>\r\n</li>\r\n<li>\r\n<p>Show location-based services and offers</p>\r\n</li>\r\n</ul>\r\n<p>Location access is collected only with user permission.</p>\r\n<h3>4. Payment Information</h3>\r\n<p>Payment transactions are processed through secure third-party payment gateways. Chota Beta does not store complete debit/credit card details.</p>\r\n<h3>5. Sharing of Information</h3>\r\n<p>We may share information with:</p>\r\n<ul>\r\n<li>\r\n<p>Sellers for order fulfillment</p>\r\n</li>\r\n<li>\r\n<p>Delivery partners for order delivery</p>\r\n</li>\r\n<li>\r\n<p>Payment gateway providers</p>\r\n</li>\r\n<li>\r\n<p>SMS, email, OTP, and notification service providers</p>\r\n</li>\r\n<li>\r\n<p>Government or legal authorities when required</p>\r\n</li>\r\n<li>\r\n<p>Technology and infrastructure partners</p>\r\n</li>\r\n</ul>\r\n<p>We do not sell customer personal information to third parties.</p>\r\n<h3>6. Data Security</h3>\r\n<p>We implement reasonable technical and administrative security measures to protect personal information from unauthorized access, misuse, loss, or disclosure.</p>\r\n<h3>7. Cookies &amp; Tracking</h3>\r\n<p>Our website and applications may use cookies, analytics tools, and similar technologies to improve performance, remember preferences, and analyze usage behavior.</p>\r\n<h3>8. User Rights</h3>\r\n<p>Users may request to:</p>\r\n<ul>\r\n<li>\r\n<p>Access their data</p>\r\n</li>\r\n<li>\r\n<p>Update profile information</p>\r\n</li>\r\n<li>\r\n<p>Correct inaccurate information</p>\r\n</li>\r\n<li>\r\n<p>Delete account (subject to legal/business obligations)</p>\r\n</li>\r\n<li>\r\n<p>Opt out of marketing communications</p>\r\n</li>\r\n</ul>\r\n<h3>9. Third-Party Services</h3>\r\n<p>Our platform may integrate with third-party services such as:</p>\r\n<ul>\r\n<li>\r\n<p>Payment gateways</p>\r\n</li>\r\n<li>\r\n<p>Firebase</p>\r\n</li>\r\n<li>\r\n<p>SMS providers</p>\r\n</li>\r\n<li>\r\n<p>Google Maps / location services</p>\r\n</li>\r\n<li>\r\n<p>Analytics tools</p>\r\n</li>\r\n<li>\r\n<p>Social login providers</p>\r\n</li>\r\n</ul>\r\n<p>Their privacy policies may apply separately.</p>\r\n<h3>10. Children&rsquo;s Privacy</h3>\r\n<p>Chota Beta services are not intended for children under the applicable legal age without parental supervision.</p>\r\n<h3>11. Policy Updates</h3>\r\n<p>Chota Beta may update this Privacy Policy from time to time. Updated versions will be published on the website/app.</p>\r\n<h3>12. Contact Us</h3>\r\n<p>For privacy-related concerns, contact:</p>\r\n<p><strong>Brand:</strong> Chota Beta<br><strong>Company:</strong> Shanaya Market Place<br><strong>Email:</strong> <a href=\"mailto:support@chotabeta.com\">support@chotabeta.com</a><br><strong>Website:</strong> <a href=\"https://chotabeta.com/\">https://chotabeta.com</a></p>",
                  "termsCondition": "<h2>Terms &amp; Conditions</h2>\r\n<p>Welcome to <strong>Chota Beta &ndash; More Sellers. More Choices. Better Deals.</strong><br>These Terms &amp; Conditions govern your use of the <strong>Chota Beta</strong> website, mobile applications, and related services operated by <strong>Shanaya Market Place</strong>. By accessing or using our platform, you agree to these terms.</p>\r\n<h3>1. Acceptance of Terms</h3>\r\n<p>By registering, browsing, purchasing, selling, or using any Chota Beta services, you agree to comply with these Terms &amp; Conditions, Privacy Policy, Return &amp; Refund Policy, and other applicable policies.</p>\r\n<h3>2. Platform Services</h3>\r\n<p>Chota Beta is a multi-seller online marketplace that connects customers, sellers, and delivery partners for product discovery, ordering, payment processing, and delivery services.</p>\r\n<h3>3. User Accounts</h3>\r\n<p>Users must provide accurate and complete information during registration.</p>\r\n<p>Users are responsible for maintaining account confidentiality, passwords, OTP security, and all activities under their account.</p>\r\n<p>Chota Beta reserves the right to suspend or terminate accounts for misuse, fraud, suspicious activity, or policy violations.</p>\r\n<h3>4. Orders &amp; Payments</h3>\r\n<p>Orders are subject to seller acceptance, product availability, serviceability, and successful payment verification.</p>\r\n<p>Prices, offers, discounts, taxes, delivery charges, and availability may change without prior notice.</p>\r\n<p>Payments are processed through secure third-party payment gateways.</p>\r\n<p>Cash on Delivery (if available) is subject to eligibility and location support.</p>\r\n<h3>5. Seller Responsibilities</h3>\r\n<p>Sellers are responsible for:</p>\r\n<ul>\r\n<li>\r\n<p>Accurate product listings</p>\r\n</li>\r\n<li>\r\n<p>Genuine products</p>\r\n</li>\r\n<li>\r\n<p>Correct pricing</p>\r\n</li>\r\n<li>\r\n<p>Timely order processing</p>\r\n</li>\r\n<li>\r\n<p>Proper packaging</p>\r\n</li>\r\n<li>\r\n<p>Product quality</p>\r\n</li>\r\n<li>\r\n<p>Compliance with legal and marketplace policies</p>\r\n</li>\r\n</ul>\r\n<p>Chota Beta may suspend sellers for violations or customer complaints.</p>\r\n<h3>6. Delivery Services</h3>\r\n<p>Delivery timelines are estimated and may vary.</p>\r\n<p>Chota Beta and delivery partners are not responsible for delays caused by traffic, weather, customer unavailability, seller delays, or operational issues beyond reasonable control.</p>\r\n<h3>7. Returns, Refunds &amp; Cancellations</h3>\r\n<p>Returns, refunds, and cancellations are governed by the applicable platform policies.</p>\r\n<p>Approval depends on product type, seller validation, return eligibility, and policy conditions.</p>\r\n<h3>8. Prohibited Activities</h3>\r\n<p>Users must not:</p>\r\n<ul>\r\n<li>\r\n<p>Provide false information</p>\r\n</li>\r\n<li>\r\n<p>Misuse promotions or referral programs</p>\r\n</li>\r\n<li>\r\n<p>Attempt fraud or payment abuse</p>\r\n</li>\r\n<li>\r\n<p>Upload harmful or illegal content</p>\r\n</li>\r\n<li>\r\n<p>Violate intellectual property rights</p>\r\n</li>\r\n<li>\r\n<p>Attempt unauthorized access, hacking, scraping, or API misuse</p>\r\n</li>\r\n<li>\r\n<p>Use the platform for unlawful activities</p>\r\n</li>\r\n</ul>\r\n<h3>9. Intellectual Property</h3>\r\n<p>All platform content, logos, trademarks, branding, software, graphics, text, and designs belong to Chota Beta / Shanaya Market Place or respective owners and may not be copied or misused without permission.</p>\r\n<h3>10. Limitation of Liability</h3>\r\n<p>Chota Beta acts as a marketplace facilitator.</p>\r\n<p>We are not directly responsible for seller product defects, seller disputes, indirect damages, delivery delays, third-party service failures, or losses caused by misuse of the platform.</p>\r\n<h3>11. Third-Party Services</h3>\r\n<p>Our platform may integrate with payment gateways, delivery providers, maps, Firebase, social login providers, SMS gateways, and analytics services. Their separate terms may apply.</p>\r\n<h3>12. Account Suspension / Termination</h3>\r\n<p>Chota Beta reserves the right to suspend, restrict, or permanently terminate accounts, seller access, or services without prior notice for policy violations or legal concerns.</p>\r\n<h3>13. Changes to Terms</h3>\r\n<p>Chota Beta may update these Terms &amp; Conditions at any time. Continued use of the platform after updates constitutes acceptance.</p>\r\n<h3>14. Governing Law</h3>\r\n<p>These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the competent courts in Andhra Pradesh, India.</p>\r\n<h3>15. Contact Us</h3>\r\n<p><strong>Brand:</strong> Chota Beta<br><strong>Company:</strong> Shanaya Market Place<br><strong>Email:</strong> <a href=\"mailto:support@chotabeta.com\">support@chotabeta.com</a><br><strong>Website:</strong> <a href=\"https://chotabeta.com/\">https://chotabeta.com</a></p>",
                  "aboutUs": "<p><strong>Chota Beta &ndash; More Sellers. More Choices. Better Deals.</strong></p>\r\n<p>Chota Beta is a modern multi-seller marketplace operated by <strong>Shanaya Market Place</strong>, built to connect customers with trusted local and regional businesses in one easy-to-use platform.</p>\r\n<p>Our mission is to bring everyday shopping closer to customers by offering a wide range of categories including <strong>grocery, medicines, food delivery, fashion, electronics, home essentials, lifestyle products, and more</strong>. Whether customers need daily essentials, fresh food, health products, trendy fashion, or local store items, Chota Beta helps them discover more sellers, compare better choices, and enjoy convenient doorstep delivery.</p>\r\n<p>We support businesses, sellers, restaurants, pharmacies, grocery stores, fashion retailers, and local vendors by giving them a digital platform to reach more customers and grow their sales online.</p>\r\n<p>At Chota Beta, we believe in empowering local businesses while giving customers a simple, reliable, and affordable shopping experience.</p>\r\n<h3>Our Vision</h3>\r\n<p>To become a trusted digital marketplace where every customer can find nearby sellers, better products, and faster delivery in one place.</p>\r\n<h3>Our Mission</h3>\r\n<p>To help local businesses go online, increase visibility, serve more customers, and deliver products conveniently from store to door.</p>\r\n<h3>What We Offer</h3>\r\n<ul>\r\n<li>\r\n<p>Grocery and daily essentials</p>\r\n</li>\r\n<li>\r\n<p>Medicines and healthcare products</p>\r\n</li>\r\n<li>\r\n<p>Food delivery from local restaurants</p>\r\n</li>\r\n<li>\r\n<p>Fashion and lifestyle products</p>\r\n</li>\r\n<li>\r\n<p>Electronics and home needs</p>\r\n</li>\r\n<li>\r\n<p>Local store products</p>\r\n</li>\r\n<li>\r\n<p>Fast and convenient doorstep delivery</p>\r\n</li>\r\n<li>\r\n<p>More sellers, more choices, and better deals</p>\r\n</li>\r\n</ul>\r\n<p><strong>Chota Beta is built for customers, sellers, and delivery partners &mdash; creating a complete digital marketplace ecosystem.</strong></p>",
                  "pwaName": "Chota Beta",
                  "pwaDescription": "From Store to Door",
                  "pwaLogo144x144": "https://superadmin.chotabeta.com/storage/pwa_logos/pwa-logo-144x144-1778782410.png",
                  "pwaLogo192x192": "https://superadmin.chotabeta.com/storage/pwa_logos/pwa-logo-192x192-1778782410.png",
                  "pwaLogo512x512": "https://superadmin.chotabeta.com/storage/pwa_logos/pwa-logo-512x512-1778782410.png"
              }
          },
          {
              "variable": "app",
              "value": {
                  "customerAppstoreLink": "https://apps.apple.com/us/app/chota-beta-from-store-to-door/id6761712523",
                  "customerPlaystoreLink": "https://play.google.com/store/apps/details?id=com.goexperts.chotabeta&hl=en_IN",
                  "customerAppScheme": "",
                  "sellerAppstoreLink": "",
                  "sellerPlaystoreLink": "https://play.google.com/store/apps/details?id=com.goexperts.chotabetaseller&hl=en_IN",
                  "sellerAppScheme": "",
                  "appstoreLink": "",
                  "playstoreLink": "",
                  "appScheme": "",
                  "appDomainName": ""
              }
          },
          {
              "variable": "delivery_boy",
              "value": {
                  "termsCondition": "<h1 data-section-id=\"ee1ln3\" data-start=\"120\" data-end=\"163\"><span role=\"text\"><strong data-start=\"122\" data-end=\"161\">Delivery Partner Terms &amp; Conditions</strong></span></h1>\r\n<p data-start=\"164\" data-end=\"261\"><strong data-start=\"164\" data-end=\"222\">Chota Beta &ndash; More Sellers. More Choices. Better Deals.</strong><br data-start=\"222\" data-end=\"225\">Operated by <strong data-start=\"237\" data-end=\"261\">Shanaya Market Place</strong></p>\r\n<p data-start=\"263\" data-end=\"296\"><strong data-start=\"263\" data-end=\"282\">Effective Date:</strong> 29-04-2026</p>\r\n<hr data-start=\"298\" data-end=\"301\">\r\n<h2 data-section-id=\"vflf2y\" data-start=\"303\" data-end=\"325\"><span role=\"text\"><strong data-start=\"306\" data-end=\"325\">1. Introduction</strong></span></h2>\r\n<p data-start=\"327\" data-end=\"457\">These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your engagement as a Delivery Partner with Chota Beta (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).</p>\r\n<p data-start=\"459\" data-end=\"561\">By registering or performing deliveries on the platform, you agree to be legally bound by these Terms.</p>\r\n<hr data-start=\"563\" data-end=\"566\">\r\n<h2 data-section-id=\"127x7n8\" data-start=\"568\" data-end=\"598\"><span role=\"text\"><strong data-start=\"571\" data-end=\"598\">2. Nature of Engagement</strong></span></h2>\r\n<ul data-start=\"600\" data-end=\"832\">\r\n<li data-section-id=\"h895i4\" data-start=\"600\" data-end=\"664\">Delivery Partners are engaged as <strong data-start=\"635\" data-end=\"662\">independent contractors</strong></li>\r\n<li data-section-id=\"1buwwko\" data-start=\"665\" data-end=\"751\">Nothing in this agreement shall be construed as employment, partnership, or agency</li>\r\n<li data-section-id=\"1s5xz95\" data-start=\"752\" data-end=\"832\">You are responsible for your own taxes, insurance, and statutory obligations</li>\r\n</ul>\r\n<hr data-start=\"834\" data-end=\"837\">\r\n<h2 data-section-id=\"1j5xsut\" data-start=\"839\" data-end=\"860\"><span role=\"text\"><strong data-start=\"842\" data-end=\"860\">3. Eligibility</strong></span></h2>\r\n<p data-start=\"862\" data-end=\"906\">To register as a Delivery Partner, you must:</p>\r\n<ul data-start=\"908\" data-end=\"1166\">\r\n<li data-section-id=\"v2dmx6\" data-start=\"908\" data-end=\"939\">Be at least 18 years of age</li>\r\n<li data-section-id=\"10qdwjm\" data-start=\"940\" data-end=\"990\">Provide valid government-issued identification</li>\r\n<li data-section-id=\"2hnps8\" data-start=\"991\" data-end=\"1048\">Hold a valid driving license (if operating a vehicle)</li>\r\n<li data-section-id=\"1r8u55z\" data-start=\"1049\" data-end=\"1120\">Own or have authorized access to a delivery vehicle (if applicable)</li>\r\n<li data-section-id=\"uhsqoz\" data-start=\"1121\" data-end=\"1166\">Provide accurate and complete information</li>\r\n</ul>\r\n<p data-start=\"1168\" data-end=\"1243\">The Company reserves the right to verify documents and reject applications.</p>\r\n<hr data-start=\"1245\" data-end=\"1248\">\r\n<h2 data-section-id=\"1ya6wz3\" data-start=\"1250\" data-end=\"1295\"><span role=\"text\"><strong data-start=\"1253\" data-end=\"1295\">4. Onboarding &amp; Account Responsibility</strong></span></h2>\r\n<ul data-start=\"1297\" data-end=\"1465\">\r\n<li data-section-id=\"1y1myvs\" data-start=\"1297\" data-end=\"1343\">You must maintain accurate account details</li>\r\n<li data-section-id=\"nfvg2b\" data-start=\"1344\" data-end=\"1391\">Login credentials must be kept confidential</li>\r\n<li data-section-id=\"1yd6o6e\" data-start=\"1392\" data-end=\"1465\">You are responsible for all activities conducted through your account</li>\r\n</ul>\r\n<hr data-start=\"1467\" data-end=\"1470\">\r\n<h2 data-section-id=\"1e6jjpk\" data-start=\"1472\" data-end=\"1507\"><span role=\"text\"><strong data-start=\"1475\" data-end=\"1507\">5. Delivery Responsibilities</strong></span></h2>\r\n<p data-start=\"1509\" data-end=\"1545\">As a Delivery Partner, you agree to:</p>\r\n<ul data-start=\"1547\" data-end=\"1782\">\r\n<li data-section-id=\"p0mzgm\" data-start=\"1547\" data-end=\"1602\">Pick up and deliver orders within the assigned time</li>\r\n<li data-section-id=\"111t7uu\" data-start=\"1603\" data-end=\"1642\">Handle packages safely and securely</li>\r\n<li data-section-id=\"1jh6mbx\" data-start=\"1643\" data-end=\"1686\">Follow delivery instructions accurately</li>\r\n<li data-section-id=\"1xmqoog\" data-start=\"1687\" data-end=\"1729\">Verify customer identity when required</li>\r\n<li data-section-id=\"xeiyna\" data-start=\"1730\" data-end=\"1782\">Maintain professionalism during all interactions</li>\r\n</ul>\r\n<hr data-start=\"1784\" data-end=\"1787\">\r\n<h2 data-section-id=\"1m30zdp\" data-start=\"1789\" data-end=\"1814\"><span role=\"text\"><strong data-start=\"1792\" data-end=\"1814\">6. Code of Conduct</strong></span></h2>\r\n<p data-start=\"1816\" data-end=\"1829\">You must not:</p>\r\n<ul data-start=\"1831\" data-end=\"2055\">\r\n<li data-section-id=\"55xwad\" data-start=\"1831\" data-end=\"1863\">Tamper with or open packages</li>\r\n<li data-section-id=\"1qsfnku\" data-start=\"1864\" data-end=\"1911\">Misbehave with customers, sellers, or staff</li>\r\n<li data-section-id=\"osejjd\" data-start=\"1912\" data-end=\"1947\">Engage in fraudulent activities</li>\r\n<li data-section-id=\"19ulnnl\" data-start=\"1948\" data-end=\"2012\">Mark deliveries falsely (e.g., delivered when not delivered)</li>\r\n<li data-section-id=\"1tl1yjq\" data-start=\"2013\" data-end=\"2055\">Consume alcohol or drugs while on duty</li>\r\n</ul>\r\n<p data-start=\"2057\" data-end=\"2101\">Violation may lead to immediate termination.</p>\r\n<hr data-start=\"2103\" data-end=\"2106\">\r\n<h2 data-section-id=\"9r7oah\" data-start=\"2108\" data-end=\"2146\"><span role=\"text\"><strong data-start=\"2111\" data-end=\"2146\">7. Working Hours &amp; Availability</strong></span></h2>\r\n<ul data-start=\"2148\" data-end=\"2284\">\r\n<li data-section-id=\"1f09hv1\" data-start=\"2148\" data-end=\"2208\">You may choose your availability unless otherwise agreed</li>\r\n<li data-section-id=\"orvxzc\" data-start=\"2209\" data-end=\"2284\">Orders may be assigned based on availability, performance, and location</li>\r\n</ul>\r\n<hr data-start=\"2286\" data-end=\"2289\">\r\n<h2 data-section-id=\"19tkmq6\" data-start=\"2291\" data-end=\"2322\"><span role=\"text\"><strong data-start=\"2294\" data-end=\"2322\">8. Payments &amp; Incentives</strong></span></h2>\r\n<ul data-start=\"2324\" data-end=\"2550\">\r\n<li data-section-id=\"1ips3bf\" data-start=\"2324\" data-end=\"2379\">Payments are made on a per-delivery or agreed basis</li>\r\n<li data-section-id=\"m892hl\" data-start=\"2380\" data-end=\"2430\">Incentives may be offered based on performance</li>\r\n<li data-section-id=\"azsw98\" data-start=\"2431\" data-end=\"2550\">Deductions may apply for:\r\n<ul data-start=\"2461\" data-end=\"2550\">\r\n<li data-section-id=\"gzin99\" data-start=\"2461\" data-end=\"2500\">Failed deliveries due to negligence</li>\r\n<li data-section-id=\"b0xlu8\" data-start=\"2503\" data-end=\"2526\">Customer complaints</li>\r\n<li data-section-id=\"cb0ebe\" data-start=\"2529\" data-end=\"2550\">Policy violations</li>\r\n</ul>\r\n</li>\r\n</ul>\r\n<p data-start=\"2552\" data-end=\"2613\">Payment cycles and structure will be communicated separately.</p>\r\n<hr data-start=\"2615\" data-end=\"2618\">\r\n<h2 data-section-id=\"105wfu1\" data-start=\"2620\" data-end=\"2663\"><span role=\"text\"><strong data-start=\"2623\" data-end=\"2663\">9. Cancellations &amp; Failed Deliveries</strong></span></h2>\r\n<ul data-start=\"2665\" data-end=\"2837\">\r\n<li data-section-id=\"1tszzlj\" data-start=\"2665\" data-end=\"2712\">You must attempt delivery as per guidelines</li>\r\n<li data-section-id=\"1whzwqi\" data-start=\"2713\" data-end=\"2779\">Failed deliveries must be properly reported with valid reasons</li>\r\n<li data-section-id=\"1f5fbve\" data-start=\"2780\" data-end=\"2837\">Repeated failures may lead to penalties or suspension</li>\r\n</ul>\r\n<hr data-start=\"2839\" data-end=\"2842\">\r\n<h2 data-section-id=\"662wo5\" data-start=\"2844\" data-end=\"2875\"><span role=\"text\"><strong data-start=\"2847\" data-end=\"2875\">10. Equipment &amp; Expenses</strong></span></h2>\r\n<ul data-start=\"2877\" data-end=\"3013\">\r\n<li data-section-id=\"1yz0zbo\" data-start=\"2877\" data-end=\"2946\">You are responsible for your own vehicle, fuel, and mobile device</li>\r\n<li data-section-id=\"qjhg8d\" data-start=\"2947\" data-end=\"3013\">The Company is not liable for maintenance or operational costs</li>\r\n</ul>\r\n<hr data-start=\"3015\" data-end=\"3018\">\r\n<h2 data-section-id=\"1drc23w\" data-start=\"3020\" data-end=\"3050\"><span role=\"text\"><strong data-start=\"3023\" data-end=\"3050\">11. Safety &amp; Compliance</strong></span></h2>\r\n<p data-start=\"3052\" data-end=\"3065\">You agree to:</p>\r\n<ul data-start=\"3067\" data-end=\"3234\">\r\n<li data-section-id=\"16r37ao\" data-start=\"3067\" data-end=\"3110\">Follow all traffic laws and regulations</li>\r\n<li data-section-id=\"1cb1aw4\" data-start=\"3111\" data-end=\"3155\">Ensure your vehicle is in safe condition</li>\r\n<li data-section-id=\"r8lzie\" data-start=\"3156\" data-end=\"3192\">Use safety gear where applicable</li>\r\n<li data-section-id=\"1ou4806\" data-start=\"3193\" data-end=\"3234\">Comply with local laws and guidelines</li>\r\n</ul>\r\n<hr data-start=\"3236\" data-end=\"3239\">\r\n<h2 data-section-id=\"1qh0hdb\" data-start=\"3241\" data-end=\"3261\"><span role=\"text\"><strong data-start=\"3244\" data-end=\"3261\">12. Liability</strong></span></h2>\r\n<ul data-start=\"3263\" data-end=\"3434\">\r\n<li data-section-id=\"1cisqvy\" data-start=\"3263\" data-end=\"3330\">You are responsible for loss or damage caused due to negligence</li>\r\n<li data-section-id=\"xf2m0e\" data-start=\"3331\" data-end=\"3434\">The Company shall not be liable for:\r\n<ul data-start=\"3372\" data-end=\"3434\">\r\n<li data-section-id=\"nf5ih4\" data-start=\"3372\" data-end=\"3385\">Accidents</li>\r\n<li data-section-id=\"12fdl3x\" data-start=\"3388\" data-end=\"3400\">Injuries</li>\r\n<li data-section-id=\"lxrdhg\" data-start=\"3403\" data-end=\"3434\">Loss of personal belongings</li>\r\n</ul>\r\n</li>\r\n</ul>\r\n<hr data-start=\"3436\" data-end=\"3439\">\r\n<h2 data-section-id=\"11e237y\" data-start=\"3441\" data-end=\"3476\"><span role=\"text\"><strong data-start=\"3444\" data-end=\"3476\">13. Suspension &amp; Termination</strong></span></h2>\r\n<p data-start=\"3478\" data-end=\"3553\">The Company may suspend or terminate your account without prior notice for:</p>\r\n<ul data-start=\"3555\" data-end=\"3668\">\r\n<li data-section-id=\"o2itx1\" data-start=\"3555\" data-end=\"3589\">Misconduct or abusive behavior</li>\r\n<li data-section-id=\"6vt28q\" data-start=\"3590\" data-end=\"3608\">Fraud or theft</li>\r\n<li data-section-id=\"u3n2r5\" data-start=\"3609\" data-end=\"3639\">Repeated delivery failures</li>\r\n<li data-section-id=\"9nn6fm\" data-start=\"3640\" data-end=\"3668\">Violation of these Terms</li>\r\n</ul>\r\n<p data-start=\"3670\" data-end=\"3741\">You may also discontinue services at any time by notifying the Company.</p>\r\n<hr data-start=\"3743\" data-end=\"3746\">\r\n<h2 data-section-id=\"13oj91a\" data-start=\"3748\" data-end=\"3773\"><span role=\"text\"><strong data-start=\"3751\" data-end=\"3773\">14. Data &amp; Privacy</strong></span></h2>\r\n<p data-start=\"3775\" data-end=\"3865\">Your personal data will be handled in accordance with the Delivery Partner Privacy Policy.</p>\r\n<p data-start=\"3867\" data-end=\"3931\">By using the platform, you consent to data collection including:</p>\r\n<ul data-start=\"3932\" data-end=\"4032\">\r\n<li data-section-id=\"1jyifib\" data-start=\"3932\" data-end=\"3971\">Location tracking during deliveries</li>\r\n<li data-section-id=\"iia4d\" data-start=\"3972\" data-end=\"4032\">Use of information for operational and security purposes</li>\r\n</ul>\r\n<hr data-start=\"4034\" data-end=\"4037\">\r\n<h2 data-section-id=\"17k7tyx\" data-start=\"4039\" data-end=\"4065\"><span role=\"text\"><strong data-start=\"4042\" data-end=\"4065\">15. Confidentiality</strong></span></h2>\r\n<p data-start=\"4067\" data-end=\"4093\">You agree not to disclose:</p>\r\n<ul data-start=\"4094\" data-end=\"4182\">\r\n<li data-section-id=\"1lg7jds\" data-start=\"4094\" data-end=\"4118\">Customer information</li>\r\n<li data-section-id=\"jnhm2s\" data-start=\"4119\" data-end=\"4136\">Order details</li>\r\n<li data-section-id=\"1fazxxr\" data-start=\"4137\" data-end=\"4182\">Business operations or internal processes</li>\r\n</ul>\r\n<p data-start=\"4184\" data-end=\"4233\">Unauthorized disclosure may lead to legal action.</p>\r\n<hr data-start=\"4235\" data-end=\"4238\">\r\n<h2 data-section-id=\"12py65t\" data-start=\"4240\" data-end=\"4266\"><span role=\"text\"><strong data-start=\"4243\" data-end=\"4266\">16. Indemnification</strong></span></h2>\r\n<p data-start=\"4268\" data-end=\"4353\">You agree to indemnify and hold harmless the Company against any claims arising from:</p>\r\n<ul data-start=\"4354\" data-end=\"4424\">\r\n<li data-section-id=\"1t1vv6c\" data-start=\"4354\" data-end=\"4387\">Your negligence or misconduct</li>\r\n<li data-section-id=\"16bvbvq\" data-start=\"4388\" data-end=\"4424\">Violation of laws or these Terms</li>\r\n</ul>\r\n<hr data-start=\"4426\" data-end=\"4429\">\r\n<h2 data-section-id=\"q5q3mb\" data-start=\"4431\" data-end=\"4470\"><span role=\"text\"><strong data-start=\"4434\" data-end=\"4470\">17. Governing Law &amp; Jurisdiction</strong></span></h2>\r\n<p data-start=\"4472\" data-end=\"4523\">These Terms shall be governed by the laws of India.</p>\r\n<p data-start=\"4525\" data-end=\"4634\">Any disputes shall be subject to the jurisdiction of courts in <strong data-start=\"4588\" data-end=\"4633\">[Insert City, e.g., Bengaluru, Karnataka]</strong>.</p>\r\n<hr data-start=\"4636\" data-end=\"4639\">\r\n<h2 data-section-id=\"1bqd2v4\" data-start=\"4641\" data-end=\"4662\"><span role=\"text\"><strong data-start=\"4644\" data-end=\"4662\">18. Amendments</strong></span></h2>\r\n<p data-start=\"4664\" data-end=\"4806\">The Company reserves the right to modify these Terms at any time.<br data-start=\"4729\" data-end=\"4732\">Continued use of the platform constitutes acceptance of the updated Terms.</p>\r\n<hr data-start=\"4808\" data-end=\"4811\">\r\n<h2 data-section-id=\"11apmlr\" data-start=\"4813\" data-end=\"4843\"><span role=\"text\"><strong data-start=\"4816\" data-end=\"4843\">19. Contact Information</strong></span></h2>\r\n<p data-start=\"4845\" data-end=\"4939\"><strong data-start=\"4845\" data-end=\"4857\">Company:</strong> Shanaya Market Place<br data-start=\"4878\" data-end=\"4881\"><strong data-start=\"4881\" data-end=\"4891\">Brand:</strong> Chota Beta<br data-start=\"4902\" data-end=\"4905\"><strong data-start=\"4905\" data-end=\"4915\">Email:</strong> <a class=\"decorated-link cursor-pointer\" rel=\"noopener\" data-start=\"4916\" data-end=\"4937\">support@chotabeta.com</a></p>",
                  "privacyPolicy": "<h1 data-section-id=\"dwllua\" data-start=\"134\" data-end=\"173\"><span role=\"text\"><strong data-start=\"136\" data-end=\"171\">Delivery Partner Privacy Policy</strong></span></h1>\r\n<p data-start=\"174\" data-end=\"271\"><strong data-start=\"174\" data-end=\"232\">Chota Beta &ndash; More Sellers. More Choices. Better Deals.</strong><br data-start=\"232\" data-end=\"235\">Operated by <strong data-start=\"247\" data-end=\"271\">Shanaya Market Place</strong></p>\r\n<p data-start=\"273\" data-end=\"306\"><strong data-start=\"273\" data-end=\"292\">Effective Date:</strong> 29-04-2026</p>\r\n<hr data-start=\"308\" data-end=\"311\">\r\n<h2 data-section-id=\"vflf2y\" data-start=\"313\" data-end=\"335\"><span role=\"text\"><strong data-start=\"316\" data-end=\"335\">1. Introduction</strong></span></h2>\r\n<p data-start=\"337\" data-end=\"579\">This Delivery Partner Privacy Policy explains how Chota Beta (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) collects, uses, stores, and protects personal information of delivery partners (&ldquo;Delivery Partner&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) who engage with our platform.</p>\r\n<p data-start=\"581\" data-end=\"698\">By registering or working as a Delivery Partner with Chota Beta, you agree to the practices described in this Policy.</p>\r\n<hr data-start=\"700\" data-end=\"703\">\r\n<h2 data-section-id=\"78ruqh\" data-start=\"705\" data-end=\"737\"><span role=\"text\"><strong data-start=\"708\" data-end=\"737\">2. Information We Collect</strong></span></h2>\r\n<p data-start=\"739\" data-end=\"794\">We may collect the following categories of information:</p>\r\n<h3 data-section-id=\"39hsgt\" data-start=\"796\" data-end=\"827\"><span role=\"text\"><strong data-start=\"800\" data-end=\"827\">a. Personal Information</strong></span></h3>\r\n<ul data-start=\"828\" data-end=\"985\">\r\n<li data-section-id=\"apwdks\" data-start=\"828\" data-end=\"841\">Full name</li>\r\n<li data-section-id=\"1tzdck7\" data-start=\"842\" data-end=\"858\">Phone number</li>\r\n<li data-section-id=\"wk4jiq\" data-start=\"859\" data-end=\"876\">Email address</li>\r\n<li data-section-id=\"v51c0c\" data-start=\"877\" data-end=\"900\">Residential address</li>\r\n<li data-section-id=\"y682wg\" data-start=\"901\" data-end=\"918\">Date of birth</li>\r\n<li data-section-id=\"vyxl7q\" data-start=\"919\" data-end=\"985\">Government-issued ID proof (Aadhaar, PAN, Driving License, etc.)</li>\r\n</ul>\r\n<h3 data-section-id=\"l80p20\" data-start=\"987\" data-end=\"1029\"><span role=\"text\"><strong data-start=\"991\" data-end=\"1029\">b. Work &amp; Verification Information</strong></span></h3>\r\n<ul data-start=\"1030\" data-end=\"1170\">\r\n<li data-section-id=\"q44se3\" data-start=\"1030\" data-end=\"1073\">Driving license details (if applicable)</li>\r\n<li data-section-id=\"1vyumqr\" data-start=\"1074\" data-end=\"1132\">Vehicle details (registration number, type, insurance)</li>\r\n<li data-section-id=\"1tdzg2n\" data-start=\"1133\" data-end=\"1170\">Bank account details for payments</li>\r\n</ul>\r\n<h3 data-section-id=\"1ncx9ga\" data-start=\"1172\" data-end=\"1203\"><span role=\"text\"><strong data-start=\"1176\" data-end=\"1203\">c. Location Information</strong></span></h3>\r\n<ul data-start=\"1204\" data-end=\"1312\">\r\n<li data-section-id=\"1gn3ena\" data-start=\"1204\" data-end=\"1255\">Real-time GPS location during active deliveries</li>\r\n<li data-section-id=\"1u5igov\" data-start=\"1256\" data-end=\"1312\">Location history for order tracking and verification</li>\r\n</ul>\r\n<h3 data-section-id=\"uaraw7\" data-start=\"1314\" data-end=\"1344\"><span role=\"text\"><strong data-start=\"1318\" data-end=\"1344\">d. Device &amp; Usage Data</strong></span></h3>\r\n<ul data-start=\"1345\" data-end=\"1433\">\r\n<li data-section-id=\"btxcx3\" data-start=\"1345\" data-end=\"1359\">IP address</li>\r\n<li data-section-id=\"wu3p3v\" data-start=\"1360\" data-end=\"1396\">Device type and operating system</li>\r\n<li data-section-id=\"1wqvq7h\" data-start=\"1397\" data-end=\"1433\">App usage data and activity logs</li>\r\n</ul>\r\n<hr data-start=\"1435\" data-end=\"1438\">\r\n<h2 data-section-id=\"1lnvv61\" data-start=\"1440\" data-end=\"1476\"><span role=\"text\"><strong data-start=\"1443\" data-end=\"1476\">3. How We Use Your Information</strong></span></h2>\r\n<p data-start=\"1478\" data-end=\"1514\">Your information is used to:</p>\r\n<ul data-start=\"1516\" data-end=\"1866\">\r\n<li data-section-id=\"z36v3f\" data-start=\"1516\" data-end=\"1568\">Verify identity, background, and driving eligibility</li>\r\n<li data-section-id=\"hxt8c7\" data-start=\"1569\" data-end=\"1637\">Assign orders and optimize delivery routes using location data</li>\r\n<li data-section-id=\"w58r0n\" data-start=\"1638\" data-end=\"1681\">Process payments, incentives, and bonuses</li>\r\n<li data-section-id=\"r2j80x\" data-start=\"1682\" data-end=\"1756\">Communicate order updates, support messages, and platform announcements</li>\r\n<li data-section-id=\"z917k4\" data-start=\"1757\" data-end=\"1816\">Monitor performance, safety, and compliance with our Terms</li>\r\n<li data-section-id=\"8m9x1t\" data-start=\"1817\" data-end=\"1866\">Resolve disputes, complaints, or fraud prevention</li>\r\n</ul>\r\n<hr data-start=\"1868\" data-end=\"1871\">\r\n<h2 data-section-id=\"lry2h0\" data-start=\"1873\" data-end=\"1905\"><span role=\"text\"><strong data-start=\"1876\" data-end=\"1905\">4. Sharing of Information</strong></span></h2>\r\n<p data-start=\"1907\" data-end=\"1949\">We may share your data with:</p>\r\n<ul data-start=\"1951\" data-end=\"2294\">\r\n<li data-section-id=\"1l1b017\" data-start=\"1951\" data-end=\"2038\"><strong data-start=\"1951\" data-end=\"1963\">Customers:</strong> Your name, phone number, and real-time location to track their order</li>\r\n<li data-section-id=\"152e0r5\" data-start=\"2039\" data-end=\"2112\"><strong data-start=\"2039\" data-end=\"2049\">Sellers:</strong> Necessary details to coordinate order pickup</li>\r\n<li data-section-id=\"z6i32u\" data-start=\"2113\" data-end=\"2201\"><strong data-start=\"2113\" data-end=\"2133\">Service Providers:</strong> For background checks, payment processing, SMS, and mapping services</li>\r\n<li data-section-id=\"srmvte\" data-start=\"2202\" data-end=\"2294\"><strong data-start=\"2202\" data-end=\"2222\">Legal Authorities:</strong> If required for investigation, compliance, or legal obligations</li>\r\n</ul>\r\n<p data-start=\"2296\" data-end=\"2362\">We do not sell your personal data to third parties.</p>\r\n<hr data-start=\"2364\" data-end=\"2367\">\r\n<h2 data-section-id=\"f7e454\" data-start=\"2369\" data-end=\"2398\"><span role=\"text\"><strong data-start=\"2372\" data-end=\"2398\">5. Data Security &amp; Storage</strong></span></h2>\r\n<ul data-start=\"2400\" data-end=\"2641\">\r\n<li data-section-id=\"176nrm1\" data-start=\"2400\" data-end=\"2490\">We use secure systems and encryption to protect your data against unauthorized access</li>\r\n<li data-section-id=\"xolr1d\" data-start=\"2491\" data-end=\"2641\">Data is retained as long as your account is active, or as required to fulfill legal, tax, and compliance obligations after account deactivation</li>\r\n</ul>\r\n<hr data-start=\"2643\" data-end=\"2646\">\r\n<h2 data-section-id=\"q5c68o\" data-start=\"2648\" data-end=\"2668\"><span role=\"text\"><strong data-start=\"2651\" data-end=\"2668\">6. Your Rights</strong></span></h2>\r\n<p data-start=\"2670\" data-end=\"2692\">You have the right to:</p>\r\n<ul data-start=\"2694\" data-end=\"2840\">\r\n<li data-section-id=\"4q1v8o\" data-start=\"2694\" data-end=\"2748\">Access, update, or correct your personal information</li>\r\n<li data-section-id=\"148x8p6\" data-start=\"2749\" data-end=\"2840\">Request account deletion (subject to pending payments and legal retention requirements)</li>\r\n</ul>\r\n<p data-start=\"2842\" data-end=\"2934\">To request data updates or deletion, contact our support team.</p>\r\n<hr data-start=\"2936\" data-end=\"2939\">\r\n<h2 data-section-id=\"1qjofk7\" data-start=\"2941\" data-end=\"2964\"><span role=\"text\"><strong data-start=\"2944\" data-end=\"2964\">7. Policy Updates</strong></span></h2>\r\n<p data-start=\"2966\" data-end=\"3084\">We may update this Privacy Policy periodically. Significant changes will be communicated via the Delivery Partner app.</p>\r\n<hr data-start=\"3086\" data-end=\"3089\">\r\n<h2 data-section-id=\"lhmg82\" data-start=\"3091\" data-end=\"3121\"><span role=\"text\"><strong data-start=\"3094\" data-end=\"3121\">8. Contact Information</strong></span></h2>\r\n<p data-start=\"3123\" data-end=\"3220\">For any privacy-related queries, please contact:<br data-start=\"3171\" data-end=\"3174\"><strong data-start=\"3174\" data-end=\"3186\">Company:</strong> Shanaya Market Place<br data-start=\"3207\" data-end=\"3210\"><strong data-start=\"3210\" data-end=\"3220\">Brand:</strong> Chota Beta<br><strong data-start=\"3210\" data-end=\"3220\">Email:</strong> support@chotabeta.com</p>"
              }
          }
        ]
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
}

module.exports = new SettingsController();
