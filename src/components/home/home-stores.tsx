"use client";

import { useStoreFiltersQuery } from "@/hooks/useStoreFiltersQuery";
import { Filter, SearchX } from "lucide-react";
import React, { RefObject } from "react";
import StoreItem from "../store/store-item";
import { ErrorState } from "../store/store-status";
import { Button } from "../ui/button";
import Spinner from "../ui/spinner";
import { useStorePage } from "@/hooks/useStorePage";
import { CategoryNav } from "../category/category-nav";

interface HomeStoresProps {
  toggleFilterSheet: () => void;
  setSearchQuery: (value: string) => void;
  searchQuery: string;
}

const HomeStores: React.FC<HomeStoresProps> = ({
  toggleFilterSheet,
  searchQuery,
  setSearchQuery,
  // toggleIsMapVisble,
}) => {
  const {
    storeData,
    filteredMenu,
    isPending,
    isError,
    clearAllFilters,
    filterCount,
  } = useStoreFiltersQuery(searchQuery);

  const {
    activeCategory,
    setActiveCategory,
    canScrollLeft,
    canScrollRight,
    scrollRef,
    scrollLeft,
    scrollRight,
    scrollToCategory,
  } = useStorePage();

  if (isError) return <ErrorState />;
  if (isPending) return <Spinner />;
  // if (isPending)
  //   return (
  //     <div className="space-y-2">
  //       <Skeleton className="h-12 w-full" />
  //       <div className="flex items-center justify-between">
  //         {Array(3)
  //           .fill(null)
  //           .map(() => (
  //             <Skeleton
  //               key={Math.random()}
  //               className="h-[200px] w-[300px] rounded-xl"
  //             />
  //           ))}
  //       </div>
  //     </div>
  //   );

  if (
    storeData.length === 0 ||
    (storeData.length > 0 && filteredMenu.length === 0)
  ) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] w-full">
        <div className="p-6 text-center flex flex-col items-center text-base text-muted-foreground border border-dashed rounded-xl space-y-4 shadow-md ">
          <SearchX size={80} className="text-red-400" />
          <p className="text-2xl font-semibold">Sorry</p>
          <p className="text-lg text-gray-500 max-w-sm">
            No products match the selected criteria
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              clearAllFilters();
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 px-2 md:px-0">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleFilterSheet}
          className="ml-2 lg:hidden block relative"
        >
          <Filter size={24} />
          {filterCount > 0 && (
            <div className="absolute w-4 h-4 top-[-8px] right-[-8px] text-xs items-center justify-center flex rounded-full text-primary-foreground bg-primary">
              {filterCount}
            </div>
          )}
        </button>
      </div>
      {filteredMenu.length > 1 && (
        <CategoryNav
          categories={filteredMenu}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          scrollToCategory={scrollToCategory}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          scrollLeft={scrollLeft}
          scrollRight={scrollRight}
          scrollRef={scrollRef as RefObject<HTMLDivElement>}
        />
      )}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Menu Content */}
        <div className="flex-1">
          {filteredMenu.map((category) => (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="mb-2 scroll-mt-20"
            >
              {filteredMenu.length > 1 && (
                <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
              )}

              <div className="row-gap-4 gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <StoreItem key={item.productDetailId} store={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      {/* <div className="row-gap-4 gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredStores.map((store) => (
          <StoreItem key={store.id} store={store} />
        ))}
      </div> */}
    </div>
  );
};

export default HomeStores;
