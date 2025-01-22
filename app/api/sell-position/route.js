import dbConnect from "@/utils/dbConnect";
import UserModel from "@/models/user.model";

export async function POST(request) {
  await dbConnect();

  try {
    const { email, url } = await request.json();

    if (!email || !url) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email and URL are required",
        }),
        { status: 400 }
      );
    }

    // Extract base URL and original like count
    const [baseUrl, originalLikeCount] = url.split("*");
    const tweetId = baseUrl.split("/").pop();

    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    // Check if the position exists in the user's positions array
    const positionIndex = user.positions.indexOf(url);
    if (positionIndex === -1) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Position not found in user's positions",
        }),
        { status: 404 }
      );
    }

    // Fetch the current like count from /tweet-public-metrics
    const metricsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/tweet-public-metrics`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tweetId }),
      }
    );

    if (metricsResponse.status === 404) {
      // Remove the position from the user's positions array
      user.positions.splice(positionIndex, 1);

      // Add the difference to the user's history array
      user.history.push(
        baseUrl + "*" + "rugpulled" + "*" + "rugpulled" 
      );
      await user.save();

      return new Response(
        JSON.stringify({
          success: true,
          message: "get rugpulled loser",
          likeDifference: 0,
          updatedLikeCount: user.likeCount,
          history: user.history,
        }),
        { status: 404 }
      );
    }

    if (!metricsResponse.ok) {
      const errorMessage = await metricsResponse.text();
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to fetch tweet metrics",
          error: errorMessage,
        }),
        { status: metricsResponse.status }
      );
    }

    const metricsData = await metricsResponse.json();
    const currentLikeCount = metricsData.favorite_count;

    if (!currentLikeCount) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid tweet metrics data",
        }),
        { status: 400 }
      );
    }

    // Calculate the like count difference
    const likeDifference = currentLikeCount - parseInt(originalLikeCount, 10);

    // Update user's likeCount
    user.likeCount += likeDifference + parseInt(originalLikeCount, 10);

    // Remove the position from the user's positions array
    user.positions.splice(positionIndex, 1);

    // Add the difference to the user's history array
    user.history.push(baseUrl + "*" + likeDifference + "*" + currentLikeCount);

    // Save the updated user document
    await user.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Position sold successfully",
        likeDifference,
        updatedLikeCount: user.likeCount,
        history: user.history,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
