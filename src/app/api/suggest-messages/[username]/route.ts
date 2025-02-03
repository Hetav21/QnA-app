import rateLimit from "@/lib/limiter";
import { response } from "@/lib/response";
import res from "@/models/openai";
import { suggestMessagesRL as limit } from "@/static/rateLimits";
import { NextRequest } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Set the runtime to edge
export const runtime = "edge";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

const limiter = rateLimit({
  interval: parseInt(process.env.RL_TIME_INTERVAL!) || 60 * 1000,
  uniqueTokenPerInterval: parseInt(process.env.RL_MAX_REQUESTS!) || 500,
});

export async function POST(req: NextRequest, props: Props) {
  const params = await props.params;

  // Extracting username from url parameter
  const username = params.username;

  // Extracting prompt from request body
  const { prompt }: { prompt: string } = await req.json();

  // Extracting IP Address from request headers
  let ipAddress = req.headers.get("x-real-ip") as string;

  const forwardedFor = req.headers.get("x-forwarded-for") as string;
  if (!ipAddress && forwardedFor) {
    ipAddress = forwardedFor?.split(",").at(0) ?? "Unknown";
  }

  console.log(ipAddress);

  try {
    // Rate limiting anon user based on IP Address and username
    const { isRateLimited, usageLeft } = await limiter.check(
      `${ipAddress}_${username}_suggest-messages`,
      limit,
    );

    if (isRateLimited) {
      return response(
        {
          success: false,
          message: "Rate limit exceeded, please try again later",
        },
        429,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": usageLeft.toString(),
        },
      );
    }
  } catch (err) {
    return res(prompt).toDataStreamResponse();
  }

  return res(prompt).toDataStreamResponse();
}
