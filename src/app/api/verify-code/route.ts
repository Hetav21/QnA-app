"use server";

import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import { NextRequest } from "next/server";

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

    // Finding user from db
    const user = await UserModel.findOne({
      username: decodedUsername,
    });

    // If user not found
    if (!user) {
      return response(
        {
          success: false,
          message: "User not found",
        },
        404,
      );
    }

    // If user is already verified
    if (user.isVerified) {
      return response(
        {
          success: false,
          message: "User already verified",
        },
        200,
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
      );
    } else if (!isCodeNotExpired) {
      // Code expired
      return response(
        {
          success: false,
          message:
            "Verification code expired, please sign in again to get a new code",
        },
        200,
      );
    } else {
      //  Code is incorrect
      return response(
        {
          success: false,
          message: "Invalid verification code",
        },
        200,
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
    );
  }
}
