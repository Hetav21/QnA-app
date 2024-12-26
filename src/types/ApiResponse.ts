import { MessageInterface } from "@/model/Message";

// Standard API response format
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    isAcceptingMessages?: boolean;
    messages?: Array<MessageInterface>;
  };
}
