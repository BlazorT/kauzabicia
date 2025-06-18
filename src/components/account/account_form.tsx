"use client";
import { USER_ROLE } from "@/constants/constants";
import { useAlert } from "@/context/alert-context";
import { useSignUp, useUploadImage } from "@/hooks/useAuth";
import { RESPONSE, User } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { useAuth } from "@/context/auth-context";
import { formatAvatar } from "@/lib/utils";

const formSchema = z.object({
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
  contact: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .max(15, "Contact number cannot exceed 15 digits")
    .regex(
      /^[0-9+\-\s()]*$/,
      "Contact number can only contain numbers, +, -, (), and spaces"
    )
    .nonempty("Contact number is required"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address cannot exceed 200 characters")
    .nonempty("Address is required"),
});

const AccountForm = () => {
  const { showAlert } = useAlert();
  const router = useRouter();
  const { user, login } = useAuth();
  const { mutate: signUp, isPending } = useSignUp();
  const { mutate: uploadImage, isPending: isPendingImageUpload } =
    useUploadImage();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) router.replace("/auth/signin");
    setPreviewImage(formatAvatar(user?.avatar ?? ""));
  }, [user, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avatar: null,
      firstname: user?.firstName ?? "",
      lastname: user?.lastName ?? "",
      address: user?.address ?? "",
      contact: user?.primaryContact ?? "",
    },
  });

  // Add watch to track form values
  const formValues = form.watch();

  // Check if form values are different from user data
  const isFormChanged = () => {
    if (!user) return false;
    return (
      formValues.firstname !== user.firstName ||
      formValues.lastname !== user.lastName ||
      formValues.address !== user.address ||
      formValues.contact !== user.primaryContact ||
      formValues.avatar !== null
    );
  };

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
    if (!user) return;
    signUp(
      {
        id: user?.id,
        userId: user?.userId ?? "",
        avatar: url ?? "", // Use the uploaded image URL from response
        userName:
          user?.userName ??
          values.firstname?.trim() + "." + values.lastname?.trim(),
        firstName: values.firstname,
        lastName: values.lastname,
        email: user.email,
        primaryContact: values.contact ?? "",
        address: values?.address ?? "",
        password: "",
        genderId: 1,
        fmctoken: "",
        roleId: USER_ROLE.USER,
        status: 1,
        storeId: user?.storeId ?? 1,
        registrationSource: 1,
        createdAt: user?.createdAt ?? moment().utc().format(),
        lastUpdatedAt: moment().utc().format(),
        rowVer: 1,
        isVerified: 0,
        IMEI: "",
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
    console.log({ res });
    if (res?.errorCode !== "0") {
      showAlert({
        title: "Error",
        description: res?.message ?? res?.title ?? "",
        confirmText: "Ok",
      });
    } else if (res && res?.status === true) {
      let userData: User;
      if (Array.isArray(res.data)) {
        userData = res.data[0];
      } else {
        userData = res.data as User;
      }
      login(userData);
      toast.success(
        `${userData?.firstName} ${userData?.lastName} has been logged in successfully.`
      );
    }
  };

  const onCancel = () => {
    showAlert({
      title: "Confirmation!",
      description: "Are you sure you want to cancel profile update!",
      confirmText: "Yes",
      cancelText: "Cancel",
      onConfirm: () =>
        router.replace(
          `/${user?.roleId !== USER_ROLE.USER ? "dashboard" : ""}`
        ),
    });
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
            disabled={isPending || isPendingImageUpload}
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
            disabled={isPending || isPendingImageUpload}
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
          disabled={isPending || isPendingImageUpload}
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
        />

        <FormField
          disabled={isPending || isPendingImageUpload}
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
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant={"outline"}
            className="flex-1/2"
            onClick={onCancel}
            disabled={isPending || isPendingImageUpload}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={"default"}
            className="flex-1/2"
            disabled={isPending || isPendingImageUpload || !isFormChanged()}
          >
            {(isPending || isPendingImageUpload) && (
              <Loader2 className="animate-spin" />
            )}
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
};
export default AccountForm;
