"use client";
import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";

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
  const router = useRouter();

  if (!user) {
    router.push("/");
    return null;
  }

  1;
}
