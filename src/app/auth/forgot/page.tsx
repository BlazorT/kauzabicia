"use client";

import ForgotForm from "@/components/auth/forgot_form";
import { Card, CardContent } from "@/components/ui/card";
import { SessionProvider } from "next-auth/react";
import Image from "next/image";

const Forgot = () => {
  return (
    <SessionProvider>
      <Card className="flex flex-col items-center bg-background justify-center min-h-screen px-4 rounded-none">
        <CardContent className="w-full max-w-md bg-card p-6 flex flex-col gap-4 rounded-3xl border-1">
          <div className="flex justify-center">
            <Image
              src="/logo.jpeg"
              alt="Blazor Logo"
              width={150}
              height={150}
            />
          </div>
          <ForgotForm />
        </CardContent>
      </Card>
    </SessionProvider>
  );
};

export default Forgot;
