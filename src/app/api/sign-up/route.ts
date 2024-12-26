import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import { hash } from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Waiting for database connection
  await dbConnect();
  try {
    const body = await req.json();
    const username = body.username;
    const email = body.email;
    const password = body.password;

    // Check if username is already taken
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      const res: ApiResponse = {
        success: false,
        message: "Username already taken",
      };
      return Response.json(res, { status: 401 });
    }

    const existingUserByEmail = await UserModel.findOne({
      email,
    });

    // Generating verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // If email already exists
    if (existingUserByEmail) {
      // and email is already verified
      if (existingUserByEmail.isVerified) {
        const res: ApiResponse = {
          success: false,
          message: "Email already in use",
        };
        return Response.json(res, { status: 401 });
      } else {
        // email is not verified

        // Updating existing user with new password and verification code
        const hashedPassword = await hash(password, 10);

        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserByEmail.save();
      }
    } else {
      // If email does not exist

      // Creating new user
      const hashedPassword = await hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        isVerified: false,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save();
    }

    // Sending verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode,
    );

    // If email failed to send
    if (!emailResponse.success) {
      const res: ApiResponse = {
        success: false,
        message: "Error sending verification email: " + emailResponse.message,
      };
      return Response.json(res, { status: 500 });
    }

    const res: ApiResponse = {
      success: true,
      message: "Verification email sent successfully",
    };
    return Response.json(res, { status: 200 });
  } catch (error) {
    console.error("Error registering user: ", error);
    const res: ApiResponse = {
      success: false,
      message: "Error registering user",
    };
    return Response.json(res, { status: 500 });
  }
}
