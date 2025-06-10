import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { SortBy } from "@/utils/types";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

export const OFFER_OPTIONS: SortBy[] = [
  {
    id: 1,
    name: "Deals",
  },
];

const OfferFilter = () => {
  const { filters, updateFilter } = useRestaurantFilters();

  const handleToggle = (id: number) => {
    updateFilter("offerId", id);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Offers</p>
      <div className="grid grid-cols-2 md:grid-cols-1 space-y-4">
        {OFFER_OPTIONS.map((offer) => (
          <div key={offer.id} className="flex items-center gap-3">
            <Checkbox
              id={offer.id?.toString()}
              checked={filters.offerId === offer.id}
              onCheckedChange={(checked) =>
                handleToggle(checked ? offer.id : 0)
              }
            />
            <Label
              htmlFor={offer.id?.toString()}
              className="text-xs font-normal"
            >
              {offer.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfferFilter;
