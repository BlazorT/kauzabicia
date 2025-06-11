import {
  AddStoreProductToFavoriteParams,
  MENU_FORM,
  RESPONSE,
  STORE_FILTERS_BODY,
} from "@/utils/types";
import moment from "moment";
import apiClient from "./apiClient";

export const menuService = {
  getMenu: async (menuBody: Partial<MENU_FORM>): Promise<RESPONSE> => {
    console.log({ menuBody });
    const response = await apiClient.post(
      "/api/blazorApi/storeproductsmenu",
      menuBody
    );
    return response.data;
  },
  getStoreProducts: async (): Promise<RESPONSE> => {
    const response = await apiClient.post("/api/blazorApi/storeproducts", {
      storeId: "",
      dateFrom: moment().utc().format(),
    });
    return response.data;
  },
  getAllMenus: async (storeId?: number): Promise<RESPONSE> => {
    const allMenuBody = {
      id: "0",
      storeId: storeId ? storeId?.toString() : "0",
    };
    const response = await apiClient.post(
      "/api/blazorApi/allproducts",
      allMenuBody
    );
    return response.data;
  },
  getStoreMenu: async (): Promise<RESPONSE> => {
    const response = await apiClient.get("/api/blazorApi/products");
    return response.data;
  },
  getUnits: async (): Promise<RESPONSE> => {
    const response = await apiClient.get("/api/blazorApi/tradeunits");
    return response.data;
  },
  getFilterStores: async (
    storeFilterBody: Partial<STORE_FILTERS_BODY>
  ): Promise<RESPONSE> => {
    const response = await apiClient.post(
      "/api/blazorApi/storeswithadvancesearch",
      storeFilterBody
    );
    return response.data;
  },
  getStore: async (storeId: number | null): Promise<RESPONSE> => {
    const response = await apiClient.post("/api/blazorApi/storeswithfilters", {
      Name: "",
      CityId: 0,
      StateId: 0,
      Contact: "",
      StoreId: storeId,
      Email: "",
      City: "",
      CountryId: 0,
      State: "",
      buffer: 0,
      Keyword: "",
      MinPrice: 0,
      MaxPrice: 0,
      ProductId: 0,
      UnitId: 0,
      StoreTypeId: 0, // Use `null` or `''` based on API requirements
      Location: "",
    });
    return response.data;
  },
  getDeals: async (storeId: number): Promise<RESPONSE> => {
    const body = {
      id: 0,
      storeId: storeId,
      rowVer: 1,
      createdAt: moment().utc().subtract(1, "year").format(),
      lastUpdatedAtAt: moment().utc().format(),
    };
    const response = await apiClient.post("/api/blazorApi/deals", body);
    return response.data;
  },
  getTables: async (storeId: number): Promise<RESPONSE> => {
    const body = {
      id: 0,
      storeId: storeId,
      SeatId: 0,
      status: 1,
      rowVer: 1,
      ResStatusId: 0,
      CreatedAt: moment().utc().subtract(10, "year").format(),
      LastUpdatedAt: moment().utc().format(),
    };
    // console.log(JSON.stringify(body));
    const response = await apiClient.post(
      "/api/blazorApi/restauranttables",
      body
    );
    return response.data;
  },
  getStoreReviews: async (storeId: number): Promise<RESPONSE> => {
    const body = {
      id: storeId,
      productDetailId: 0,
      reviewRemarks: "",
      ratingScore: 0,
      status: 1,
      createdBy: 0,
      lastUpdatedAt: moment().utc().format(),
      createdAt: moment().utc().subtract(1, "year").format(),
      lastUpdatedBy: 0,
      rowVer: 1,
      name: "",
      address: "",
      email: "",
      contact: "",
      hotDealPic: "",
    };
    const response = await apiClient.post("/api/blazorApi/reviews", body);
    return response.data;
  },
  getDealDetail: async (dealId: number): Promise<RESPONSE> => {
    const body = {
      id: dealId?.toString(),
    };
    const response = await apiClient.post("/api/blazorApi/dealdetails", body);
    return response.data;
  },
  addStoreProductToFavorite: async ({
    storeId = 0,
    productDetailId = 0,
    status,
  }: AddStoreProductToFavoriteParams): Promise<RESPONSE> => {
    const user = process.env.NEXT_PUBLIC_KIOSK_ID;

    const timestamp = moment().utc().format();

    const favBody = {
      id: 0,
      productDetailId,
      storeId,
      status,
      userId: user,
      createdBy: user,
      lastUpdatedBy: user,
      lastUpdatedAt: timestamp,
      createdAt: timestamp,
      rowVer: 1,
    };

    const response = await apiClient.post(
      "/api/blazorApi/addfavouriteproductandstore",
      favBody
    );

    return response.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cancelTableBookings: async (body: any): Promise<RESPONSE> => {
    const response = await apiClient.post(
      `/api/blazorApi/addupdatetablebooking`,
      body
    );
    return response.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addUpdateProduct: async (body: any): Promise<RESPONSE> => {
    const response = await apiClient.post(
      `/api/blazorApi/addupdateproductdetal`,
      body
    );
    return response.data;
  },
};
