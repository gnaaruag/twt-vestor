'use client'
import React, { useEffect, useState } from 'react';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

const Navbar = () => {
  const { user } = useUser();
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Fetch like count from the database
      const fetchLikeCount = async () => {
		try {
		  const email = user.primaryEmailAddress.emailAddress;
		  const response = await fetch('/api/fetch-sum', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		  });

		  if (!response.ok) {
			throw new Error('Failed to fetch like count');
		  }

		  const data = await response.json();
		  setLikeCount(data.likeCount);
		} catch (error) {
		  console.error('Error fetching like count:', error);
		}
      };

      fetchLikeCount();
    }
  }, [user]);

  return (
    <nav className="navbar ">
      <SignedIn>
        <ul className="navbar-links">
          <li><Link href="/home">Home</Link></li>
          <li><Link href="/history">History</Link></li>
          <li><Link href="/leaderboard">Leaderboard</Link></li>
          <li className="like-count text-[#f91880]"><img
                  src="/like.svg"
                  alt="like"
                  className="inline-block w-4 h-4 mr-1"
                  style={{ fill: "#f91880" }}
                />{likeCount}</li>
        </ul>
      </SignedIn>

      <SignedOut>
        <div className="navbar-guest">
          <span className="navbar-symbol">\u273F</span> {/* Example symbol */}
          <Link href="/sign-up" className="get-started-button">Get Started</Link>
        </div>
      </SignedOut>

      <style jsx>{`
        .navbar {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }
        .navbar-links {
          display: flex;
          gap: 15px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .navbar-guest {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .navbar-symbol {
          font-size: 1.5rem;
          color: #6c757d;
        }
        .get-started-button {
          background-color: #007bff;
          color: #fff;
          padding: 8px 12px;
          border-radius: 5px;
          text-decoration: none;
        }
        .get-started-button:hover {
          background-color: #0056b3;
        }
        .like-count {
          font-weight: bold;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
