// Regex for email validation
export const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

// Regex for username validation
// Only letters, numbers, and underscores
export const usernameRegex = /^[a-zA-Z0-9_]+$/;

// Regex for password validation
// min 8 character long
// At least one digit, one lowercase letter, one uppercase letter
// Can contain special characters
export const passwordRegex =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
