"use client";
import { useAuth } from "@/context/auth-context";
import { useUploadMultiImages } from "@/hooks/useAuth"; // Assuming useUploadImage is still relevant for product images
import {
  useAddUpdateProduct,
  useGetStoreMenus,
  useGetUnits,
} from "@/hooks/useMenu";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronsUpDown,
  Clock,
  DollarSign,
  Info,
  Loader2,
  Package,
  Percent,
  Tag,
  Upload,
  X,
} from "lucide-react"; // Import new icons
import Image from "next/image";
import { useRef, useState } from "react";
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
import { Textarea } from "../ui/textarea"; // Assuming you have a Textarea component
import { useRouter } from "next/navigation";
import { RESPONSE } from "@/utils/types";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/utils/queryKeys";
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
    .max(1000, "Ready time cannot exceed 1000 minutes")
    .int("Ready time must be an integer")
    .refine((val) => !isNaN(val), { message: "Ready time must be a number" }),
  status: z.number().optional(),
  description: z
    .string()
    .max(300, "Description cannot exceed 300 characters")
    .optional(),
  images: z
    .array(
      z.object({
        file: z.any(), // File object for upload
        preview: z.string(), // Base64 string for preview
      })
    )
    .max(5, "You can upload a maximum of 5 images")
    .refine(
      (files) =>
        files.every(
          (file) =>
            file.file.type.startsWith("image/") &&
            file.file.size <= 5 * 1024 * 1024
        ), // 5MB limit
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
                  img.width >= 400 &&
                  img.width <= 1300 &&
                  img.height >= 400 &&
                  img.height <= 1300
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
  //   const { showAlert } = useAlert();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: uploadImage, isPending: isPendingImageUpload } =
    useUploadMultiImages(); // Assuming this hook handles image uploads

  const { mutate, isPending: isPendingAddUpdate } = useAddUpdateProduct();

  const { data } = useGetStoreMenus();
  const { data: unitsData } = useGetUnits();
  const { user } = useAuth();

  const products = (data?.data ?? []) as AllMenuProduct[] | [];
  const units = (unitsData?.data ?? []) as ProductUnit[] | [];

  const [imagePreviews, setImagePreviews] = useState<
    { file: File; preview: string }[]
  >([]);
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
    },
  });

  //   const unitPrice = form.watch("unitPrice");
  //   const discountAmount = form.watch("discount");
  //   const discountPercentage = form.watch("discountPercent");
  //   const unitId = form.watch("unitId");
  //   const productId = form.watch("productId");
  //   const status = form.watch("status");
  //   const readyTime = form.watch("readyTime");
  //   const taxPercent = form.watch("taxPercent");

  //   console.log({
  //     unitPrice,
  //     discountAmount,
  //     discountPercentage,
  //     readyTime,
  //     status,
  //     productId,
  //     unitId,
  //     taxPercent,
  //   });

  //   // Effect to handle inverse calculation of discount fields
  //   useEffect(() => {
  //     // If discount amount is being edited
  //     if (unitPrice > 0 && typeof discountAmount === "number") {
  //       const calculatedPercent = (discountAmount / unitPrice) * 100;
  //       form.setValue(
  //         "discountPercent",
  //         parseFloat(calculatedPercent.toFixed(2)),
  //         {
  //           shouldValidate: true,
  //         }
  //       );
  //     }
  //   }, [discountAmount, unitPrice, form]);

  //   useEffect(() => {
  //     // If discount percentage is being edited
  //     if (unitPrice > 0 && typeof discountPercentage === "number") {
  //       const calculatedAmount = (discountPercentage / 100) * unitPrice;
  //       form.setValue("discount", parseFloat(calculatedAmount.toFixed(2)), {
  //         shouldValidate: true,
  //       });
  //     }
  //   }, [discountPercentage, unitPrice, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const newImagePreviews: { file: File; preview: string }[] = [];
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
              img.width >= 400 &&
              img.width <= 1300 &&
              img.height >= 400 &&
              img.height <= 1300
            ) {
              newImagePreviews.push({ file, preview });
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
      const updatedImages = [...imagePreviews, ...newImagePreviews].slice(0, 5); // Limit to 5 images
      setImagePreviews(updatedImages);
      form.setValue(
        "images",
        updatedImages.map((img) => ({ file: img.file, preview: img.preview }))
      );
      form.clearErrors("images"); // Clear image errors after new selection
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updatedImages);
    form.setValue(
      "images",
      updatedImages.map((img) => ({ file: img.file, preview: img.preview }))
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the input field to allow re-uploading the same file
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle image uploads first
    console.log({ values });
    // Now, handle the product data submission with the uploaded image URLs
    const productData = {
      id: 0,
      Barcode: "",
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
      Producturl: "",
      RowVer: 1,
    };

    console.log("Submitting Product Data:", productData);

    mutate(productData, {
      onSuccess: async (res) => {
        console.log(res);
        if (res?.status == true) {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STORE_MENUS] });
          toast.success(res?.message);
          const message = res?.message ?? "";
          const regex = /#(\d+)/; // Matches '#' followed by one or more digits
          const match = message.match(regex);

          let productId = "";
          if (match && match[1]) {
            productId = match[1];
            console.log(productId); // Output: "417"
          }
          if (productId && values.images.length > 0) {
            const uploadedImageUrls: string[] = [];
            const formData = new FormData();
            for (const image of values.images) {
              formData.append("files", image.file);

              // Await each image upload
            }
            formData.append("id", productId); // Append the room ID
            formData.append("userid", user?.id?.toString() ?? "0"); // Append the user ID
            formData.append("remarks", ""); // Append remarks
            if (values.images.length > 0) {
              try {
                const res: RESPONSE = await new Promise((resolve, reject) => {
                  uploadImage(formData, {
                    onSuccess: (uploadRes) => resolve(uploadRes),
                    onError: (uploadErr) => reject(uploadErr),
                  });
                });
                console.log({ res });
                if (res?.data && Array.isArray(res.data)) {
                  // If res.data is an array of URLs, iterate and process each one
                  res.data.forEach((urlPath: string) => {
                    // Clean the file path (replace backslashes, add leading slash)
                    const cleanedFilePath = "/" + urlPath.replace(/\\/g, "/"); // Replace backslashes with forward slashes
                    uploadedImageUrls.push(cleanedFilePath);
                  });
                  router.replace("/dashboard/menu");
                } else {
                  // If res.data is not an array or is missing, log an error and stop
                  toast.error(
                    "Failed to get image URLs from upload response: Data format is incorrect."
                  );
                  return;
                }
              } catch (err) {
                console.error("Image upload error:", err);
                toast.error("Failed to upload image.");
                return; // Stop submission if an image upload fails
              }
            }
            toast.success("Product form submitted! (Check console for data)");
          } else {
            router.replace("/dashboard/menu");
          }
        } else {
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onError={(e) => console.log({ e })}
        className="w-full max-w-4xl mx-auto space-y-6 p-6 rounded-lg shadow-md"
      >
        {/* Product ID and Unit ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Code</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
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
                                      product.productId ===
                                      parseInt(field.value)
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
                                .filter((product) => product?.productId !== 0)
                                .map((product) => (
                                  <CommandItem
                                    value={product.name}
                                    key={product.productId}
                                    onSelect={() => {
                                      console.log(product);
                                      form.setValue(
                                        "productId",
                                        product.productId?.toString()
                                      );
                                    }}
                                  >
                                    {product.name}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        product.productId ===
                                          parseInt(field.value)
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
          <FormField
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
          <FormField
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
          <FormField
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
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
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

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <div className="relative">
                  <Info className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                  <Textarea
                    placeholder="Provide a detailed description of the product (max 300 characters)"
                    {...field}
                    className="min-h-[80px] pl-9 resize-y"
                    maxLength={300}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <FormItem>
          <FormLabel>Product Images (Min 5)</FormLabel>
          <FormControl>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden"
                id="product-image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
                disabled={imagePreviews.length >= 5 || isPendingImageUpload}
              >
                <Upload className="h-4 w-4" /> Upload Images
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
                className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
              >
                <Image
                  src={img.preview}
                  alt={`Product Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90 transition-colors shadow-sm z-10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
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
          Save Product
        </Button>
      </form>
    </Form>
  );
};

export default ProductSettingForm;
