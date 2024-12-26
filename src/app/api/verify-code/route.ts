import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();

    const username = body.username;
    const code = body.code;

    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({
      username: decodedUsername,
    });

    if (!user) {
      return response(
        {
          success: false,
          message: "User not found",
        },
        404,
      );
    }

    if (user.isVerified) {
      return response(
        {
          success: false,
          message: "User already verified",
        },
        400,
      );
    }

    const isCodeValid = user.verifyCode === code;

    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

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
      return response(
        {
          success: false,
          message:
            "Verification code expired, please sign in again to get a new code",
        },
        400,
      );
    } else {
      return response(
        {
          success: false,
          message: "Invalid verification code",
        },
        400,
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
