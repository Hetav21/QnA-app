import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

// Sending verification code email to user
// using resend
export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
): Promise<ApiResponse> {
  try {
    const res = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Anonymous Feedback | Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    if (!res.data) {
      console.error("Failed to send verification email: " + res.error);
      return {
        success: false,
        message: "Failed to send verification email",
      };
    }

    return { success: true, message: "Verification email send successfully" };
  } catch (error) {
    console.error("Error sending verification email: ", error);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}
