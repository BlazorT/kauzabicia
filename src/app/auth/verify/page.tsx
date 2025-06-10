"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAlert } from "@/context/alert-context";
import { useAuth } from "@/context/auth-context";
import { useSignUp } from "@/hooks/useAuth";
import { RESPONSE, User } from "@/utils/types";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VerifyPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { user, login } = useAuth();
  const searchParams = useSearchParams();
  const { mutate: handleVerification, isPending } = useSignUp();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);

  // Check if user is already verified
  useEffect(() => {
    if (user?.isVerified === 1) {
      router.push("/");
    }
  }, [user, router]);

  // Check if user is already verified
  useEffect(() => {
    const email = searchParams.get("email");
    const id = searchParams.get("id");
    if (!email && !id) {
      router.push("/");
    }
  }, [router, searchParams]);

  // Handle OTP submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = searchParams.get("email");
    const id = searchParams.get("id");
    if (id && email) {
      const verifiBody = {
        id: parseInt(atob(id)),
        token: otp,
        email: atob(email) ?? "",
        registrationSource: 1,
        password: "",
        primaryContact: "",
        userId: "",
        userName: "",
      };
      handleVerification(verifiBody, {
        onSuccess: (res) => {
          console.log(res);
          validateLoginResponse(res);
        },
        onError: (err) => {
          console.log({ err });
        },
      });
    }
    try {
      // TODO: Implement your verification logic here
      // const response = await verifyOTP(otp);

      toast.success("Email verified successfully!");
      router.push("/");
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Invalid verification code");
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    const email = searchParams.get("email");
    const id = searchParams.get("id");
    if (id && email) {
      const codeBody = {
        id: parseInt(atob(id)),
        email: atob(email) ?? "",
        isVerified: 0,
        registrationSource: 2,
        token: "",
        password: "",
        primaryContact: "",
        userId: "",
        userName: "",
        zipCode: "resend",
      };
      handleVerification(codeBody, {
        onSuccess: (res) => {
          console.log(res);
          if (res && res?.errorCode !== "0") {
            toast.error(res?.message || res?.title);
          } else if (res && res.status && res.data) {
            toast.success(
              `Code has been sent successfully to ${codeBody.email}`
            );
            setTimer(60);
          }
        },
        onError: (err) => {
          console.log({ err });
        },
      });
    }
  };

  const validateLoginResponse = (res: RESPONSE) => {
    if (!res) return;
    console.log({ res });
    if (res?.errorCode !== "0") {
      showAlert({
        title: "Error",
        description: res?.message ?? res?.title ?? "",
        confirmText: "Ok",
      });
    } else if (res && res?.status === true) {
      let userData: User | undefined;
      if (Array.isArray(res.data)) {
        userData = res.data[0];
      } else {
        userData = res.data as User | undefined;
      }
      if (userData?.isVerified === 1) {
        login(userData);
        toast.success(
          `${userData?.firstName} ${userData?.lastName} has been logged in successfully.`
        );
        return;
      }
      showAlert({
        title: "Invalid Code",
        description:
          "Invalid verification code, make sure you have entered the correct code",
        confirmText: "OK",
      });
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Verify Your Email</h1>
          <p className="text-muted-foreground mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              containerClassName="group flex items-center has-[:disabled]:opacity-50"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={otp.length !== 6 || isPending}
            >
              {isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Verify Email"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={timer > 0}
                className="text-sm"
              >
                {timer > 0
                  ? `Resend code in ${timer}s`
                  : "Didn't receive a code? Resend"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
