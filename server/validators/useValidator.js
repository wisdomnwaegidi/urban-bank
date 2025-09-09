const { check, body } = require("express-validator");

exports.registerUserValidator = [
  check("firstName").notEmpty().withMessage("First name is required"),

  check("lastName").notEmpty().withMessage("Last name is required"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),

  check("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9]{11}$/) // exactly 11 digits, numeric only
    .withMessage("Phone number must be exactly 11 digits"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];


exports.loginUserValidator = [
  check("email").isEmail().withMessage("Please enter a valid email").escape(),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .escape(),
];
