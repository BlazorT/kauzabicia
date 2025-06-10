"use client";

import AesJs from "aes-js";
import { Buffer } from "buffer";
import queryString from "query-string";
import { useCallback, useEffect, useState } from "react";

// Function to convert an object to a query string

// Function to add padding to the text for AES encryption (PKCS5)
function pkcs5Pad(text: string, blockSize: number) {
  const pad = blockSize - (text.length % blockSize);
  return text + String.fromCharCode(pad).repeat(pad);
}

// Encrypt the request fields
function encryptRequestFields(
  fields: Record<string, string>,
  key: string
): string {
  // Step 1: Sort the fields based on the field names
  const sortedKeys = Object.keys(fields).sort();

  // Step 2: Create the concatenated string from the sorted fields
  const concatenatedString = sortedKeys
    .map((key) => `${key}=${fields[key]}`)
    .join("&");

  // Step 3: Pad the concatenated string to match the AES block size
  const paddedString = pkcs5Pad(concatenatedString, 16);

  // Step 4: Encrypt the string using AES/ECB/PKCS5Padding
  const aes = new AesJs.ModeOfOperation.ecb(AesJs.utils.utf8.toBytes(key));
  const encryptedBytes = aes.encrypt(AesJs.utils.utf8.toBytes(paddedString));
  const encryptedString = Buffer.from(encryptedBytes).toString("base64");

  return encryptedString;
}

interface EasyPaisaProps {
  enabled: boolean;
}

const EasyPaisa = ({ enabled }: EasyPaisaProps) => {
  const [postData, setPostData] = useState<{
    uri: string;
    body: string;
  } | null>(null);

  const orderDetail = {
    email: "user@example.com",
    pointsDiscount: 0,
    voucherDiscount: 0,
    easyPaisaMobileNumber: "03001234567",
    onlinePaymentType: {
      profileId: "760757",
      cert: "YHVUNCYFR0V4XLW8",
      callBackUri: "https://easypay.easypaisa.com.pk/easypay/Index.jsf",
      paymentStatusEnquiryUri:
        "https://easypay.easypaisa.com.pk/easypay/Confirm.jsf",
    },
  };

  const prepareRequest = useCallback(async () => {
    try {
      const fields: Record<string, string> = {
        amount: "1.0",
        storeId: "760757",
        autoRedirect: "0",
        orderRefNum: "11001",
        paymentMethod: "MA_PAYMENT_METHOD",
        postBackURL: "http://localhost:3000/ep-token",
      };

      const HASH_KEY = "YHVUNCYFR0V4XLW8";
      const encryptedValue = encryptRequestFields(fields, HASH_KEY);

      const requestBody = {
        ...fields,
        merchantHashedReq: encryptedValue,
      };

      const formBody = queryString.stringify(requestBody);

      setPostData({
        uri: orderDetail.onlinePaymentType.callBackUri,
        body: formBody,
      });
    } catch (error) {
      console.error("🚨 Failed to prepare Easypay request:", error);
    }
  }, [orderDetail.onlinePaymentType.callBackUri]);

  // Function to open a popup and submit the form
  const openPopupWithPost = useCallback(() => {
    if (!postData) return;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = postData.uri;
    form.target = "easypayPopup";

    postData.body.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = decodeURIComponent(key);
      input.value = decodeURIComponent(value);
      form.appendChild(input);
    });

    window.open("", "easypayPopup", "width=500,height=700");
    document.body.appendChild(form);
    form.submit();
    form.remove();
  }, [postData]);

  useEffect(() => {
    if (postData) {
      openPopupWithPost();
    }
  }, [openPopupWithPost, postData]);

  useEffect(() => {
    if (enabled) {
      prepareRequest();
    }
  }, [enabled, prepareRequest]);

  return null;
};

export default EasyPaisa;
