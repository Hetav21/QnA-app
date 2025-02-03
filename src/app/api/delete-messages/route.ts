"use server";

import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import mongoose from "mongoose";
import { User, getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // const messages: string[] = [];
  const messages: string[] = body.messages;

  // Extracting message id
  const messageIdArray = messages.map(
    (message) => new mongoose.Types.ObjectId(message),
  );

  // wait for db connection
  await dbConnect();

  // Extracting user session
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  // If no session found
  if (!session || !session.user) {
    return response(
      {
        success: false,
        message: "Not Authenticated",
      },
      401,
    );
  }

  try {
    // Deleting message from user's messages array
    // that are in the messageIdArray
    const result = await UserModel.updateOne(
      { _id: user._id },
      {
        $pull: { messages: { _id: { $in: messageIdArray } } },
      },
    );

    // If no changes made, then
    if (result.modifiedCount == 0) {
      return response(
        {
          success: false,
          message: "Message not found or already deleted",
        },
        404,
      );
    }

    // on success
    return response(
      {
        success: true,
        message: "Message deleted successfully",
      },
      200,
    );
  } catch (err) {
    console.error("Error in deleting messages: " + err);
    return response(
      {
        success: false,
        message: "Internal Server Error",
      },
      500,
    );
  }
}
