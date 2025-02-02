"use server";

import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import { NextRequest } from "next/server";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export async function GET(req: NextRequest, props: Props) {
  const params = await props.params;

  // wait for db connection
  await dbConnect();

  // Extracting user from session
  const username = params.username;

  try {
    // Aggregation pipeline to sort the messages
    // sent to the user based on time of message creation
    const user = await UserModel.aggregate([
      { $match: { username: username } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    // If no messages found
    if (!user || user.length === 0 || user[0].messages.length === 0) {
      return response(
        {
          success: true,
          message: "No messages found",
          data: {
            messages: [],
          },
        },
        200,
      );
    }

    // on success
    return response(
      {
        success: true,
        message: "Messages found",
        data: {
          messages: user[0].messages,
        },
      },
      200,
    );
  } catch (err) {
    console.error("Error fetching messages: " + err);

    return response(
      {
        success: false,
        message: "Error fetching messages",
      },
      500,
    );
  }
}
