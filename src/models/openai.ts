import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default function res(prompt: string) {
  return streamText({
    model: openai("gpt-4o-mini"),
    prompt,
  });
}
