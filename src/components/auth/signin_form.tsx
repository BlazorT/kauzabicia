"use client";
import { useAlert } from "@/context/alert-context";
import { useAuth } from "@/context/auth-context";
import { useSignIn } from "@/hooks/useAuth";
import { isEmail } from "@/lib/utils";
import { RESPONSE, User } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useState } from "react";

const formSchema = z.object({
  username: z.string().nonempty("Username is required"),
  password: z.string().nonempty("Password is required"),
});
const SignInForm = () => {
  const { showAlert } = useAlert();
  const { login } = useAuth();
  const router = useRouter();
  const { mutate: signIn, isPending } = useSignIn();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    signIn(
      {
        email: isEmail(values.username) ? values.username : "",
        userName: !isEmail(values.username) ? values.username : "",
        password: btoa(values.password),
        primaryContact: "",
        userId: "",
      },
      {
        onSuccess: (res) => {
          validateLoginResponse(res);
        },
      }
    );
  }
  const validateLoginResponse = (res: RESPONSE) => {
    if (!res) return;
    if (
      (Array.isArray(res?.data) && res?.data?.length === 0) ||
      res?.data == null
    ) {
      showAlert({
        title: "Error",
        description: "Username or password is incorrect, please try again",
        confirmText: "OK",
      });
    } else if (
      Array.isArray(res?.data) &&
      res?.data?.length > 0 &&
      res?.status
    ) {
      let userData: User;
      if (Array.isArray(res.data)) {
        userData = res.data[0];
      } else {
        userData = res.data;
      }
      if (userData?.isVerified === 1) {
        login(userData);
        toast.success(
          `${userData?.firstName} ${userData?.lastName} has been logged in successfully.`
        );
        return;
      } else {
        showAlert({
          title: "Error",
          description: "Please verify your email to continue",
          confirmText: "OK",
          onConfirm: () => {
            router.push(
              `/auth/verify/?email=${btoa(userData?.email)}&id=${btoa(
                userData?.id?.toString()
              )}`
            );
          },
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 w-[100%]"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email | Username</FormLabel>
              <FormControl>
                <Input placeholder="Email or Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Password"
                    {...field}
                    autoComplete="off"
                    type={showPassword ? "text" : "password"}
                  />
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
        <div className="w-full flex items-center justify-end">
          <span
            className="text-xs text-primary cursor-pointer"
            onClick={() => {
              router.push("/auth/forgot");
            }}
          >
            Forgot password?
          </span>
        </div>
        <Button type="submit" variant={"default"} className="w-full">
          {isPending && <Loader2 className="animate-spin" />}
          Sign In
        </Button>
      </form>
    </Form>
  );
};
export default SignInForm;
