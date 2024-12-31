// Sends a request to the workers ai endpoint created seprately
// need to handle cors carefully in the workers ai endpoint

import axios, { AxiosResponse } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { ModelsResponse } from "@/types/ModelsResponse";

export async function get_worker_ai(prompt: string): Promise<ModelsResponse> {
  // If env variable not set then exit the process
  if (!process.env.WORKERS_AI_URL) {
    console.log("WORKERS_AI_URL environment variable not set");
    process.exit(1);
  }

  try {
    // Send a post request to the workers ai endpoint
    const res: AxiosResponse<ApiResponse> = await axios.post(
      process.env.WORKERS_AI_URL,
      {
        prompt,
      },
    );

    if (res.data.success) {
      // If the response is successful
      const resonse: ModelsResponse = {
        success: true,
        text: res.data!.data!.text!,
      };

      return resonse;
    } else {
      // If the response is not successful
      const response: ModelsResponse = {
        success: false,
        text: "",
      };
      return response;
    }
  } catch (err) {
    // In case of failure
    console.error("Error getting worker ai: " + err);
    const response: ModelsResponse = {
      success: false,
      text: "",
    };
    return response;
  }
}
