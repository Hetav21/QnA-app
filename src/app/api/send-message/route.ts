import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import { MessageInterface } from "@/model/Message";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // wait for db connection
  await dbConnect();

  // Extracting username and content from request body
  const body = await req.json();
  const username = body.username;
  const content = body.content;

  try {
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
    );
  } catch (err) {
    console.error("Error occured during sending message: " + err);
    return response(
      {
        success: false,
        message: "Internal Server Error",
      },
      500,
    );
  }
}
