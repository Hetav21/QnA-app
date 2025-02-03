"use server";

import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import { MessageInterface } from "@/model/Message";
import { NextRequest } from "next/server";
import rateLimit from "@/lib/limiter";
import { sendMessageRL as limit } from "@/static/rateLimits";
import { headers } from "next/headers";

const limiter = rateLimit({
  interval: parseInt(process.env.RL_TIME_INTERVAL!) || 60 * 1000,
  uniqueTokenPerInterval: parseInt(process.env.RL_MAX_REQUESTS!) || 500,
});

export async function POST(req: NextRequest) {
  // wait for db connection
  await dbConnect();

  // Extracting username and content from request body
  const body = await req.json();
  const username = body.username;
  const content = body.content;

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
      `${ipAddress}_${username}_send-message`,
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

    // Find user by username from db
    const user = await UserModel.findOne({ username });

    // If user not found
    if (!user) {
      return response(
        {
          success: false,
          message: "User not found",
        },
        404,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": usageLeft.toString(),
        },
      );
    }

    // If user is not accepting messages
    if (!user.isAcceptingMessages) {
      return response(
        {
          success: true,
          message: "User is not accepting messages",
          data: {
            isAcceptingMessages: false,
          },
        },
        200,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": usageLeft.toString(),
        },
      );
    }

    // Create message object
    const message = { content, createdAt: new Date() };
    user.messages.push(message as MessageInterface);
    await user.save();

    // on success
    return response(
      {
        success: true,
        message: "Message sent successfully",
        data: {
          isAcceptingMessages: true,
        },
      },
      200,
      {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": usageLeft.toString(),
      },
    );
  } catch (err) {
    console.error("Error occured during sending message: " + err);
    return response(
      {
        success: false,
        message: "Internal Server Error",
      },
      500,
      {
        "X-RateLimit-Limit": limit.toString(),
      },
    );
  }
}
