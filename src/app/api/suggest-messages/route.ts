import { response } from "@/lib/response";
import { text } from "@/models/openai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Set the runtime to edge
export const runtime = "edge";

export async function POST() {
  try {
    // TODO: Return text based on model selection
    // Depending on given apis and model selected by user
    return response(
      {
        success: true,
        message: text,
      },
      200,
    );
  } catch (err) {
    console.error("Error suggesting messages: " + err);
    return response(
      {
        success: false,
        message: "Internal server error",
      },
      500,
    );
  }
}
