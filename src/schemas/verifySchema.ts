import { verifyCodeRegex } from "@/lib/regex";
import { z } from "zod";

export const verifySchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 characters")
    .regex(verifyCodeRegex, "Code only contains digits"),
});
