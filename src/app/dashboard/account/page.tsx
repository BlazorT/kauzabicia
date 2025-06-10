"use client";

import AccountForm from "@/components/account/account_form";
import { Card, CardContent } from "@/components/ui/card";
import { SessionProvider } from "next-auth/react";

const Account = () => {
  return (
    <SessionProvider>
      <Card className="flex flex-col items-center bg-background justify-center min-h-screen px-4 rounded-none">
        <CardContent className="w-full max-w-md bg-card p-6 flex flex-col gap-4 rounded-3xl border-1">
          <AccountForm />
        </CardContent>
      </Card>
    </SessionProvider>
  );
};

export default Account;
