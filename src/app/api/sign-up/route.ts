import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import { bcrypt } from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  // Waiting for database connection
  await dbConnect();
  try {
    const { username, email, password } = await req.body;

    // Check if username is already taken
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
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
        return res.status(401).json({
          success: false,
          message: "Email already in use",
        });
      } else {
        // email is not verified

        // Updating existing user with new password and verification code
        const hashedPassword = await bcrypt.hash(password, 10);

        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserByEmail.save();
      }
    } else {
      // If email does not exist

      // Creating new user
      const hashedPassword = await bcrypt.hash(password, 10);
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
      username,
      email,
      verifyCode,
    );

    // If email failed to send
    if (!emailResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Error sending verification email: " + emailResponse.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Error registering user: ", error);
    return res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
}
