// src/components/menu/MenuItem/components/MenuItemDescription.tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface MenuItemDescriptionProps {
  description?: string;
}

export const MenuItemDescription = ({
  description,
}: MenuItemDescriptionProps) => {
  if (!description) return null;

  return (
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      {description.length > 55 ? `${description.slice(0, 55)}...` : description}
      {description.length > 55 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="p-1">
                <Info className="w-4 h-4 text-foreground hover:text-gray-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              className="max-w-xs whitespace-normal"
            >
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </p>
  );
};
