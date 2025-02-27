/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password requirements
 * @param {string} password - Password to validate
 * @returns {boolean} Whether password meets requirements
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

/**
 * Gets password strength assessment
 * @param {string} password - Password to evaluate
 * @returns {{ strength: string, color: string }} Password strength details
 */
export const getPasswordStrength = (password: string): { strength: string; color: string } => {
  if (password.length < 6) return { strength: "Too short", color: "text-red-500" };
  if (password.length < 8) return { strength: "Weak", color: "text-orange-500" };
  if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return { strength: "Strong", color: "text-green-500" };
  return { strength: "Medium", color: "text-yellow-500" };
}; 