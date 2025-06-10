import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Loader2 } from "lucide-react";
import { useGetDealDetail } from "@/hooks/useMenu";
import { DealProduct } from "@/utils/types";
import { useMemo } from "react";
import { DealItemProps } from "./deal-item";

const DealDescription: React.FC<DealItemProps> = ({ dealItem }) => {
  const { data: dealDetailResponse, isPending } = useGetDealDetail(dealItem.id);

  const dealProducts = useMemo(
    () =>
      (dealDetailResponse as { data: { data: DealProduct[] } })?.data?.data ??
      [],
    [dealDetailResponse]
  );

  const description = dealProducts
    ?.map((item) => `${item.schemeBundleQty}x ${item.productName}`)
    .join(", ");

  if (!description) return null;

  if (isPending) {
    return <Loader2 className="animate-spin w-5 h-5" />;
  }

  return (
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      {description.length > 60 ? `${description.slice(0, 60)}...` : description}
      {description.length > 60 && (
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
              className="max-w-xs whitespace-normal text-sm font-bold"
            >
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </p>
  );
};

export default DealDescription;
