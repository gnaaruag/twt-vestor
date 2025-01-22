export async function POST(request) {
	try {
	  // Parse the request body to get the tweet ID
	  const { id } = await request.json();
	  if (!id) {
		return new Response(JSON.stringify({ success: false, message: "Tweet ID is required" }), {
		  status: 400,
		});
	  }
  
	  // API URL
	  const apiUrl = `https://api.socialdata.tools/twitter/statuses/show?id=${id}`;
	  console.log("API URL:", process.env.DATA_API);
	  // Fetch data from the external API
	  const response = await fetch(apiUrl, {
		method: "GET",
		headers: {
		  Authorization: `Bearer ${process.env.DATA_API}`, // Ensure this matches your curl command
		  Accept: "application/json",
		},
	  });
  
	  // Handle errors from the external API
	  if (!response.ok) {
		const errorMessage = await response.text();
		return new Response(
		  JSON.stringify({ success: false, message: "Failed to fetch data", error: errorMessage }),
		  { status: response.status }
		);
	  }

	  if(response.status === 404){
		return new Response(
			JSON.stringify({ success: false, message: "They deleted the tweet, get rugpulled loser.", error: error.message }),
			{ status: 404 }
		  );
	  }
  
	  // Parse the external API response
	  const data = await response.json();
	  console.log(data)
  
	  // Extract and return only the favorite count
	  return new Response(
		JSON.stringify({
		  success: true,
		  favorite_count: data.favorite_count,
		}),
		{ status: 200 }
	  );
	} catch (error) {
		console.log(error);
	  return new Response(
		JSON.stringify({ success: false, message: "Internal server error", error: error.message }),
		{ status: 500 }
	  );
	}
  }
  