// src/components/store/StoreInfo/index.tsx
"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { useState } from "react";
import { StoreHeader } from "../store/store-header";
import { EmptyState, ErrorState, LoadingState } from "../store/store-status";

interface StoreInfoProps {
  storeId: string;
  handleSearch: (q: string) => void;
}

export const StoreInfo = ({ storeId, handleSearch }: StoreInfoProps) => {
  const { storeData, isLoading, isError, isEmpty } = useStoreInfo(storeId);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;
  if (isEmpty) return <EmptyState />;
  if (!storeData) return null;

  const { store } = storeData;

  return (
    <Card className="py-0">
      <CardContent className="space-y-6 px-3 py-3">
        <StoreHeader
          name={store.name}
          tradeName={store.tradeName}
          logoPath={store.logoPath}
          as={"h2"}
          toggleDetails={toggleDetails}
          showDetails={showDetails}
          size={showDetails ? "lg" : "md"}
          store={store}
          storeData={storeData}
          handleSearch={handleSearch}
        />
        {showDetails && <></>}
      </CardContent>
    </Card>
  );
};
