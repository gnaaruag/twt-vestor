"use client";
import { useState, useEffect } from "react";
import { Tweet } from "react-tweet";
import { Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

export default function History() {
  const { isLoaded, user } = useUser();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCount, setLikeCount] = useState("loading");

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

        const processedHistory = data.history
          .map((entry) => {
            const [url, likeDifference, likeCount] = entry.split("*");

            const isNumeric = (value) =>
              !isNaN(value) && value !== null && value !== undefined;

            return {
              url,
              likeDifference: isNumeric(likeDifference)
                ? Number(likeDifference)
                : "rugpulled",
              likeCount: isNumeric(likeCount) ? Number(likeCount) : "rugpulled",
              profitability: isNumeric(likeDifference)
                ? Number(likeDifference)
                : "rugpulled",
            };
          })
          .sort((a, b) => {
            if (
              a.profitability === "rugpulled" &&
              b.profitability === "rugpulled"
            ) {
              return 0;
            }
            if (a.profitability === "rugpulled") {
              return 1;
            }
            if (b.profitability === "rugpulled") {
              return -1;
            }
            return b.profitability - a.profitability;
          });
          console.log(processedHistory)
        setHistory(processedHistory);

        const likeCountRes = await fetch("/api/fetch-sum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const likeCountData = await likeCountRes.json();
        if (likeCountData.success) {
          setLikeCount(likeCountData.likeCount || 0);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, isLoaded]);

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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl mt-4 font-bold text-gray-900">
              Your History
            </h1>
            <div className="like-count flex items-center gap-2 text-[#f91880]">
              <Image src="/like.svg" alt="like" width={20} height={20} />
              <span className="text-lg md:text-xl">{likeCount}</span>
            </div>
          </header>
          <main className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {history.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 flex flex-col justify-between items-center gap-4"
              >
                <Tweet id={item.url.split("/").pop()} />
                <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
                  <p className="text-sm text-gray-700">
                    Bought at Likes: {item.likeCount - item.likeDifference || "rugpulled"}
                  </p>
                  <p className="text-sm text-gray-700">
                    Sold at: {item.likeCount || "rugpulled"}
                  </p>
                  <p className="text-sm text-gray-700">
                    Profitability: {item.profitability}
                  </p>
                </div>
              </div>
            ))}
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="text-center mt-8">
          <p className="text-gray-700">
            You are signed out. Sign up{" "}
            <Link href="/sign-up" className="text-blue-600 hover:underline">
              here
            </Link>
            .
          </p>
        </div>
      </SignedOut>
    </div>
  );
}
