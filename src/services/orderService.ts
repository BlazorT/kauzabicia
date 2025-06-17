import {
  JazzCashInquiryResponse,
  JazzCashResponse,
  RESPONSE,
} from "@/utils/types";
import apiClient, { CONFIG_KEY, SOCKET_URL } from "./apiClient";
import { DEFAULT_STORE_ID } from "@/constants/constants";

export const orderService = {
  verifyVoucher: async ({
    voucher,
    storeId,
  }: {
    voucher: string;
    storeId: number;
  }): Promise<RESPONSE> => {
    const body = {
      id: 0,
      storeId: storeId,
      voucherCode: voucher,
      status: 1,
    };
    const response = await apiClient.post("/api/blazorApi/verifyvoucher", body);
    return response.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getOrders: async (body: any): Promise<RESPONSE> => {
    const response = await apiClient.post(`/api/blazorApi/orders`, body);
    return response.data;
  },
  getOrdersStats: async (): Promise<RESPONSE> => {
    const body = {
      id: "0",
      storeid: DEFAULT_STORE_ID?.toString(),
    };
    const response = await apiClient.post(`/api/blazorApi/stats`, body);
    return response.data;
  },
  getOrderDetails: async (id: string | null): Promise<RESPONSE> => {
    const response = await apiClient.post(`/api/blazorApi/orderdetails`, {
      id,
    });
    return response.data;
  },
  getPoints: async ({ contact }: { contact: string }): Promise<RESPONSE> => {
    const body = {
      totalPoints: 0,
      contact,
      status: 1,
    };
    const response = await apiClient.post(`/api/blazorApi/mypoints`, body);
    return response.data;
  },
  getPaymentGateways: async ({
    storeId,
  }: {
    storeId: number;
  }): Promise<RESPONSE> => {
    const body = {
      storeId,
    };
    const response = await apiClient.post(
      `/api/blazorApi/paymentgateways`,
      body,
      {
        headers: {
          Authorization: CONFIG_KEY,
        },
      }
    );
    return response.data;
  },
  placeOrder: async ({
    orderBody,
  }: {
    orderBody: unknown;
  }): Promise<RESPONSE> => {
    const response = await apiClient.post(
      `/api/blazorApi/placeOrderCompact`,
      orderBody
    );
    return response.data;
  },
  updateOrder: async ({
    orderBody,
  }: {
    orderBody: unknown;
  }): Promise<RESPONSE> => {
    const response = await apiClient.post(
      `/api/blazorApi/updateorder`,
      orderBody
    );
    return response.data;
  },
  postReview: async ({
    reviewBody,
  }: {
    reviewBody: unknown;
  }): Promise<RESPONSE> => {
    const response = await apiClient.post(
      `/api/blazorApi/reviewandratebulk`,
      reviewBody
    );
    return response.data;
  },
  jazzCashPayment: async ({
    jcBody,
  }: {
    jcBody: unknown;
  }): Promise<JazzCashResponse> => {
    const response = await apiClient.post(
      SOCKET_URL + "/api/payment/jc-initiate",
      jcBody
    );
    return response.data;
  },

  jazzCashInquiry: async ({
    txnRefNo,
  }: {
    txnRefNo: string;
  }): Promise<JazzCashInquiryResponse> => {
    const response = await apiClient.post(
      SOCKET_URL + "/api/payment/jc-inquire",
      { txnRefNo }
    );
    return response.data;
  },
};
