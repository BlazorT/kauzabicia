"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { ErrorState } from "@/components/store/store-status";
import Spinner from "@/components/ui/spinner";
import { useFetchOrderStats } from "@/hooks/useOrder";

export default function StorePage() {
  const { isPending, error, isError } = useFetchOrderStats();

  if (isPending) {
    return <Spinner text="Fetching Dashboard Data..." />;
  }
  if (isError) {
    return <ErrorState message={error?.message} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <ChartAreaInteractive />
        </div>
      </div>
    </div>
  );
}
