"use client";
import { SignIn, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center pt-4">
		<h2 className="text-2xl font-bold mb-2">Sign in</h2>
        <SignIn signUpUrl="/sign-up" red/>
      </div>
    );
  }
  else {
    return (
      <div className="flex items-center justify-center pt-4">
      <p>Already signed in, <Link href={"/home"}>Go to home</Link></p>
    </div>
    );
  }
}
