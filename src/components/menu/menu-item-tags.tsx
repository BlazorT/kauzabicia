import { Star } from "lucide-react"; // Only import Star if you're using it elsewhere

interface MenuItemTagsProps {
  isSpecial: boolean;
  size?: "sm" | "md";
}

export const MenuItemTags = ({ isSpecial, size = "sm" }: MenuItemTagsProps) => {
  const baseClass =
    "inline-flex items-center gap-1 rounded-full font-semibold shadow-sm border";
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <div className="flex gap-2 relative">
      {isSpecial && (
        <span
          className={`bg-primary text-primary-foreground border-primary ${baseClass} ${sizeClass}`}
        >
          <Star size={size === "md" ? 16 : 12} />
          Special
        </span>
      )}
    </div>
  );
};
