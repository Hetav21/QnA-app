"use server";

import dbConnect from "@/lib/dbConnect";
import rateLimit from "@/lib/limiter";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import { verifyCodeRL as limit } from "@/static/rateLimits";
import { NextRequest } from "next/server";

const limiter = rateLimit({
  interval: parseInt(process.env.RL_TIME_INTERVAL!) || 60 * 1000,
  uniqueTokenPerInterval: parseInt(process.env.RL_MAX_REQUESTS!) || 500,
});

export async function POST(req: NextRequest) {
  // Waiting for db connection
  await dbConnect();

  try {
    // Extracting username and code from request body
    const body = await req.json();
    const username = body.username;
    const code = body.code;

    // decoding username from URI
    const decodedUsername = decodeURIComponent(username);

    // Rate limiting based on username
    const { isRateLimited, usageLeft } = await limiter.check(
      `${decodedUsername}_verify-code`,
      limit,
    );

    if (isRateLimited) {
      return response(
        {
          success: false,
          message: "Rate limit exceeded, please try again later",
        },
        200,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": usageLeft.toString(),
        },
      );
    }

    // Finding user from db
    const user = await UserModel.findOne({
      username: decodedUsername,
    });

    // If user not found
    if (!user) {
      return response(
        {
          success: false,
          message: "User not found, please sign up",
        },
        200,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": usageLeft.toString(),
        },
      );
    }

    // If user is already verified
    if (user.isVerified) {
      return response(
        {
          success: false,
          message: "User already verified, please sign in",
        },
        200,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": usageLeft.toString(),
        },
      );
    }

    // Checking if code is correct and not expired
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    // If code is correct and not expired
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return response(
        {
          success: true,
          message: "User verified successfully",
        },
        200,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": usageLeft.toString(),
        },
      );
    } else if (!isCodeNotExpired) {
      // Code expired
      return response(
        {
          success: false,
          message:
            "Verification code expired, please sign up again to get a new code",
        },
        200,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": usageLeft.toString(),
        },
      );
    } else {
      //  Code is incorrect
      return response(
        {
          success: false,
          message: "Invalid verification code",
          data: {
            shouldReset: true,
          },
        },
        200,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": usageLeft.toString(),
        },
      );
    }
  } catch (err) {
    console.error("Error verifying user: ", err);

    return response(
      {
        success: false,
        message: "Error verifying user",
      },
      500,
      {
        "X-RateLimit-Limit": limit.toString(),
      },
    );
  }
}
