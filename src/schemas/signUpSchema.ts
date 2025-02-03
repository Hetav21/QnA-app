import { emailRegex, passwordRegex, usernameRegex } from "@/static/regex";
import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(15, "Username must be at most 15 characters")
  .regex(
    usernameRegex,
    "Username must only contain letters, numbers, and underscores",
  );

export const emailValidation = z
  .string()
  .email({ message: "Invalid email address" })
  .regex(emailRegex, "Invalid email address");

export const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    passwordRegex,
    "Password must contain at least one digit, one lowercase letter, one uppercase letter",
  );

export const signUpSchema = z.object({
  username: usernameValidation,
  email: emailValidation,
  password: passwordValidation,
  cfTurnstileResponse: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});
