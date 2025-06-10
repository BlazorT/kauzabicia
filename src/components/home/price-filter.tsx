import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { DualRangeSlider } from "../ui/dual-range-slider";
import { MAX_PRICE, MIN_PRICE } from "@/constants/constants";

const PriceFilters = () => {
  const { filters, updateFilter } = useRestaurantFilters();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Price Range</p>
      <div className="w-full pe-4">
        <DualRangeSlider
          label={(value) => value}
          value={[filters.priceRange.min, filters.priceRange.max]}
          onValueChange={(v) => {
            updateFilter("priceRange", { min: v[0], max: v[1] });
          }}
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={1}
          labelPosition="bottom"
        />
      </div>
    </div>
  );
};

export default PriceFilters;
