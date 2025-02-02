"use server";

import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";

export async function GET(request: Request) {
  // Waiting for db connection
  await dbConnect();

  try {
    // Extracting username from query params
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    // Validating username
    const result = usernameValidation.safeParse(username);

    // If username is invalid
    if (!result.success) {
      const errors = result.error.format()._errors || [];

      return response(
        {
          success: false,
          // If there are errors, join them, else show default message
          message: errors?.length > 0 ? errors.join(", ") : "Invalid username",
        },
        400,
      );
    }

    // Checking if verified username already exists
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    // Username already taken
    if (existingVerifiedUser) {
      return response(
        {
          success: false,
          message: "Username already exists",
        },
        400,
      );
    }

    // Username is available
    return response(
      {
        success: true,
        message: "Username is available",
      },
      200,
    );
  } catch (err) {
    console.error("Error checking username: ", err);

    return response(
      {
        success: false,
        message: "Internal server error",
      },
      500,
    );
  }
}
