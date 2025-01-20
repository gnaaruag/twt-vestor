"use client";
import { Tweet } from "react-tweet";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Twitter, Trash2, Plus, AlertCircle, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { isLoaded, user } = useUser(); // Ensure `isLoaded` is checked
  const [positions, setPositions] = useState([]);
  const [currentLikes, setCurrentLikes] = useState({}); // Store current like counts
  const [newPosition, setNewPosition] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    const fetchPositions = async () => {
      try {
        const email = user.primaryEmailAddress?.emailAddress;

        if (!email) {
          console.error("Primary email address not found.");
          return;
        }

        // Fetch positions
        const res = await fetch("/api/fetch-positions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        const fetchedPositions = data.positions || [];
        setPositions(fetchedPositions);

        // Fetch current like counts for each position
        const likes = {};
        for (const position of fetchedPositions) {
          const tweetId = `${position}`.split("*")[0].split("/").pop()
          const likeRes = await fetch("/api/tweet-public-metrics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: tweetId }),
          });
          const likeData = await likeRes.json();
          console.log("likeData", likeData);
          likes[position] = likeData.favorite_count || 0;
        }
        setCurrentLikes(likes);
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, [isLoaded, user]);

  const handleAddPosition = async () => {
    if (positions.length >= 5) {
      alert("You can only have up to 5 active positions.");
      return;
    }

    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      alert("Primary email address not found.");
      return;
    }

    const res = await fetch("/api/commit-position", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: newPosition, email }),
    });

    const data = await res.json();
    if (data.success) {
      setPositions([...positions, newPosition]);
      setNewPosition("");
      setModalOpen(false);
    } else {
      alert(data.message);
    }
  };

  const handleDeletePosition = async (position) => {
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      alert("Primary email address not found.");
      return;
    }
    const res = await fetch("/api/sell-position", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Active Positions</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Position
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : positions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  No active positions
                </h3>
                <p className="text-gray-500">
                  Start by adding a Twitter post to track
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {positions.map((position, index) => (
                <motion.div
                  key={position}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col items-center justify-between p-6">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div>
                          <Tweet
                            id={`${position}`.split("*")[0].split("/").pop()}
                          />
                        </div>
                      </div>
                      <div>
                        <p>Bought at: {`${position}`.split("*")[1]}</p>
                        <p>
                          Current Count:{" "}
                          {currentLikes[position] ?? "Loading..."}
                        </p>
                        <button
                          onClick={() => handleDeletePosition(position)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Sell Position
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {positions.length > 0 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            {positions.length}/5 positions active
          </p>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-lg max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add a new position
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Enter Twitter URL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPosition}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Position
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
