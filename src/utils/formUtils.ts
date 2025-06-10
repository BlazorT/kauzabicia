export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
export const keepOnlyAlphanumeric = (input: string): string => {
  // Regular expression that matches any character that is NOT:
  // - a-z (lowercase letters)
  // - A-Z (uppercase letters)
  // - 0-9 (numbers)
  return input.replace(/[^a-zA-Z0-9]/g, "");
};
export const isValidMobileNumber = (input: string): boolean => {
  if (!input) return false;
  const regex = /^03\d{9}$/;
  return regex.test(input);
};

export const isSixDigitNumber = (input: string | number): boolean => {
  if (!input) return false;
  const str = input.toString();
  const regex = /^\d{6}$/;
  return regex.test(str);
};
