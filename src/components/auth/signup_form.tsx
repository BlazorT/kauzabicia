"use client";
import { USER_ROLE } from "@/constants/constants";
import { useAlert } from "@/context/alert-context";
import { useSignUp, useUploadImage } from "@/hooks/useAuth";
import { RESPONSE, User } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Upload, X } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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
import PasswordStrengthIndicator from "./password_strength";

const formSchema = z
  .object({
    avatar: z.any().optional(),
    firstname: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters")
      .nonempty("First name is required"),
    lastname: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters")
      .nonempty("Last name is required"),
    email: z
      .string()
      .email("Invalid email address")
      .max(100, "Email cannot exceed 100 characters")
      .nonempty("Email is required"),
    // contact: z
    //   .string()
    //   .min(10, "Contact number must be at least 10 digits")
    //   .max(15, "Contact number cannot exceed 15 digits")
    //   .regex(
    //     /^[0-9+\-\s()]*$/,
    //     "Contact number can only contain numbers, +, -, (), and spaces"
    //   )
    //   .nonempty("Contact number is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password cannot exceed 50 characters")
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@]).{6,}$/,
        "Password must include at least one uppercase letter, one number, and the @ symbol"
      )
      .nonempty("Password is required"),
    confirm_password: z.string().nonempty("Please confirm your password"),
    // address: z
    //   .string()
    //   .min(5, "Address must be at least 5 characters")
    //   .max(200, "Address cannot exceed 200 characters")
    //   .nonempty("Address is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

const SignUpForm = () => {
  const { showAlert } = useAlert();
  const router = useRouter();
  const { mutate: signUp, isPending } = useSignUp();
  const { mutate: uploadImage, isPending: isPendingImageUpload } =
    useUploadImage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avatar: null,
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });
  const password = form.watch("password");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        form.setValue("avatar", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    form.setValue("avatar", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.avatar) {
      const formData = new FormData();

      formData.append("file", values.avatar);

      uploadImage(formData, {
        onSuccess: (res) => {
          //   console.log("Upload response:", res);
          const urlPath = res?.data as string;
          const cleanedFilePath = "/" + urlPath?.replace(/\/\//g, "/");
          signUpFn(values, cleanedFilePath);
        },
        onError: (err) => {
          console.log("Upload error:", err);
          toast.error("Failed to upload image");
        },
      });
    } else {
      signUpFn(values);
    }
  }

  const signUpFn = (values: z.infer<typeof formSchema>, url?: string) => {
    signUp(
      {
        id: 0,
        userId: "",
        avatar: url ?? "", // Use the uploaded image URL from response
        userName: values.firstname?.trim() + "." + values.lastname?.trim(),
        firstName: values.firstname,
        lastName: values.lastname,
        email: values.email,
        primaryContact: "",
        address: "",
        password: btoa(values.password),
        genderId: 1,
        fmctoken: "",
        roleId: USER_ROLE.USER,
        status: 1,
        storeId: 1,
        registrationSource: 1,
        createdAt: moment().utc().format(),
        lastUpdatedAt: moment().utc().format(),
        rowVer: 1,
        isVerified: 0,
        IMEI: "0",
      },
      {
        onSuccess: (res) => {
          validateLoginResponse(res);
        },
        onError: (err) => {
          console.log({ err });
        },
      }
    );
  };
  const validateLoginResponse = (res: RESPONSE) => {
    if (!res) return;
    // console.log({ res });
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
      if (userData?.isVerified === 0 || userData?.isVerified === null) {
        showAlert({
          title: "Verification",
          description: `Your registration request submitted successfully. Security token has been sent to ${userData?.email}. Use this security token at first login.`,
          confirmText: "OK",
          onConfirm: () => {
            router.push(
              `/auth/verify/?email=${btoa(userData?.email)}&id=${btoa(
                userData?.id?.toString()
              )}`
            );
          },
        });
        return;
      }

      showAlert({
        title: "Acknowledge",
        description: `User with this email ${userData?.email} already registered and verified, for new account press new New Account!`,
        confirmText: "New Account",
        onConfirm: () => {
          form.setValue("email", "");
        },
        cancelText: "Cancel",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md mx-auto space-y-4"
      >
        <div className="flex flex-col items-center mb-4">
          <div className="relative p-1">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden border-1 border-muted-foreground hover:border-primary transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? (
                <>
                  <Image
                    src={previewImage}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs">Change photo</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-background/10 group-hover:bg-secondary transition-colors">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            {previewImage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90 transition-colors shadow-sm z-10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
            id="avatar-upload"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Max file size: 5MB
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Contact number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

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

        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Confirm password"
                    {...field}
                    autoComplete="off"
                    type={showConfirmPassword ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
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

        <PasswordStrengthIndicator password={password} />
        {/* <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Your address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <Button
          type="submit"
          variant={"default"}
          className="w-full"
          disabled={isPending || isPendingImageUpload}
        >
          {(isPending || isPendingImageUpload) && (
            <Loader2 className="animate-spin" />
          )}
          Sign Up
        </Button>
      </form>
    </Form>
  );
};
export default SignUpForm;
