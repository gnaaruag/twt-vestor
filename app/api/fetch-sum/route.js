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
		if (!user) {
		  return new Response(
			JSON.stringify({ success: false, message: "User not found" }),
			{ status: 404 }
		  );
		}
	
		// Return the positions
		return new Response(
		  JSON.stringify({
			success: true,
			likeCount: user.likeCount,
		  }),
		  { status: 200 }
		);
	  } catch (error) {
		return new Response(
		  JSON.stringify({ success: false, message: error.message }),
		  { status: 500 }
		);
	  }
}