import { response } from "@/lib/response";
import { prompt } from "@/static/prompts/default";
import { get_worker_ai } from "@/models/workers-ai";
import { ModelsResponse } from "@/types/ModelsResponse";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Set the runtime to edge
export const runtime = "edge";

export async function GET() {
  try {
    // TODO: Return text based on model selection
    // Depending on given apis and model selected by user
    const res: ModelsResponse = await get_worker_ai(prompt);

    if (res.success) {
      return response(
        {
          success: true,
          message: "Messages suggested successfully",
          data: {
            text: res.text,
          },
        },
        200,
      );
    } else {
      return response(
        {
          success: false,
          message: "Error getting messages",
        },
        500,
      );
    }
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
