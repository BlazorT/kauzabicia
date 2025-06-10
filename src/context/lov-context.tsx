// src/context/lov-context.tsx
"use client";

import { useGetLovs } from "@/hooks/useInitialData";
import {
  useContext,
  ReactNode,
  useState,
  useEffect,
  createContext,
} from "react";
import { useLocation } from "./location-context";
import { useRestaurantFilters } from "./restaurant-filter-context";

export type LOV = {
  id: number;
  name: string;
  code: string;
  desc: string;
  lvType: number;
  sortOrder: number;
  flag: string;
};

export type LOVState = {
  states: LOV[];
  dealtypes: LOV[];
  productgroups: LOV[];
  categories: LOV[];
  statuses: LOV[];
  currencies: LOV[];
  userroles: LOV[];
  ordertypes: LOV[];
  storetypes: LOV[];
  paymentstatuses: LOV[];
  paymentmethods: LOV[];
  deliveryoptions: LOV[];
  countries: LOV[];
  reservationstatuses: LOV[];
  reservationtypes: LOV[];
};

interface LOVContextType {
  lovs: LOVState | null;
  setLovs: (lovs: LOVState) => void;
}

const LOVContext = createContext<LOVContextType>({
  lovs: null,
  setLovs: () => {},
});

export const LOVProvider = ({ children }: { children: ReactNode }) => {
  const { data: lovsRes } = useGetLovs();
  // console.log({ lovsRes });
  const { ipInfo } = useLocation();
  const { updateFilter } = useRestaurantFilters();

  const [lovs, setLovs] = useState<LOVState | null>(() => {
    if (typeof window !== "undefined") {
      const storedLovs = localStorage.getItem("lovs");
      return storedLovs ? JSON.parse(storedLovs) : null;
    }
    return null;
  });

  useEffect(() => {
    if (!lovsRes) return;
    if (lovsRes && lovsRes.status === true) {
      setLovs(lovsRes.data as LOVState);
    }
  }, [lovsRes]);

  useEffect(() => {
    if (lovs) {
      localStorage.setItem("lovs", JSON.stringify(lovs));
    }
  }, [lovs]);

  useEffect(() => {
    if (
      lovs?.countries &&
      lovs?.countries?.length > 0 &&
      ipInfo?.geoplugin_countryCode
    ) {
      const findCountry = lovs?.countries.find((c) =>
        ipInfo?.geoplugin_countryCode?.includes(c.code)
      );
      if (!findCountry) return;

      updateFilter("country", {
        id: findCountry.id,
        name: findCountry?.name ?? "",
        code: findCountry?.code ?? "",
        flag: findCountry?.desc ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lovs, ipInfo]);

  return (
    <LOVContext.Provider value={{ lovs, setLovs }}>
      {children}
    </LOVContext.Provider>
  );
};

export const useLOV = () => useContext(LOVContext);
