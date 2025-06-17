"use client";
import { IMAGE_MAX, IMAGE_MIN, STATUS } from "@/constants/constants";
import { useAlert } from "@/context/alert-context";
import { useAuth } from "@/context/auth-context";
import { useUploadMultiImages } from "@/hooks/useAuth"; // Assuming useUploadImage is still relevant for product images
import {
  useAddUpdateProduct,
  useGetStoreMenus,
  useGetUnits,
  useMenu,
} from "@/hooks/useMenu";
import { cn } from "@/lib/utils";
import { API_URL } from "@/services/apiClient";
import { QUERY_KEYS } from "@/utils/queryKeys";
import { MenuItem, RESPONSE } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronsUpDown,
  Clock,
  Code,
  DollarSign,
  Loader2,
  Package,
  Percent,
  Tag,
  Upload,
  X,
} from "lucide-react"; // Import new icons
import moment from "moment";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AllMenuProduct } from "../home/product-filters";
import { Button } from "../ui/button";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command as CommandUI,
} from "../ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import RichTextEditor from "../ui/rich-text-editor";
import Spinner from "../ui/spinner";

interface ProductUnit {
  createdAt: string;
  createdBy: number;
  desc: string;
  id: number;
  lastUpdatedAt: string;
  lastUpdatedBy: number;
  name: string;
  rowVer: number;
  shortCode: string;
  status: number;
}

interface MenuImage {
  Id: number;
  ContentRefId: string;
  FileName: string;
}

// Zod schema for the new product form
const formSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required")
    .max(50, "Product ID cannot exceed 50 characters"),
  unitId: z
    .string()
    .min(1, "Unit ID is required")
    .max(50, "Unit ID cannot exceed 50 characters"),
  unitPrice: z.coerce
    .number()
    .min(0, "Unit price cannot be negative")
    .max(9999999.99, "Unit price exceeds maximum value")
    .refine((val) => !isNaN(val), { message: "Unit price must be a number" }),
  discount: z.coerce
    .number()
    .min(0, "Discount cannot be negative")
    .max(9999999.99, "Discount exceeds maximum value")
    .refine((val) => !isNaN(val), { message: "Discount must be a number" })
    .optional(),
  discountPercent: z.coerce
    .number()
    .min(0, "Discount percentage cannot be negative")
    .max(100, "Discount percentage cannot exceed 100")
    .refine((val) => !isNaN(val), {
      message: "Discount percentage must be a number",
    })
    .optional(),
  taxPercent: z.coerce
    .number()
    .min(0, "Tax percentage cannot be negative")
    .max(100, "Tax percentage cannot exceed 100")
    .refine((val) => !isNaN(val), {
      message: "Tax percentage must be a number",
    }),
  readyTime: z.coerce
    .number()
    .min(0, "Ready time cannot be negative")
    .max(10000, "Ready time cannot exceed 10000 minutes")
    .int("Ready time must be an integer")
    .refine((val) => !isNaN(val), { message: "Ready time must be a number" }),
  status: z.number().optional(),
  description: z.string().optional(),
  code: z.string().max(20, "Code cannot exceed 20 characters").optional(),
  images: z
    .array(
      z.object({
        file: z.any().nullable(), // Allow null for existing images
        preview: z.string(),
      })
    )
    .max(20, "You can upload a maximum of 20 images")
    .refine(
      (files) =>
        files.every(
          (file) =>
            // Only validate file type and size for new files (non-null)
            !file.file ||
            (file.file.type.startsWith("image/") &&
              file.file.size <= 5 * 1024 * 1024)
        ),
      `Each image must be a valid image type and less than 5MB`
    )
    .refine(
      (files) =>
        Promise.all(
          files.map((file) => {
            return new Promise((resolve) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const img = new (window as any).Image();
              img.src = file.preview;
              img.onload = () => {
                if (
                  img.width >= IMAGE_MIN &&
                  img.width <= IMAGE_MAX &&
                  img.height >= IMAGE_MIN &&
                  img.height <= IMAGE_MAX
                ) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              };
            });
          })
        ).then((results) => results.every(Boolean)),
      "Images must have dimensions between 400x400 and 1300x1300 pixels."
    ),
});

const ProductSettingForm = () => {
  const { showAlert } = useAlert();
  const searchParams = useSearchParams();

  const productDetailId = searchParams.get("id");

  const { data: menuResponse, isLoading: isPending } = useMenu(
    productDetailId ? "1" : "",
    moment().format("YYYY-MM-DDTHH:mm:ss"),
    productDetailId ?? ""
  );
  const updating_product = (menuResponse?.data as MenuItem[])?.[0] ?? null;
  // console.log({ productDetailId, updating_product, menuResponse });
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: uploadImage, isPending: isPendingImageUpload } =
    useUploadMultiImages(); // Assuming this hook handles image uploads

  const { mutate, isPending: isPendingAddUpdate } = useAddUpdateProduct();

  const { data } = useGetStoreMenus();
  const { data: unitsData } = useGetUnits();
  const { user } = useAuth();

  const products = (data?.data ?? []) as AllMenuProduct[] | [];
  // console.log(products);
  const units = (unitsData?.data ?? []) as ProductUnit[] | [];

  const [imagePreviews, setImagePreviews] = useState<
    {
      file: File | null;
      preview: string;
      id?: number;
      status?: number;
      ContentRefId?: string;
    }[]
  >([]);
  const [deletedImages, setDeletedImages] = useState<
    { id: number; ContentRefId: string; preview: string; file: File }[]
  >([]);
  const [replacingImageIndex, setReplacingImageIndex] = useState<number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      unitId: "",
      unitPrice: 0.0,
      discount: 0.0,
      discountPercent: 0.0,
      taxPercent: 0.0,
      readyTime: 0,
      status: 1, // Default to active
      description: "",
      images: [],
      code: "",
    },
  });

  useEffect(() => {
    if (!productDetailId) return;
    form.setValue("productId", updating_product?.productId?.toString());
    form.setValue("unitId", updating_product?.unitId?.toString());
    form.setValue(
      "unitPrice",
      parseFloat(updating_product?.unitprice?.toFixed(2))
    );
    form.setValue(
      "discount",
      parseFloat(updating_product?.linediscount?.toFixed(2))
    );
    form.setValue("taxPercent", parseFloat(updating_product?.tax?.toFixed(2)));
    form.setValue("readyTime", updating_product?.kitchenTimeInMins);
    form.setValue("description", updating_product?.description);
    form.setValue("code", updating_product?.barcode);
  }, [updating_product, form, productDetailId]);

  useEffect(() => {
    if (
      updating_product &&
      productDetailId &&
      updating_product.menuJSON &&
      updating_product.productDetailId === parseInt(productDetailId)
    ) {
      try {
        const jsonArray = JSON.parse(updating_product.menuJSON) as MenuImage[];
        const existingImages = jsonArray.map((item) => ({
          file: null,
          preview: `${API_URL}/${item.FileName.replace(
            /^wwwroot[\\/]+/,
            ""
          ).replace(/\\/g, "/")}`,
          id: item.Id,
          status: 1, // 1 for active
          ContentRefId: item.ContentRefId,
        }));
        setImagePreviews(existingImages);
      } catch (err) {
        console.error("Error parsing menuJSON:", err);
      }
    }
  }, [updating_product, productDetailId]);

  const unitPrice = form.watch("unitPrice");
  // const discount = form.watch("discount");
  // const discountPercent = form.watch("discountPercent");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).reverse();

    if (files.length === 0) return;

    const newImagePreviews: {
      file: File;
      preview: string;
      id?: number;
      status?: number;
      ContentRefId?: string;
    }[] = [];
    const imagePromises: Promise<void>[] = [];

    files.forEach((file) => {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image "${file.name}" size should be less than 5MB`);
        return;
      }
      const reader = new FileReader();
      const promise = new Promise<void>((resolve) => {
        reader.onloadend = () => {
          const preview = reader.result as string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const img = new (window as any).Image();
          img.src = preview;
          img.onload = () => {
            // Validate dimensions
            if (
              img.width >= IMAGE_MIN &&
              img.width <= IMAGE_MAX &&
              img.height >= IMAGE_MIN &&
              img.height <= IMAGE_MAX
            ) {
              // If we're replacing an image
              if (replacingImageIndex !== null && replacingImageIndex >= 0) {
                const existingImage = imagePreviews[replacingImageIndex];
                newImagePreviews.push({
                  file,
                  preview,
                  id: existingImage.id,
                  ContentRefId: existingImage.ContentRefId,
                  status: 1,
                });
              } else {
                // New image
                newImagePreviews.push({ file, preview, status: 1 });
              }
            } else {
              toast.error(
                `Image "${file.name}" dimensions must be between 400x400 and 1300x1300 pixels.`
              );
            }
            resolve();
          };
          img.onerror = () => {
            toast.error(`Could not load image "${file.name}".`);
            resolve();
          };
        };
        reader.readAsDataURL(file);
      });
      imagePromises.push(promise);
    });

    Promise.all(imagePromises).then(() => {
      let updatedImages;
      if (replacingImageIndex !== null) {
        // Replace the image at the specified index
        updatedImages = [...imagePreviews];
        updatedImages[replacingImageIndex] = newImagePreviews[0];
      } else {
        // Add new images
        updatedImages = [...imagePreviews, ...newImagePreviews].slice(0, 20);
      }

      setImagePreviews(updatedImages);
      setReplacingImageIndex(null); // Reset replacing state
      form.setValue(
        "images",
        updatedImages.map((img) => ({ file: img.file, preview: img.preview }))
      );
      form.clearErrors("images");
    });
  };

  const handleReplaceClick = (index: number) => {
    setReplacingImageIndex(index);
    fileInputRef.current?.click();
  };

  const removeImage = async (index: number) => {
    const imageToRemove = imagePreviews[index];

    // If it's an existing image (has id), add it to deletedImages
    if (imageToRemove.id && imageToRemove.ContentRefId) {
      const response = await fetch(
        `/api/image-proxy?url=${encodeURIComponent(imageToRemove.preview)}`
      );
      const blob = await response.blob();

      // Try to guess the extension from blob type or URL
      const extensionFromMime = blob.type.split("/").pop(); // e.g., "png"
      const nameParts =
        imageToRemove.preview.split("/").pop()?.split(".") || [];
      const ext = nameParts.length > 1 ? nameParts.pop() : extensionFromMime;
      const base = nameParts.join(".");
      const newFileName = `${base}_${imageToRemove.id}_2.${ext}`;

      const file = new File([blob], newFileName, {
        type: blob.type,
        lastModified: Date.now(),
      });
      setDeletedImages((prev) => [
        ...prev,
        {
          id: imageToRemove.id as number,
          ContentRefId: imageToRemove.ContentRefId as string,
          file: file as File,
          preview: imageToRemove.preview,
        },
      ]);
    }

    // Remove from UI
    const updatedImages = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updatedImages);
    form.setValue(
      "images",
      updatedImages.map((img) => ({ file: img.file, preview: img.preview }))
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle image uploads first
    // Now, handle the product data submission with the uploaded image URLs
    const productData = {
      Id: productDetailId ?? 0,
      Barcode: values.code,
      ProductId: parseInt(values.productId),
      StoreId: 1,
      UnitId: parseInt(values.unitId),
      Unitprice: parseFloat(values.unitPrice?.toFixed(2)),
      SchemeAmount: parseFloat(
        values.discount ? values.discount?.toFixed(2) : "0"
      ),
      TaxInPercentage: parseFloat(values.taxPercent?.toFixed(2)),
      KitchenTimeInMins: values.readyTime,
      status: values.status,
      Description: values.description,
      Producturl: updating_product?.producturl ?? "",
      RowVer: 1,
      createdAt: moment().utc().format(),
      lastUpdatedAt: moment().utc().format(),
      createdBy: user?.id,
      lastUpdatedBy: user?.id,
    };

    // console.log("Submitting Product Data:", productData);

    mutate(productData, {
      onSuccess: async (res) => {
        // console.log(res);
        if (res?.status == true) {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.MENU, "1", "0", "0"],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.MENU, "1", "0", "1"],
          });
          toast.success(res?.message);

          const productDetailId: string | number =
            (res?.data as { id?: number })?.id ?? 0;

          // console.log({ imagePreviews, deletedImages });
          if (
            productDetailId &&
            (imagePreviews?.length > 0 || deletedImages.length > 0)
          ) {
            const formData = new FormData();

            // Process all images
            for (const image of imagePreviews) {
              if (image.file) {
                let fileName = image.file.name;

                // Modify the filename if ID is available
                if (image.id) {
                  const nameParts = fileName.split(".");
                  const extension = nameParts.pop(); // get the extension
                  const baseName = nameParts.join("."); // in case filename has dots
                  fileName = `${baseName}_${image.id}_1.${extension}`;
                }

                // Append file with modified name
                formData.append("files", image.file, fileName);
              }
            }
            for (const image of deletedImages) {
              if (image.file) {
                // Modify the filename if ID is available
                if (image.id) {
                  formData.append("files", image.file);
                }

                // Append file with modified name
              }
            }

            // Add deleted image IDs
            // if (deletedImages.length > 0) {
            //   formData.append(
            //     "deletedImageIds",
            //     JSON.stringify(deletedImages.map((img) => img.id))
            //   );
            // }

            formData.append("id", productDetailId?.toString());
            formData.append("userid", user?.id?.toString() ?? "0");
            formData.append("remarks", "");

            // for (const [key, value] of formData.entries()) {
            //   console.log(key, "=>", value);
            // }
            // return;
            if (
              imagePreviews.some((img) => img.file) ||
              deletedImages.length > 0
            ) {
              try {
                const res: RESPONSE = await new Promise((resolve, reject) => {
                  uploadImage(formData, {
                    onSuccess: (uploadRes) => resolve(uploadRes),
                    onError: (uploadErr) => reject(uploadErr),
                  });
                });
                // console.log({ res });
                if (res?.data && Array.isArray(res.data)) {
                  router.replace("/dashboard/products");
                } else {
                  toast.error(
                    "Failed to get image URLs from upload response: Data format is incorrect."
                  );
                  return;
                }
              } catch (err) {
                console.error("Image upload error:", err);
                toast.error("Failed to upload image.");
                return;
              }
            }
            toast.success("Product form submitted!");
            router.replace("/dashboard/products");
          } else {
            router.replace("/dashboard/products");
          }
        } else {
          showAlert({
            title: "Error",
            description: `${res?.message ?? STATUS.SERVER_ERROR}`,
            confirmText: "OK",
          });
          console.log("Product ID not found in the message.");
        }
      },
      onError: (err) => {
        console.log({ err });
      },
    });
  }
  //   console.log(form.formState.errors);
  return (
    <Form {...form}>
      {isPending && <Spinner />}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onError={(e) => console.log({ e })}
        className="w-full max-w-4xl mx-auto space-y-6 p-6 rounded-lg shadow-md"
      >
        {/* Product ID and Unit ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            disabled={isPending || isPendingImageUpload || isPendingAddUpdate}
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={
                              isPending ||
                              isPendingImageUpload ||
                              isPendingAddUpdate
                            }
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between w-full",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <span className="pl-6">
                              {field.value
                                ? products.find(
                                    (product) =>
                                      product.id === parseInt(field.value)
                                  )?.name
                                : "Select Product"}
                            </span>
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <CommandUI>
                          <CommandInput
                            placeholder="Search products..."
                            className="h-9"
                          />
                          <CommandList className="w-full">
                            <CommandEmpty>No products found.</CommandEmpty>
                            <CommandGroup>
                              {products
                                .filter((product) => product?.id !== 0)
                                .map((product) => (
                                  <CommandItem
                                    value={product.name}
                                    key={product.id}
                                    onSelect={() => {
                                      form.setValue(
                                        "productId",
                                        product.id?.toString()
                                      );
                                    }}
                                  >
                                    {product.name}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        product.id === parseInt(field.value)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </CommandUI>
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isPending || isPendingImageUpload || isPendingAddUpdate}
            control={form.control}
            name="unitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={
                              isPending ||
                              isPendingImageUpload ||
                              isPendingAddUpdate
                            }
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between w-full",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <span className="pl-6">
                              {field.value
                                ? units.find(
                                    (unit) => unit.id === parseInt(field.value)
                                  )?.name
                                : "Select Unit"}
                            </span>
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <CommandUI>
                          <CommandInput
                            placeholder="Search Units..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No units found.</CommandEmpty>
                            <CommandGroup>
                              {units.map((unit) => (
                                <CommandItem
                                  value={unit.name?.toString()}
                                  key={unit.id}
                                  onSelect={() => {
                                    form.setValue(
                                      "unitId",
                                      unit.id?.toString()
                                    );
                                  }}
                                >
                                  {unit.name}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      unit.id === parseInt(field.value)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </CommandUI>
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Pricing and Discount */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            disabled={isPending || isPendingImageUpload || isPendingAddUpdate}
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Code</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      // disabled={true}

                      placeholder="Product Code"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      className="pl-9"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isPending || isPendingImageUpload || isPendingAddUpdate}
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      {...field}
                      onChange={(e) => {
                        field.onChange(parseFloat(e.target.value));
                      }}
                      className="pl-9"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isPending || isPendingImageUpload || isPendingAddUpdate}
            control={form.control}
            name="taxPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax %</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Tax Percentage"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      className="pl-9"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Tax, Ready Time, Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            disabled={isPending || isPendingImageUpload || isPendingAddUpdate}
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Discount Amount"
                      {...field}
                      onChange={(e) => {
                        if (unitPrice > 0) {
                          const calculatedPercent =
                            (parseFloat(e.target.value) / unitPrice) * 100;

                          form.setValue(
                            "discountPercent",
                            parseFloat(calculatedPercent.toFixed(2)),
                            {
                              shouldValidate: true,
                            }
                          );
                        }
                        field.onChange(parseFloat(e.target.value));
                      }}
                      className="pl-9"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isPending || isPendingImageUpload || isPendingAddUpdate}
            control={form.control}
            name="discountPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount %</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Discount Percentage"
                      {...field}
                      onChange={(e) => {
                        if (unitPrice > 0) {
                          const calculatedAmount =
                            (parseFloat(e.target.value) / 100) * unitPrice;

                          form.setValue(
                            "discount",
                            parseFloat(calculatedAmount.toFixed(2)),
                            {
                              shouldValidate: true,
                            }
                          );
                        }
                        field.onChange(parseFloat(e.target.value));
                      }}
                      className="pl-9"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isPending || isPendingImageUpload || isPendingAddUpdate}
            control={form.control}
            name="readyTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ready Time (mins)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      placeholder="Ready Time"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Description */}
        <FormField
          disabled={isPending || isPendingImageUpload || isPendingAddUpdate}
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value || ""} // Ensure value is a string
                  onChange={field.onChange}
                  placeholder="Provide a detailed description of the product..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center items-center">
          <FormField
            disabled={isPending || isPendingImageUpload || isPendingAddUpdate}
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex gap-4">
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) =>
                      form.setValue("status", parseInt(value))
                    }
                    defaultValue={field.value?.toString()}
                    className="flex flex-row"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="1" />
                      </FormControl>
                      <FormLabel className="font-normal">Active</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="2" />
                      </FormControl>
                      <FormLabel className="font-normal">In-Active</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Image Upload */}
        <FormItem>
          <FormLabel>Product Image(s)</FormLabel>
          <FormControl>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple={replacingImageIndex === null}
                className="hidden"
                id="product-image-upload"
                disabled={
                  isPending || isPendingImageUpload || isPendingAddUpdate
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReplacingImageIndex(null);
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2"
                disabled={imagePreviews.length >= 20 || isPendingImageUpload}
              >
                <Upload className="h-4 w-4" /> Upload Attachment
              </Button>
              <p className="text-xs text-muted-foreground">
                Max file size: 5MB per image. Dimensions: 400x400 to 1300x1300
                pixels.
              </p>
            </div>
          </FormControl>
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {imagePreviews.map((img, index) => (
              <div
                key={index}
                className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group"
              >
                <Image
                  src={img.preview}
                  alt={`Product Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    disabled={
                      isPending || isPendingImageUpload || isPendingAddUpdate
                    }
                    onClick={() => handleReplaceClick(index)}
                    className="bg-white/90 text-primary p-2 rounded-full hover:bg-white transition-colors shadow-sm"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute top-1 right-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={
                      isPending || isPendingImageUpload || isPendingAddUpdate
                    }
                    className="bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90 transition-colors shadow-sm z-10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <FormMessage /> {/* Display Zod errors for images */}
        </FormItem>
        <Button
          type="submit"
          className="w-full"
          disabled={
            form.formState.isSubmitting ||
            isPendingImageUpload ||
            isPendingAddUpdate
          }
        >
          {(form.formState.isSubmitting ||
            isPendingImageUpload ||
            isPendingAddUpdate) && <Loader2 className="animate-spin mr-2" />}
          {productDetailId ? "Update Product" : "Save Product"}
        </Button>
      </form>
    </Form>
  );
};

export default ProductSettingForm;
