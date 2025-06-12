import { useLOV } from "@/context/lov-context";
import React, { useMemo, useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const StoreTypeFilter = () => {
  const { lovs } = useLOV();
  const { filters, updateFilter } = useRestaurantFilters();
  const [showAll, setShowAll] = useState(false);

  const handleToggle = (id: number) => {
    const current = filters.storeTypeId || [];
    const updated = current.includes(id)
      ? current.filter((val) => val !== id)
      : [...current, id];

    updateFilter("storeTypeId", updated);
  };

  const categories = useMemo(() => lovs?.categories || [], [lovs]);

  const visibleStoreTypes = showAll ? categories : categories.slice(0, 4);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Categories</p>
      <div className="grid grid-cols-2 md:grid-cols-1 space-y-4">
        {visibleStoreTypes.map((categorie) => (
          <div key={categorie.id} className="flex items-center gap-3">
            <Checkbox
              id={categorie.id?.toString()}
              checked={filters.storeTypeId?.includes(categorie.id)}
              onCheckedChange={() => handleToggle(categorie.id)}
            />
            <Label
              htmlFor={categorie.id?.toString()}
              className="text-xs font-normal"
            >
              {categorie.name}
            </Label>
          </div>
        ))}
      </div>

      {categories.length > 4 && (
        <Button
          size="sm"
          variant="link"
          className="text-xs px-0 flex items-center has-[>svg]:px-0 h-4"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? (
            <>
              Show less <ChevronUp className="ml-1 h-3 w-3" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default StoreTypeFilter;
