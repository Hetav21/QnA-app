import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import mongoose from "mongoose";
import { User, getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Props = {
  params: Promise<{
    messageid: string;
  }>;
};

export async function DELETE(req: NextRequest, props: Props) {
  const params = await props.params;

  // Extracting message id
  const messageId = new mongoose.Types.ObjectId(params.messageid);

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
    const result = await UserModel.updateOne(
      { _id: user._id },
      {
        $pull: { messages: { _id: messageId } },
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
