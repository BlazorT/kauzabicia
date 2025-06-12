import { SortBy } from "@/utils/types";
import React from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { Label } from "../ui/label";

export const SORT_OPTIONS: SortBy[] = [
  {
    id: 1,
    name: "Heighest To Lowest",
  },
  {
    id: 2,
    name: "Lowest To Heighest",
  },
];

const SortFilters = () => {
  const { filters, updateFilter } = useRestaurantFilters();

  const handleToggle = (id: string) => {
    updateFilter("sortBy", parseInt(id));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Sort By (price)</p>
      <RadioGroup
        onValueChange={handleToggle}
        value={filters?.sortBy?.toString()}
        className="w-full flex flex-col items-start justify-center gap-4 cursor-pointer"
      >
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {SORT_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-center gap-3 w-full">
              <div className="min-w-[7%]">
                <RadioGroupItem
                  value={option.id.toString()}
                  id={option.id.toString()}
                />
              </div>
              <Label
                htmlFor={option.id.toString()}
                className="w-full text-xs font-normal whitespace-nowrap overflow-hidden text-ellipsis block"
              >
                {option.name}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default SortFilters;
