import res from "@/models/openai";
import { NextRequest } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Set the runtime to edge
export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { prompt }: { prompt: string } = await req.json();

  return res(prompt).toDataStreamResponse();
}
