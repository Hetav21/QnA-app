import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);

    const username = searchParams.get("username");

    const result = usernameValidation.safeParse(username);

    if (!result.success) {
      const errors = result.error.format()._errors || [];

      console.log(errors);

      const res: ApiResponse = {
        success: false,
        message: errors?.length > 0 ? errors.join(", ") : "Invalid username",
      };

      return Response.json(res, { status: 400 });
    }

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      const res: ApiResponse = {
        success: false,
        message: "Username already exists",
      };

      return Response.json(res, { status: 400 });
    }

    const res: ApiResponse = {
      success: true,
      message: "Username is available",
    };

    return Response.json(res, { status: 200 });
  } catch (err) {
    console.error("Error checking username: ", err);
    const res: ApiResponse = {
      success: false,
      message: "Internal server error",
    };

    return Response.json(res, { status: 500 });
  }
}
