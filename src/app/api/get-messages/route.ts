import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import mongoose from "mongoose";
import { User, getServerSession } from "next-auth";

export async function GET() {
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

  // Converting the string to Mongo ObjectId
  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    // Aggregation pipeline to sort the messages
    // sent to the user based on time of message creation
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    // If no messages found
    if (!user || user.length === 0) {
      return response(
        {
          success: false,
          message: "No messages found",
        },
        401,
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
