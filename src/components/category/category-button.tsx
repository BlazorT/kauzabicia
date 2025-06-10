// src/app/[storeId]/components/CategoryNav/CategoryButton.tsx
import { Button } from "@/components/ui/button";

interface CategoryButtonProps {
  category: {
    id: number;
    name: string;
    items: unknown[];
  };
  isActive: boolean;
  onClick: () => void;
}

export const CategoryButton = ({
  category,
  isActive,
  onClick,
}: CategoryButtonProps) => (
  <Button
    data-category-button={category.id}
    variant="ghost"
    className={`whitespace-nowrap px-2 pb-2 transition-colors duration-200 border-b-3 rounded-[0.3rem] text-lg ${
      isActive
        ? "border-primary text-primary font-semibold"
        : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
    }`}
    onClick={onClick}
  >
    {category.name} ({category.items.length})
  </Button>
);
