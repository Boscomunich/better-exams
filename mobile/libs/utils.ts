export const getApiErrorMessage = (errorCode: string | undefined) => {
  if (!errorCode) return authApiErrorMessages.UNKNOWN_ERROR;
  return authApiErrorMessages[errorCode] || authApiErrorMessages.UNKNOWN_ERROR;
};

const authApiErrorMessages: Record<string, string> = {
  REGISTER_USER_ALREADY_EXISTS:
    "This email is already registered. Please sign in instead.",
  LOGIN_BAD_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "No user found with the provided credentials.",
  INVALID_PASSWORD: "The password you entered is incorrect.",
  USER_ALREADY_VERIFIED: "Your email is already verified.",
  TOKEN_INVALID: "Invalid or expired token. Please try again.",
  FIELD_REQUIRED: "Please fill in all required fields.",
  EMAIL_NOT_VERIFIED: "Your email has not been verified yet.",
  TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};
