"use client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAlert } from "@/context/alert-context";
import { useForgotPassword } from "@/hooks/useAuth";
import { RESPONSE } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import PasswordStrengthIndicator from "./password_strength";

const ForgotForm = () => {
  const { showAlert } = useAlert();
  const router = useRouter();
  const { mutate: forgotPassword, isPending } = useForgotPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [steps, setSteps] = useState(1);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (steps !== 2) return;
    let timer: string | number | NodeJS.Timeout | undefined;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer, steps]);

  const formSchema = z
    .object({
      email: z
        .string()
        .email("Invalid email address")
        .max(100, "Email cannot exceed 100 characters")
        .nonempty("Email is required"),
      token: z.string().optional(),
      password: z.string().optional(),
      confirm_password: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // Step 2 validation
      if (steps === 2) {
        if (!data.token) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["token"],
            message: "Token is required",
          });
        } else if (data.token.length !== 6) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["token"],
            message: "Token must be 6 characters",
          });
        }
      }

      // Step 3 validation
      if (steps === 3) {
        if (!data.password) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["password"],
            message: "Password is required",
          });
        } else {
          if (data.password.length < 6) {
            ctx.addIssue({
              code: z.ZodIssueCode.too_small,
              minimum: 6,
              type: "string",
              inclusive: true,
              path: ["password"],
              message: "Password must be at least 6 characters",
            });
          }
          if (data.password.length > 50) {
            ctx.addIssue({
              code: z.ZodIssueCode.too_big,
              maximum: 50,
              type: "string",
              inclusive: true,
              path: ["password"],
              message: "Password cannot exceed 50 characters",
            });
          }
          if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@]).{6,}$/.test(data.password)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["password"],
              message:
                "Password must include at least one uppercase letter, one number, and the @ symbol",
            });
          }
        }

        if (!data.confirm_password) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["confirm_password"],
            message: "Please confirm your password",
          });
        } else if (data.password !== data.confirm_password) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["confirm_password"],
            message: "Passwords don't match",
          });
        }
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      token: "",
      confirm_password: "",
      password: "",
    },
  });

  const password = form.watch("password");

  const commonBody = {
    id: 0,
    storeId: 0,
    registrationSource: 1,
    password: "",
    primaryContact: "",
    userId: "",
    userName: "",
  };

  const forgotBody = {
    1: {
      ...commonBody,
      email: form.getValues("email"),
      registrationSource: 1,
    },
    2: {
      ...commonBody,
      email: form.getValues("email"),
      token: form.getValues("token"),
      registrationSource: 1,
    },
    3: {
      ...commonBody,
      email: form.getValues("email"),
      password: form.getValues("password")
        ? btoa(form.getValues("password")!)
        : "",
      token: form.getValues("token"),
      registrationSource: 1,
    },
  };

  const hints = {
    1: "Enter your email address e.g. demo@mealzndealz.com and we'll send you a security code to get back into your account.",
    2: `The security token has been sent to ${form.getValues(
      "email"
    )}, Please enter below.`,
    3: "Create a new password for your account. Your password must include at least one uppercase letter, one number, and the '@' symbol.",
  };

  const btnTitle = {
    1: "Send Code",
    2: "Verify Code",
    3: "Change Password",
  };

  const handleResponse = (
    res: RESPONSE,
    successMessage: string,
    nextStep: number,
    reset: boolean = false
  ) => {
    if (res?.status) {
      if (reset) setResendTimer(60);
      if (nextStep === 2) {
        // console.log(res.data);
        const receivedCode = (res?.data as string) ?? "";
        setCode(receivedCode);
      }
      toast.success(successMessage);
      setSteps(nextStep);
    } else if (res?.errorCode) {
      if (nextStep === 2) {
        showAlert({
          title: "Warning",
          description: `Your email address ${form.getValues(
            "email"
          )} does not exist. Please check and try again.`,
          confirmText: "OK",
        });
        return;
      }
      toast.error(res?.message || res?.title);
    }
  };

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (steps === 1) {
      const body = {
        ...commonBody,
        email: values.email,
        registrationSource: 1,
      };
      forgotPassword(body, {
        onSuccess: (res) => {
          handleResponse(
            res,
            `Security token has been sent to ${values.email} successfully`,
            steps + 1,
            true
          );
        },
      });
      return;
    }

    if (steps === 2) {
      // console.log(typeof values.token, typeof code, code, values.token);
      if (values.token !== code) {
        showAlert({
          title: "Oops!",
          description:
            "That security token doesn't look right. Please check and try again.",
          confirmText: "Got it",
        });

        return;
      }
      toast.success("Security token has been verified successfully");
      setSteps(steps + 1);
    }

    if (steps === 3) {
      forgotPassword(forgotBody[steps], {
        onSuccess: (res) => {
          if (res?.status === true) {
            showAlert({
              title: "Success",
              description:
                "Password has been changed successfully, you can login with new password.",
              onConfirm: () => {
                router.replace("/auth/signin");
              },
              confirmText: "OK",
            });
          }
        },
      });
    }
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
  }

  const handleResendCode = async () => {
    forgotPassword(forgotBody[1], {
      onSuccess: (res) => {
        handleResponse(
          res,
          `Security token has been sent to ${form.getValues(
            "email"
          )} successfully`,
          steps,
          true
        );
      },
    });
  };

  return (
    <>
      <div className="bg-background p-2 rounded-lg text-sm tracking-wider text-shadow-2xs text-shadow-primary/20">
        {hints[steps as keyof typeof hints]}
        {steps === 1 && (
          <p className="text-xs mt-1 text-muted-foreground">
            Note : Once you send password reset request, Your account will be
            made in-activate for security purpose, security code verification
            process will automatically activate your account.
          </p>
        )}
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3 w-[100%]"
        >
          {steps === 1 && (
            <FormField
              disabled={isPending}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter Email"
                        {...field}
                        className="pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {steps === 2 && (
            <>
              <FormField
                disabled={isPending}
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          containerClassName="group flex items-center has-[:disabled]:opacity-50"
                        >
                          <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, index) => (
                              <InputOTPSlot
                                key={index}
                                className="w-16"
                                index={index}
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0}
                  className="text-sm"
                >
                  {resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : "Didn't receive a code? Resend"}
                </Button>
              </div>
            </>
          )}

          {steps === 3 && (
            <>
              <FormField
                disabled={isPending}
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="New Password"
                          {...field}
                          type={showPassword ? "text" : "password"}
                          className="pl-10"
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Confirm Password"
                          {...field}
                          type={showPassword ? "text" : "password"}
                          className="pl-10"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <PasswordStrengthIndicator password={password ?? ""} />
            </>
          )}

          <Button type="submit" variant={"default"} className="w-full">
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              btnTitle[steps as keyof typeof btnTitle]
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};
export default ForgotForm;
