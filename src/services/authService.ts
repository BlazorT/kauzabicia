import {
  FORGOT_PASSWORD_FORM,
  LOGIN_FORM,
  RESPONSE,
  SIGN_UP_FORM,
} from "@/utils/types";
import apiClient, { API_URL, CONFIG_KEY } from "./apiClient";

export const authService = {
  signIn: async (userData: Partial<LOGIN_FORM>): Promise<RESPONSE> => {
    const response = await apiClient.post("/api/blazorApi/login", userData);
    return response.data;
  },
  signUp: async (userData: Partial<SIGN_UP_FORM>): Promise<RESPONSE> => {
    const response = await apiClient.post(
      "/api/blazorApi/addUpdateUser",
      userData
    );
    return response.data;
  },
  forgotPassword: async (
    userData: Partial<FORGOT_PASSWORD_FORM>
  ): Promise<RESPONSE> => {
    const response = await apiClient.post("/api/blazorApi/forgot", userData, {
      headers: { Authorization: CONFIG_KEY },
    });
    return response.data;
  },
  uploadImage: async (formData: FormData): Promise<RESPONSE> => {
    const response = await fetch(API_URL + "api/blazorApi/uploadsingleimage", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: process.env.NEXT_PUBLIC_API_KEY ?? "",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RESPONSE = await response.json();
    return data;
  },
  uploadsMultiImages: async (formData: FormData): Promise<RESPONSE> => {
    const response = await fetch(API_URL + "api/blazorApi/uploads", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: process.env.NEXT_PUBLIC_API_KEY ?? "",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RESPONSE = await response.json();
    return data;
  },
};
