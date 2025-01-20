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
    <div>
      <p>Already signed up, <Link href={"/home"}>Go to hom</Link></p>
    </div>
  }

  1;
}
