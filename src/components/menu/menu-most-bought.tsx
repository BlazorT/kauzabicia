import { MenuItem } from "@/utils/types";
import MostBoughtItem from "./menu-most-bought-item";

type MostBoughtTogetherProps = {
  mostlyBoughtTogetherItems: MenuItem[];
  isStoreOpen: boolean;
};

const MostBoughtTogether = ({
  mostlyBoughtTogetherItems,
  isStoreOpen,
}: MostBoughtTogetherProps) => {
  if (mostlyBoughtTogetherItems.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold">Mostly Bought Together</h3>
      {/* <p className="text-muted-foreground">Other around you like this</p> */}

      <div className="flex flex-col flex-wrap gap-2">
        {mostlyBoughtTogetherItems?.map((item) => (
          <MostBoughtItem
            key={item.productDetailId}
            item={item}
            isStoreOpen={isStoreOpen}
          />
        ))}
      </div>
    </div>
  );
};

export default MostBoughtTogether;
