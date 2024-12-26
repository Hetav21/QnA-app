import { z } from "zod";
import { passwordValidation } from "./signUpSchema";

export const signInSchema = z.object({
  identifier: z.string(),
  password: passwordValidation,
});
