import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import { User, getServerSession } from "next-auth";
import { NextRequest } from "next/server";

// Route to update user's message acceptance status
export async function POST(req: NextRequest) {
  // wait for db connection
  await dbConnect();

  // Extracting user session
  const session = await getServerSession(authOptions);

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

  // Extracting user from session
  const user = session?.user;

  // Extracting user id, stringified mongo id
  const userId = user._id;

  const body = await req.json();
  const acceptMessages = body.acceptMessages;

  try {
    // Update user's message acceptance status
    const updatedUser = await UserModel.findByIdAndUpdate(userId, {
      isAcceptingMessages: acceptMessages,
    });

    // If user not found, failed to update user status
    if (!updatedUser) {
      return response(
        {
          success: false,
          message: "Failed to update user status to accept messages",
        },
        401,
      );
    }

    // on success
    return response(
      {
        success: true,
        message: "Message acceptance status updated successfully",
      },
      200,
    );
  } catch (err) {
    console.error("Internal Server Error: " + err);

    return response(
      {
        success: false,
        message: "Internal Server Error",
      },
      500,
    );
  }
}

// Route to fetch user's message acceptance status
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

  // Extracting user id, stringified mongo id
  const userId = user._id;

  try {
    // Fetch user by id from db
    const user = await UserModel.findById(userId);

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

    // on success
    return response(
      {
        success: true,
        message: "Message acceptance status fetched successfully",
        data: { isAcceptingMessages: user.isAcceptingMessages },
      },
      200,
    );
  } catch (err) {
    console.error("Internal Server Error: " + err);

    return response(
      {
        success: false,
        message: "Internal Server Error",
      },
      500,
    );
  }
}
