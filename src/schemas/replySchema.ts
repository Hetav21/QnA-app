import { z } from "zod";

// Reply only contains a string
export const replySchema = z.object({
  reply: z.string(),
});
