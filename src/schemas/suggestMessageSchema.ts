import { z } from "zod";

export const suggestMessageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters long" })
    .max(100, { message: "Content must be no longer than 100 characters" }),
});
