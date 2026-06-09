const { body } = require("express-validator");

const changePasswordRequest = [
  body("current_password")
    .notEmpty()
    .withMessage("Current password is required"),

  body("password")
    .notEmpty()
    .withMessage("New password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("password_confirmation")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),
];

module.exports = changePasswordRequest;