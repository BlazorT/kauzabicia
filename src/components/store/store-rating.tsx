// src/components/store/StoreInfo/components/StoreRating.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useGetStoreReviews } from "@/hooks/useMenu";
import { Review, StoreDetail } from "@/utils/types";
import { Loader2, StarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import StoreReview from "./store-reviews";

interface StoreRatingProps {
  rating?: number;
  store: StoreDetail;
  showReviews?: boolean;
}

const REVIEW_FILTERS = [
  {
    id: 1,
    name: "Newest",
  },
  {
    id: 2,
    name: "Highest rating",
  },
  {
    id: 3,
    name: "Lowest rating",
  },
];

export const StoreRating = ({
  rating,
  store,
  showReviews = false,
}: StoreRatingProps) => {
  const { data: reviewsRes, isPending } = useGetStoreReviews(store?.id);

  const [isRatingDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState(REVIEW_FILTERS[0]);

  const reviews = useMemo(() => reviewsRes?.data ?? [], [reviewsRes]) as
    | Review[]
    | [];

  const filteredStoreRnR = useMemo(() => {
    if (reviews) {
      // Group by `createdAt`
      const groupedData = reviews.reduce<
        Record<string, Review & { products: Review[] }>
      >((acc, item) => {
        const key = item.createdAt;
        if (!acc[key]) {
          acc[key] = { ...item, products: [] };
        }
        if (item.productDetailId !== 0 && item.ratingScore !== 0) {
          acc[key].products.push(item);
        }
        return acc;
      }, {});

      // Convert the grouped data back to an array
      const transformedData = Object.values(groupedData);

      // console.log({transformedData});

      // Apply sorting based on the filter
      if (filter.id === 1) {
        return transformedData.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
      } else if (filter.id === 2) {
        return transformedData.sort((a, b) => b.ratingScore - a.ratingScore);
      } else if (filter.id === 3) {
        return transformedData.sort((a, b) => a.ratingScore - b.ratingScore);
      }

      return transformedData;
    }
  }, [reviews, filter]);

  const { ratingCounts, totalRatings, averageRating } = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let sum = 0;
    reviews.forEach(({ ratingScore, productDetailId }) => {
      if (ratingScore > 0 && productDetailId === 0) {
        // Exclude 0 ratings
        counts[ratingScore] = (counts[ratingScore] || 0) + 1;
        total++;
        sum += ratingScore;
      }
    });

    return {
      ratingCounts: counts,
      totalRatings: total,
      averageRating: total > 0 ? (sum / total).toFixed(1) : 0,
    };
  }, [reviews]);

  if (!rating) return null;

  return (
    <>
      <div className="flex text-sm items-center gap-1">
        <StarIcon className="text-yellow-400 fill-yellow-400" size={14} />
        <span className="font-medium">{rating.toFixed(1)}/5</span>
        {showReviews && (
          <>
            {isPending ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : reviews?.length === 0 ? null : (
              <span
                className="cursor-pointer text-muted-foreground hover:text-primary ms-1"
                onClick={() => setIsDialogOpen(true)}
              >
                See Reviews
              </span>
            )}
          </>
        )}
      </div>

      <Dialog open={isRatingDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto max-w-[100vw] md:max-w-[80vw] lg:max-w-[40vw] xl:max-w-[30vw]">
          <DialogHeader>
            <DialogTitle>Reviews</DialogTitle>
            <p className="text-sm text-muted-foreground">{store?.name}</p>
          </DialogHeader>

          <div className="bg-card rounded-lg border p-4 w-full">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full">
              {/* Left side - Global Rating */}
              <div className="flex-1 flex flex-col items-center justify-center sm:border-r sm:pr-8 space-y-2 min-w-0">
                {/* <div className="flex-1 flex flex-col items-center justify-center sm:border-r sm:pr-8 space-y-2"> */}
                <span className="text-3xl font-bold">{averageRating}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Number(averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {totalRatings} global ratings
                </span>
              </div>

              {/* Right side - Rating Distribution */}
              <div className="flex-1 space-y-2">
                {Object.entries(ratingCounts)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-sm w-12">{key} star</span>
                      <Progress
                        value={(value / totalRatings) * 100}
                        className="flex-1 h-2"
                      />
                      <span className="text-sm w-12 text-right">
                        {((value / totalRatings) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sort Filters */}
          <div className="flex gap-2 w-full">
            {REVIEW_FILTERS.map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  filter.id === filterOption.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                }`}
              >
                {filterOption.name}
              </button>
            ))}
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredStoreRnR?.map((review, index) => (
              <StoreReview review={review} key={index} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
