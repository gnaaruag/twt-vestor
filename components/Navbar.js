"use client";
import React, { useEffect, useState } from "react";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const { user } = useUser();
  const [likeCount, setLikeCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchLikeCount = async () => {
        try {
          const email = user.primaryEmailAddress.emailAddress;
          const response = await fetch("/api/fetch-sum", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch like count");
          }

          const data = await response.json();
          setLikeCount(data.likeCount);
        } catch (error) {
          console.error("Error fetching like count:", error);
        }
      };

      fetchLikeCount();
    }
  }, [user]);

  return (
    <nav className="navbar">
      <SignedIn>
        <div className="navbar-container">
          <div className="navbar-header">
            <span className="navbar-symbol">twt-investor</span>
            <button
              className="hamburger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
          <div className={`navbar-links-container ${isMenuOpen ? "open" : ""}`}>
            <ul className="navbar-links">
              <li>
                <Link href="/home">Home</Link>
              </li>
              <li>
                <Link href="/history">History</Link>
              </li>
              <li>
                <Link href="/leaderboard">Leaderboard</Link>
              </li>
            </ul>
            <div className="navbar-actions">
              <div className="like-count">
                <Image src={"/like.svg"} alt="like" width={20} height={20} />
                <span>{likeCount}</span>
              </div>
              <UserButton />
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="navbar-guest">
          <span className="navbar-symbol">twt-investor</span>
          <Link href="/sign-up" className="get-started-button">
            Get Started
          </Link>
        </div>
      </SignedOut>

      <style jsx>{`
        .navbar {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #ffffff;
          border-bottom: 1px solid #e0e0e0;
          padding: 10px 20px;
        }
        .navbar-container {
          display: flex;
          justify-content: space-between;
          flex-direction: row;
          width: 100%;
          max-width: 1200px;
        }
        .navbar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .navbar-symbol {
          font-size: 1.8rem;
          font-weight: bold;
          color: #333;
        }
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
        }
        .hamburger-line {
          width: 30px;
          height: 3px;
          background-color: #333;
        }
        .navbar-links-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .navbar-links-container.open {
          flex-direction: column;
        }
        .navbar-links {
          display: flex;
          gap: 1em;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .navbar-links li {
          display: flex;
          align-items: center;
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .like-count {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: bold;
          color: #f91880;
        }
        .get-started-button {
          background-color: #007bff;
          color: #fff;
          padding: 10px 15px;
          border-radius: 5px;
          text-decoration: none;
        }
        .get-started-button:hover {
          background-color: #0056b3;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .navbar-container {
            flex-direction: column;
          }
          .hamburger {
            display: flex;
          }
          .navbar-links-container {
            flex-direction: column;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transition: max-height 0.3s ease, opacity 0.3s ease;
          }
          .navbar-links-container.open {
            max-height: 300px;
            opacity: 1;
          }
          .navbar-links {
            flex-direction: column;
            gap: 10px;
          }
          .navbar-actions {
            margin-top: 0.5em;
          }
        }

        @media (max-width: 480px) {
          .navbar-symbol {
            font-size: 1.5rem;
          }
          .get-started-button {
            padding: 8px 12px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
