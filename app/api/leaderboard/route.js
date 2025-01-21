import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import UserModel from '@/models/user.model';

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch top 10 users by likeCount in descending order
    const topUsers = await UserModel.find({})
      .sort({ likeCount: -1 }) // Sort by likeCount descending
      .limit(10) // Limit to top 10
      .select('username likeCount image_url') // Select only required fields
      .lean();

    return NextResponse.json({ success: true, data: topUsers });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
