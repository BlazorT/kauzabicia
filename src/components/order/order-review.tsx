import { useAlert } from "@/context/alert-context";
import { useAuth } from "@/context/auth-context";
import { usePostReview } from "@/hooks/useOrder";
import { OrderProduct } from "@/utils/types";
import { MessageSquare, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { cleanPath } from "@/utils/menuUtils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

type OrderReviewProps = {
  orderItems: OrderProduct[];
};

const OrderReview: React.FC<OrderReviewProps> = ({ orderItems }) => {
  const { mutate: postReview, isPending } = usePostReview();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  //   console.log({ orderItems });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [itemReviews, setItemReviews] = useState<{
    [key: number]: {
      liked: boolean | null;
      review: string;
      showReview: boolean;
    };
  }>({});

  const order = orderItems[0];
  //   console.log({ order });
  const hasPassed48Hours =
    order?.lastUpdatedAt &&
    moment.utc(order.lastUpdatedAt).diff(moment.utc(), "hours") > 48;

  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const reviewedOrders = JSON.parse(
      localStorage.getItem("reviewedOrders") || "{}"
    );
    const orderKey = `${order?.saleId}_${user?.id || process.env.KIOSK_ID}`;
    setHasReviewed(!!reviewedOrders[orderKey]);
  }, [order?.saleId, user?.id]);

  const canReview =
    user && order?.status === 5 && !hasPassed48Hours && !hasReviewed;

  const handleStarClick = (star: number) => {
    setRating(star);
    setIsOpen(true);
  };

  const handleItemLike = (item: OrderProduct, liked: boolean) => {
    setItemReviews((prev) => ({
      ...prev,
      [item.productDetailId]: {
        ...prev[item.productDetailId],
        liked: prev[item.productDetailId]?.liked === liked ? null : liked,
        review: prev[item.productDetailId]?.review || "",
        showReview: prev[item.productDetailId]?.showReview || false,
      },
    }));
  };

  const handleItemReview = (item: OrderProduct) => {
    setItemReviews((prev) => ({
      ...prev,
      [item.productDetailId]: {
        ...prev[item.productDetailId],
        showReview: !prev[item.productDetailId]?.showReview,
      },
    }));
  };

  const handleItemReviewText = (item: OrderProduct, text: string) => {
    setItemReviews((prev) => ({
      ...prev,
      [item.productDetailId]: {
        ...prev[item.productDetailId],
        review: text.slice(0, 100),
      },
    }));
  };

  const handleSubmit = async () => {
    const transformedArray = [
      {
        Id: 0,
        productDetailId: 0,
        storeId: parseInt(order?.sku ?? "1"),
        reviewRemarks: reviewText ?? "",
        ratingScore: rating ?? 0,
        status: 1,
        createdBy: user?.id,
        lastUpdatedBy: user?.id,
        lastUpdatedAt: moment().utc().format(),
        createdAt: moment().utc().format(),
        rowVer: 1,
      },
      ...Object.entries(itemReviews)
        .filter(([, value]) => value.liked !== null)
        .map(([key, value]) => ({
          Id: 0,
          productDetailId: parseInt(key, 10),
          storeId: parseInt(order?.sku ?? "1"),
          reviewRemarks: value.review,
          ratingScore: value.liked ? 1 : 2,
          status: 1,
          createdBy: user?.id,
          lastUpdatedBy: user?.id,
          lastUpdatedAt: moment().utc().format(),
          createdAt: moment().utc().format(),
          rowVer: 1,
        })),
    ];
    postReview(
      { reviewBody: transformedArray },
      {
        onSuccess: (res) => {
          if (res && res.status) {
            // Save to localStorage
            const reviewedOrders = JSON.parse(
              localStorage.getItem("reviewedOrders") || "{}"
            );
            const orderKey = `${order?.saleId}_${user?.id}`;
            reviewedOrders[orderKey] = {
              timestamp: moment().utc().format(),
              rating,
              review: reviewText,
            };
            localStorage.setItem(
              "reviewedOrders",
              JSON.stringify(reviewedOrders)
            );

            // Update hasReviewed state
            setHasReviewed(true);

            showAlert({
              title: "Success",
              description: `Thank you for rating <b>${order?.tradeName} - ${order?.storeAddress}</b>`,
              confirmText: "OK",
            });
            setIsOpen(false);
          }
        },
      }
    );
  };

  if (!canReview) return null;

  return (
    <div>
      <div className="p-0 flex items-center justify-center gap-5">
        <p>
          Leave a review by{" "}
          {moment.utc(order?.createdAt).add("hours", 48).format("DD MMM")}
        </p>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 cursor-pointer ${
                star <= (hover || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-yellow-400"
              }`}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            />
          ))}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogDescription className="hidden"></DialogDescription>
        <DialogContent
          className="max-w-3xl bg-card/95"
          aria-describedby="review-rate"
        >
          <DialogHeader>
            <div className="flex items-start gap-2">
              {order.logoPath && (
                <Image
                  src={`${BASE_URL}${order.logoPath}`}
                  alt={order.tradeName}
                  width={64}
                  height={64}
                  className="object-contain rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0 space-y-2">
                <DialogTitle className="text-xl font-semibold truncate">
                  {order.tradeName} - {order.storeAddress}
                </DialogTitle>
                <p className="text-sm text-gray-500 text-start">
                  {moment.utc(order?.createdAt).format("ddd, DD MMM, hh:mm A")}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3  max-h-[75dvh] overflow-y-auto">
            <div className="flex bg-card shadow-sm shadow-card justify-between items-center rounded-md p-4 border-input border-1">
              <p className="text-lg font-semibold">You rated</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-7 h-7 cursor-pointer ${
                      star <= (hover || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-yellow-400"
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col bg-card shadow-sm shadow-card justify-between items-start gap-3 rounded-md p-4 border-input border-1">
              <p className="text-lg font-semibold">
                Tell others more about this restaurant
              </p>
              <div className="w-full relative">
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value.slice(0, 200))}
                  placeholder="Write your review here..."
                  className="h-28 resize-none overflow-y-auto"
                  maxLength={200}
                />
                <p className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                  {reviewText.length}/200
                </p>
              </div>
            </div>

            <div className="space-y-4 bg-card shadow-sm rounded-lg p-4 border-input border-1">
              {orderItems.map((item) => (
                <div key={item.productDetailId} className="">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.url && (
                        <Image
                          src={cleanPath(item.url)}
                          alt={item.productName}
                          width={48}
                          height={48}
                          className="object-contain rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{item.productName}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleItemLike(item, true)}
                        className={`border-1 rounded-full p-2 flex items-center justify-center hover:border-primary ${
                          itemReviews[item.productDetailId]?.liked === true
                            ? "bg-primary"
                            : ""
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => handleItemLike(item, false)}
                        className={`border-1 rounded-full p-2 flex items-center justify-center hover:border-primary ${
                          itemReviews[item.productDetailId]?.liked === false
                            ? "bg-primary"
                            : ""
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleItemReview(item)}
                        className={`rounded-full ${
                          itemReviews[item.productDetailId]?.showReview
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : ""
                        }`}
                      >
                        <MessageSquare className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  {itemReviews[item.productDetailId]?.showReview && (
                    <div className="relative mt-2">
                      <Textarea
                        value={itemReviews[item.productDetailId]?.review || ""}
                        onChange={(e) =>
                          handleItemReviewText(item, e.target.value)
                        }
                        placeholder="Write a short review for this item..."
                        className="h-12 resize-none text-sm"
                        maxLength={50}
                      />
                      <p className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                        {itemReviews[item.productDetailId]?.review?.length || 0}
                        /50
                      </p>
                    </div>
                  )}
                  {/* {index < orderItems.length - 1 && (
                    <Separator className="mb-3" />
                  )} */}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !rating}
              className="w-full"
            >
              {isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderReview;
