const validator = require('validator');

module.exports = function validateEmail(email) {
  if (!email) return false;
  return validator.isEmail(String(email).trim());
};
