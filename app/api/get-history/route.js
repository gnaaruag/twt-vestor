import dbConnect from "@/utils/dbConnect";
import UserModel from "@/models/user.model";

export async function POST(request) {
  await dbConnect();

  try {
    const { email } = await request.json(); // Parse email from the request body

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: "Email is required" }),
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await UserModel.findOne({ email });
	console.log(user)
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    // Ensure user has a history property
    if (!user.history || user.history.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No history available", history: [] }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "History fetched successfully",
        history: user.history,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching history:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error", error: error.message }),
      { status: 500 }
    );
  }
}
