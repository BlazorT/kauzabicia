// src/app/[storeId]/components/StoreHero/StoreHero.tsx
import { StoreInfo } from "@/components/menu/store-info";

interface StoreHeroProps {
  storeId: string;
  handleSearch: (q: string) => void;
}

export const StoreHero = ({ storeId, handleSearch }: StoreHeroProps) => (
  <div className="gap-2 flex flex-col">
    <StoreInfo storeId={storeId} handleSearch={handleSearch} />
  </div>
);
