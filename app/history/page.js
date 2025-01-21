"use client";
import { useState, useEffect } from "react";
import { Tweet } from "react-tweet";
import { Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

export default function History() {
  const { isLoaded, user } = useUser();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }
    const fetchHistory = async () => {
      try {
        const email = user.emailAddresses[0].emailAddress;

        if (!email) {
          setError("User email not found.");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/get-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch history.");
        }

        const data = await response.json();

        // Process history data
        const processedHistory = data.history
          .map((entry) => {
            console.log(entry);
            const [url, likeDifference, likeCount] = entry.split("*");
            return {
              url,
              likeDifference: parseInt(likeDifference, 10),
              likeCount: parseInt(likeCount, 10),
              profitability: parseInt(likeDifference, 10),
            };
          })
          .sort((a, b) => b.profitability - a.profitability); // Sort by profitability

        setHistory(processedHistory);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-gray-700 ml-4">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            No history available
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SignedIn>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Trade History
          </h2>
          <div className="grid gap-4">
            {history.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center gap-4"
              >
                <Tweet id={item.url.split("/").pop()} />
                <div className="flex justify-center items-center gap-4">
                  <p className=" text-sm text-gray-700">
                    Profitability: {item.profitability}
                  </p>
                  <p className="text-sm text-gray-700">
                    Likes at Sale: {item.likeCount}
                  </p>
                  <p className="text-sm text-gray-700">
                    Likes Gained: {item.likeDifference}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
