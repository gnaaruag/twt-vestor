"use client";

import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(users);
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard");
        const data = await response.json();

        if (data.success) {
          setUsers(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch leaderboard");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div>
      <SignedIn>
        <div className="max-w-3xl mx-auto p-6 mt-4 bg-gray-100 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Leaderboard
          </h1>
          <ul className="space-y-4">
            {users.map((user, index) => (
              <li
                key={user._id}
                className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md"
              >
                <div className="text-lg font-bold text-gray-700">
                  #{index + 1}
                </div>
                <Image href={user.image_url || "/default-avatar.png"}
                alt={`${user.username}'s avatar`} 
                width={25}
                height={25}/>
                <div className="flex-1">
                  <div className="text-lg font-medium text-gray-800">
                    {user.username}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.likeCount} likes
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </SignedIn>
      <SignedOut>
        <div>
          <p>
            You are signed out, sign up <Link href={"/sign-up"}>here</Link>
          </p>
        </div>
      </SignedOut>
    </div>
  );
}
