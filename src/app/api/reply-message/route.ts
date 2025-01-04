import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // wait for db connection
  await dbConnect();

  // Extracting username and content from request body
  const body = await req.json();
  const username = body.username;
  const messageId = body.messageId;
  const reply = body.reply;

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

    // Find message by id
    const message = user.messages?.find(
      (message) => message._id && message._id.toString() === messageId,
    );

    // If message not found
    if (!message) {
      return response(
        {
          success: false,
          message: "Message not found",
        },
        404,
      );
    }

    // Storing reply in message
    user.messages.id(messageId).reply = reply;
    await user.save();

    // on success
    return response(
      {
        success: true,
        message: "Message sent successfully",
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
