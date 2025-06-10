import { DealItem as DealItemType } from "@/utils/types";
import { MenuItemHeader } from "../menu/menu-item-header";
import { MenuItemImage } from "../menu/menu-item-image";
import DealItemControll from "./deal-item-controll";
import DealPrice from "./deal-price";
import DealTime from "./deal-time";
import { useMemo } from "react";
import { isDealAvailable, normalizeWeekDays } from "@/utils/menuUtils";
import moment from "moment";
import DealDescription from "./deal-description";
import { Card, CardContent } from "../ui/card";

export type DealItemProps = {
  dealItem: DealItemType;
  isStoreOpen?: boolean;
  isDealActive?: boolean;
};

const DealItem: React.FC<DealItemProps> = ({ dealItem, isStoreOpen }) => {
  const isDealActive = useMemo(() => {
    return isDealAvailable(
      dealItem.startTime,
      dealItem.endTime,
      normalizeWeekDays(dealItem.dealTarget),
      moment()
    );
  }, [dealItem]);

  return (
    <Card className="px-2 py-2">
      <CardContent
        className={`relative flex items-center gap-4 p-2 px-0 hover:bg-card/100 duration-300 rounded-lg bg-card/80 overflow-hidden ${
          !isStoreOpen
            ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
            : ""
        }`}
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-25 bottom-3">
          <span className="text-[3rem] font-bold text-muted-foreground select-none whitespace-nowrap uppercase tracking-widest rotate-[-25deg] ">
            DEAL
          </span>
        </div>

        <MenuItemImage
          productUrl={dealItem.dealUrl}
          productName={dealItem.dealCode}
          isSpecial={false}
          isHalal={false}
        />

        <div className="flex-1">
          <MenuItemHeader
            name={dealItem.dealCode}
            unitName={""}
            variations={[]}
          />
          <DealDescription dealItem={dealItem} />
          <DealTime dealItem={dealItem} />

          <div className="flex items-center justify-between mt-2">
            <DealPrice dealItem={dealItem} />
            <DealItemControll
              dealItem={dealItem}
              isStoreOpen={isStoreOpen}
              isDealActive={isDealActive}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealItem;
