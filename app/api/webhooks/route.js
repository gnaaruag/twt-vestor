import { Webhook } from "svix";
import { headers } from "next/headers";
import dbConnect from "@/utils/dbConnect";
import UserModel from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;
  console.log("SIGNING_SECRET:", SIGNING_SECRET);
  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create a new Svix instance with the secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, return an error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers:", {
      svix_id,
      svix_timestamp,
      svix_signature,
    });
    return new NextResponse("Error: Missing Svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt;

  // Verify the payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new NextResponse("Error: Verification error", { status: 400 });
  }

  const eventType = evt.type;

  try {
    // Handle the `user.created` event
    if (eventType === "user.created") {
      const { email_addresses } = evt.data;
      const email = email_addresses[0].email_address;

      console.log("Received user.created event for email:", email);

      // Connect to MongoDB
      await dbConnect();

      // Check if the user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        console.log("User already exists:", existingUser);
      } else {
        // Create a new user
        const newUser = new UserModel({
          email,
          likeCount: 500,
          positions: [],
          history: [],
        });
        await newUser.save();
        console.log("New user saved successfully:", newUser);
      }
    } else {
      console.log(`Unhandled event type: ${eventType}`);
    }

    return new NextResponse("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new NextResponse("Error processing webhook", { status: 500 });
  }
}
