"use client";
import { SignUp, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();
  

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center pt-4">
        <h2 className="text-2xl font-bold mb-2">Sign up</h2>

        <SignUp signInUrl="/sign-in" />
      </div>
    );
  }

  else {
    return (
      <div className="flex items-center justify-center pt-4">
      <p>Already signed up, <Link href={"/home"}>Go to home</Link></p>
    </div>
    );
  }

  ;
}
