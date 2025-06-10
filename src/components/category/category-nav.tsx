// src/app/[storeId]/components/CategoryNav/CategoryNav.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryButton } from "./category-button";
import { DealItem, MenuItem } from "@/utils/types";

interface CategoryNavProps {
  categories: {
    id: number;
    name: string;
    items: (MenuItem | DealItem)[];
  }[];
  activeCategory: number | null;
  setActiveCategory: (id: number) => void;
  scrollToCategory: (id: number) => void;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollLeft: () => void;
  scrollRight: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const CategoryNav = ({
  categories,
  activeCategory,
  setActiveCategory,
  scrollToCategory,
  canScrollLeft,
  canScrollRight,
  scrollLeft,
  scrollRight,
  scrollRef,
}: CategoryNavProps) => {
  return (
    <div className="sticky top-0 bg-background shadow-sm z-10">
      <div className="relative container lg:max-w-[90rem] mx-auto px-0">
        {canScrollLeft && (
          <Button
            size="icon"
            className="absolute left-[-10px] top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-full shadow-md z-20"
            onClick={scrollLeft}
          >
            <ChevronLeft />
          </Button>
        )}

        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-5 py-1 min-w-max">
            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  scrollToCategory(category.id);
                }}
              />
            ))}
          </div>
        </div>

        {canScrollRight && (
          <Button
            size="icon"
            className="absolute right-[-10px] top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-full shadow-md z-20"
            onClick={scrollRight}
          >
            <ChevronRight />
          </Button>
        )}
      </div>
    </div>
  );
};
