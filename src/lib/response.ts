import { ApiResponse } from "@/types/ApiResponse";

export function response({ success, message }: ApiResponse, status: number) {
  return Response.json({ success, message }, { status });
}
