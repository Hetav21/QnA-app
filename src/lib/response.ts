import { ApiResponse } from "@/types/ApiResponse";

export function response(
  msg: ApiResponse,
  status: number,
  headers?: Record<string, string>,
) {
  return Response.json(msg, { status, headers });
}
