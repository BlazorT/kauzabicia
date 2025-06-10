"use client";

import SignUpForm from "@/components/auth/signup_form";
import SocialAuth from "@/components/auth/social_auth";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";

const SignUp = () => {
  return (
    <SessionProvider>
      <Card className="flex flex-col items-center bg-background justify-center min-h-screen px-4 rounded-none">
        <CardContent className="w-full max-w-md bg-card p-6 flex flex-col gap-4 rounded-3xl border-1">
          {/* <div className="flex justify-center">
            <Image src="/logo.png" alt="Blazor Logo" width={100} height={24} />
          </div> */}
          <h1 className="text-2xl text-center sm:text-3xl">Sign Up!</h1>
          <SignUpForm />
          <Separator className="my-1" label="Or continue with" />
          <SocialAuth />
          <p className="text-sm text-gray-500 text-center">
            Already have an account yet?{" "}
            <Link
              href="/auth/signin"
              className="underline text-card-foreground"
            >
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </SessionProvider>
  );
};

export default SignUp;
