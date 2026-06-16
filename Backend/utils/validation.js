/**
 * Validates password format:
 * - Length between 8 and 16 characters.
 * - At least one uppercase letter.
 * - At least one special character.
 */
const validatePassword = (password) => {
  if (!password || password.length < 8 || password.length > 16) {
    return false;
  }
  const hasUppercase = /[A-Z]/.test(password);
  // Matches typical special characters
  const hasSpecial = /[!@#$%^&*()_+=\-[\]{};':",./<>?|\\`~]/.test(password);
  
  return hasUppercase && hasSpecial;
};

/**
 * Validates standard email address format.
 */
const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validatePassword,
  validateEmail
};
