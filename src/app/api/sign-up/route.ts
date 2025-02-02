"use server";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import { signUpSchema } from "@/schemas/signUpSchema";
import { hash } from "bcryptjs";
import { validateTurnstileToken } from "next-turnstile";
import { NextRequest } from "next/server";
import { v4 } from "uuid";
import { z } from "zod";

export async function POST(req: NextRequest) {
  // Waiting for database connection
  await dbConnect();
  try {
    const body: z.infer<typeof signUpSchema> = await req.json();

    const username = body.username;
    const email = body.email;
    const password = body.password;
    const token = body.cfTurnstileResponse;

    const validationResponse = await validateTurnstileToken({
      token,
      secretKey: process.env.CF_TURNSTILE_SECRET_KEY!,
      // Idempotency key to prevent token reuse
      idempotencyKey: v4(),
      // Always returns success in development
      // Enabled by default,
      // set to false, in case testing in production
      // sandbox: false,
      sandbox: process.env.NODE_ENV === "development",
    });

    // In case of not a valid captcha
    if (!validationResponse.success) {
      return response(
        {
          success: false,
          message: "Invalid Captcha",
        },
        400,
      );
    }

    // Check if username is already taken
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return response(
        {
          success: false,
          message: "Username already taken",
        },
        401,
      );
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
        return response(
          {
            success: false,
            message: "Email already in use",
          },
          401,
        );
      } else {
        // email is not verified

        // Updating existing user with new password and verification code
        const hashedPassword = await hash(password, 10);

        existingUserByEmail.username = username;
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
      return response(
        {
          success: false,
          message: "Error sending verification email: " + emailResponse.message,
        },
        500,
      );
    }

    return response(
      {
        success: true,
        message: "Verification email sent successfully",
      },
      200,
    );
  } catch (error) {
    console.error("Error registering user: ", error);
    return response(
      {
        success: false,
        message: "Error registering user",
      },
      500,
    );
  }
}
