import dbConnect from "@/utils/dbConnect";
import UserModel from "@/models/user.model";

export async function POST(request) {
  await dbConnect();

  try {
    const { email, url } = await request.json(); // Parse email and URL from the request body

    if (!email || !url) {
      return new Response(
        JSON.stringify({ success: false, message: "Email and URL are required" }),
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

    // Fetch like count from /tweet-public-metrics
    const tweetId = url.split("/").pop(); // Extract tweet ID from the URL
    const metricsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tweet-public-metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: tweetId }),
    });

    if (!metricsResponse.ok) {
      const error = await metricsResponse.json();
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to fetch tweet metrics",
          error: error.message,
        }),
        { status: metricsResponse.status }
      );
    }

    const metricsData = await metricsResponse.json();
    console.log(metricsData);
    const fetchedLikeCount = metricsData.favorite_count;

    if (fetchedLikeCount === undefined || fetchedLikeCount === null) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid tweet metrics data" }),
        { status: 400 }
      );
    }

    // Check user's likeCount and append fetchedLikeCount to URL if greater
	let updatedUrl = url;
	if (user.likeCount > fetchedLikeCount) {
	  updatedUrl = `${url}*${fetchedLikeCount}`;
	  user.likeCount -= fetchedLikeCount; // Reduce user's likeCount by fetchedLikeCount
	}

    // Add the position to the user's positions
    if (user.positions.length >= 5) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "You can only have up to 5 active positions.",
        }),
        { status: 400 }
      );
    }

    user.positions.push(updatedUrl);
    await user.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Position added successfully",
        position: updatedUrl,
      }),
      { status: 200 }
    );
  } catch (error) {
	console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error", error: error.message }),
      { status: 500 }
    );
  }
}
