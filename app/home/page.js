"use client";
import { Tweet } from "react-tweet";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { isLoaded, user } = useUser();
  const [positions, setPositions] = useState([]);
  const [currentLikes, setCurrentLikes] = useState({});
  const [newPosition, setNewPosition] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [tweetLikes, setTweetLikes] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [tweetId, setTweetId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const [likeCount, setLikeCount] = useState("loading");

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchPositions = async () => {
      try {
        setIsLoading(true);
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) {
          console.error("Primary email address not found.");
          return;
        }

        // Fetch positions
        const res = await fetch("/api/fetch-positions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        setPositions(data.positions || []);

        // Fetch current like counts
        const likes = {};
        for (const position of data.positions || []) {
          const tweetId = position.split("*")[0].split("/").pop();
          const likeRes = await fetch("/api/tweet-public-metrics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: tweetId }),
          });
          const likeData = await likeRes.json();
          likes[position] = likeData.favorite_count || 0;
        }
        setCurrentLikes(likes);
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchLikeCount = async () => {
      const email = user.primaryEmailAddress?.emailAddress;
      const likeCountRes = await fetch("/api/fetch-sum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const likeCountData = await likeCountRes.json();
      if (likeCountData.success) {
        setLikeCount(likeCountData.likeCount || 0);
      }
      console.log(likeCountData);
    };

    fetchLikeCount();
    fetchPositions();
  }, [isLoaded, user, positions.length]);

  const handleAddPosition = async () => {
    if (positions.length >= 5) {
      alert("You can only have up to 5 active positions.");
      return;
    }

    setIsSubmitting(true);
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      alert("Primary email address not found.");
      setIsSubmitting(false);
      return;
    }

    const cleanPosition = newPosition.split("?")[0];
    try {
      const res = await fetch("/api/commit-position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanPosition, email }),
      });

      const data = await res.json();
      if (data.success) {
        const id = cleanPosition.split("/").pop();
        const metricsRes = await fetch("/api/tweet-public-metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        const metricsData = await metricsRes.json();
        const likeCount = metricsData.favorite_count || 0;

        // Update positions and metrics
        setPositions([...positions, newPosition]);
        setCurrentLikes((prevLikes) => ({
          ...prevLikes,
          [newPosition]: likeCount,
        }));
        setNewPosition("");
        setTweetLikes(null);
        setErrorMessage("");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error adding position:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = async (url) => {
    setNewPosition(url);
    setTweetLikes(null);
    setErrorMessage("");

    const cleanUrl = url.split("?")[0];
    const id = cleanUrl.split("/").pop();
    setTweetId(id);

    if (url.includes("twitter.com") || url.includes("x.com")) {
      try {
        setIsSubmitting(true);
        const res = await fetch("/api/tweet-public-metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (data.favorite_count !== undefined) {
          setTweetLikes(data.favorite_count);
        } else {
          setErrorMessage("Could not fetch like count. Try again.");
        }
      } catch (error) {
        console.error("Error fetching tweet metrics:", error);
        setErrorMessage("Error fetching like count.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrorMessage("Please enter a valid Twitter/X link.");
    }
  };

  const handleDeletePosition = async (position) => {
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      alert("Primary email address not found.");
      return;
    }

    setIsDeleting((prev) => ({ ...prev, [position]: true }));
    try {
      const res = await fetch("/api/sell-position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: position, email }),
      });

      const data = await res.json();
      if (data.success) {
        setPositions(positions.filter((pos) => pos !== position));
        const updatedLikes = { ...currentLikes };
        delete updatedLikes[position];
        setCurrentLikes(updatedLikes);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting position:", error);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [position]: false }));
    }
  };

  return (
    <div>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="flex flex-wrap items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Active Positions
              </h1>
              <div className="flex items-center gap-2 text-[#f91880]">
                <Image src="/like.svg" alt="like" width={20} height={20} />
                <span className="text-base md:text-lg">{likeCount}</span>
              </div>
            </header>

            {/* Add New Position Form */}
            <section className="bg-white p-4 md:p-6 shadow-lg rounded-lg border border-gray-200 mb-8">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
                Add a New Position
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="text"
                  value={newPosition}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="https://x.com/gnaaruag/status/1880849482704904331"
                  className="flex-1 px-4 py-2 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleAddPosition}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  disabled={
                    !newPosition ||
                    tweetLikes === null ||
                    errorMessage ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Add Position"
                  )}
                </button>
              </div>
              {newPosition && !errorMessage && tweetLikes !== null && (
                <div className="mt-4 flex flex-col items-center gap-4">
                  <p className="text-sm text-gray-900 font-semibold">
                    Are you sure you want to invest at {tweetLikes} likes?
                  </p>
                  {tweetId && <Tweet id={tweetId} />}
                </div>
              )}
              {errorMessage && (
                <p className="text-sm text-red-500 mt-4">{errorMessage}</p>
              )}
            </section>

            {positions.length > 0 && (
              <p className="text-sm text-gray-500 mt-4 mb-4 text-center">
                {positions.length}/5 positions active
              </p>
            )}

            {/* Display Positions */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : positions.length === 0 ? (
              <div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-semibold text-gray-900 mt-4">
                    No active positions
                  </h3>
                  <p className="text-gray-500">
                    Start by adding a Twitter post to track
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex mt-2 justify-center items-center text-left">
                <ul className="list-disc mt-2 text-gray-700  flex flex-col gap-2 max-w-1/4">
                  <li>On this app, likes are currency, maximize it.</li>
                  <li>
                    To buy a post, submit post link to add positions section
                  </li>
                  <li>To start off you get 1000 likes</li>
                  <li>A post costs its current like count to buy</li>
                  <li>Buy low, sell High</li>
                  <li>You can buy atmost 5 posts at any given time</li>
                  <li>You might end up on the leaderboard so show your best self by uploading a custom pfp</li>
                  <li>Beware: if op deletes their post, you{"'"}ll be rugpulled</li>
                </ul>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {positions.map((position) => (
                    <motion.div
                      key={position}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between"
                    >
                      <div className="tweet-container mb-4">
                        <Tweet id={position.split("*")[0].split("/").pop()} />
                      </div>
                      <div className="flex flex-col md:flex-row items-center justify-between">
                        <p>Bought at: {position.split("*")[1]}</p>
                        <p>
                          Current Count:{" "}
                          {currentLikes[position] ?? "Loading..."}
                        </p>
                        <button
                          onClick={() => handleDeletePosition(position)}
                          className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors mt-4 md:mt-0"
                          disabled={isDeleting[position]}
                        >
                          {isDeleting[position] ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            "Sell Position"
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .tweet-container {
            width: 90%;
            max-width: 600px;
            margin: 0 auto;
            padding: 16px 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
        `}</style>
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
