import dbConnect from "@/lib/dbConnect";
import { response } from "@/lib/response";
import { UserModel } from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);

    const username = searchParams.get("username");

    const result = usernameValidation.safeParse(username);

    if (!result.success) {
      const errors = result.error.format()._errors || [];

      console.log(errors);

      return response(
        {
          success: false,
          message: errors?.length > 0 ? errors.join(", ") : "Invalid username",
        },
        400,
      );
    }

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return response(
        {
          success: false,
          message: "Username already exists",
        },
        400,
      );
    }

    return response(
      {
        success: true,
        message: "Username is available",
      },
      200,
    );
  } catch (err) {
    console.error("Error checking username: ", err);

    return response(
      {
        success: false,
        message: "Internal server error",
      },
      500,
    );
  }
}
