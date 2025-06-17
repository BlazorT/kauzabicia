// src/components/menu/MenuItem/components/MenuItemDescription.tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import parse from "html-react-parser";
import { Info } from "lucide-react";

interface MenuItemDescriptionProps {
  description?: string;
}

export const MenuItemDescription = ({
  description,
}: MenuItemDescriptionProps) => {
  if (!description) return null;
  const MAX_LENGTH = 90;
  const isDescriptionLong = description.length > MAX_LENGTH; // Note: This is still character length, not HTML content length.

  // For displaying the main content:
  // We'll parse the potentially truncated HTML.
  // IMPORTANT: Simple string slicing of HTML is still risky.
  // For production, consider an HTML-aware truncation library like 'html-truncate'
  // or a custom solution to get a *safe* truncated HTML string.
  const displayHtml = isDescriptionLong
    ? `${description.slice(0, MAX_LENGTH)}...`
    : description;

  return (
    <div className="text-xs text-muted-foreground flex items-center gap-1">
      {/*
      parse(displayHtml) converts the HTML string into a React element tree.
      React now manages these elements, and they behave like normal JSX children.
    */}
      {parse(displayHtml)}

      {isDescriptionLong && (
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
              className="max-w-xs whitespace-normal max-h-64 overflow-y-scroll hide-scrollbar prose dark:prose-invert"
            >
              {/*
              The TooltipContent here can now safely accept `children`.
              We parse the FULL description HTML and pass it as children.
            */}
              {parse(description)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
