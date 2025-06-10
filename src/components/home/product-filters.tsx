import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { useGetAllMenus } from "@/hooks/useMenu";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button"; // Assuming you have a Button component
import { Input } from "../ui/input"; // Assuming you have a styled Input component
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type AllMenuProduct = {
  id: string;
  productId: number;
  productname: string;
  unitId: number;
};

const ProductFilters = () => {
  const { data, isPending, isError } = useGetAllMenus();
  const { filters, updateFilter } = useRestaurantFilters();
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggle = (id: string) => {
    const splitId = id.split("_");
    updateFilter("productId", parseInt(splitId[0]));
    updateFilter("unitId", parseInt(splitId[1]));
  };

  const allMenuData = useMemo(() => {
    return (
      (data?.data as AllMenuProduct[])?.map((item) => ({
        ...item,
        id: item.productId + "_" + item.unitId,
      })) ?? []
    );
  }, [data]) as AllMenuProduct[] | [];

  const filteredData = useMemo(() => {
    return allMenuData.filter(
      (menu) =>
        menu.productname.toLowerCase().includes(searchTerm.toLowerCase()) &&
        menu.productname !== ""
    );
  }, [allMenuData, searchTerm]);

  const visibleProducts = showAll ? filteredData : filteredData.slice(0, 6);

  if (isError) return null;
  if (isPending) return <Loader2 className="animate-spin h-4 w-4" />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Products</p>

      <Input
        placeholder="Search product..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full h-8"
      />

      <RadioGroup
        onValueChange={handleToggle}
        value={filters?.productId + "_" + filters?.unitId}
        className="w-full flex flex-col items-start justify-center gap-4 cursor-pointer"
      >
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {/* "All Products" Option */}
          <div className="flex items-center gap-3 w-full">
            <div className="min-w-[7%]">
              <RadioGroupItem value="0_0" id="0_0" />
            </div>
            <Label
              htmlFor="0_0"
              className="w-4/5 text-xs font-normal whitespace-nowrap overflow-hidden text-ellipsis block"
            >
              All Products
            </Label>
          </div>

          {/* Other products */}
          {visibleProducts.map((menu) => (
            <div key={menu.id} className="flex items-center gap-3 w-full">
              <div className="min-w-[7%]">
                <RadioGroupItem
                  value={menu.id.toString()}
                  id={menu.id.toString()}
                />
              </div>
              <Label
                htmlFor={menu.id.toString()}
                className="w-4/5 text-xs font-normal whitespace-nowrap overflow-hidden text-ellipsis block"
              >
                {menu.productname}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      {filteredData.length > 6 && (
        <Button
          size="sm"
          variant="link"
          className="text-xs px-0 flex items-center has-[>svg]:px-0 h-4"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? (
            <>
              Show less
              <ChevronUp />
            </>
          ) : (
            <>
              Show more
              <ChevronDown />
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ProductFilters;
