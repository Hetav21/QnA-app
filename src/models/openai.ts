import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { prompt } from "./prompts/default";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: "strict", // strict mode, enable when using the OpenAI API
});

export const { text } = await generateText({
  // Change model based on preference
  model: openai("gpt-4-turbo"),
  prompt,
  experimental_providerMetadata: {
    openai: {
      reasoningEffort: "low",
      maxCompletionTokens: 300,
    },
  },
});
