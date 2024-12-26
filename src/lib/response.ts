import { ApiResponse } from "@/types/ApiResponse";

export function response(msg: ApiResponse, status: number) {
  return Response.json(msg, { status });
}
