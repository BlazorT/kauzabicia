"use client";

import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { useOrder } from "@/context/order-context";
import { getTotalOrderAmount } from "@/utils/cartUtils";
import { keepOnlyAlphanumeric } from "@/utils/formUtils";
import { PAYMENT_GATEWAY } from "@/utils/types";
import AesJs from "aes-js";
import { Buffer } from "buffer";
import moment from "moment";
import queryString from "query-string";
import { useCallback, useEffect, useMemo, useState } from "react";

function pkcs5Pad(text: string, blockSize: number): string {
  const pad = blockSize - (text.length % blockSize);
  return text + String.fromCharCode(pad).repeat(pad);
}

function encryptRequestFields(
  fields: Record<string, string>,
  key: string
): string {
  const sortedKeys = Object.keys(fields).sort();
  const concatenated = sortedKeys.map((k) => `${k}=${fields[k]}`).join("&");
  const padded = pkcs5Pad(concatenated, 16);
  const aes = new AesJs.ModeOfOperation.ecb(AesJs.utils.utf8.toBytes(key));
  const encryptedBytes = aes.encrypt(AesJs.utils.utf8.toBytes(padded));
  return Buffer.from(encryptedBytes).toString("base64");
}

export const useEasyPaisa = (isPopUp: boolean = false) => {
  const { orderInfo } = useOrder();
  const { config } = useConfig();
  const { totalPrice, items } = useCart();

  const totalOrderAmount = useMemo(() => {
    const result = getTotalOrderAmount(totalPrice, config, orderInfo);
    return parseFloat(result);
  }, [totalPrice, config, orderInfo]);

  const [postData, setPostData] = useState<{
    uri: string;
    body: string;
  } | null>(null);

  const paymentGateway = orderInfo.paymentGateway as PAYMENT_GATEWAY;

  const prepareRequest = useCallback(
    (amount?: string, ref?: string) => {
      const orderNumber = ref
        ? keepOnlyAlphanumeric(ref)
        : `${keepOnlyAlphanumeric(
            (items[0]?.storeId ?? "") +
              "R" +
              (items[items.length - 1]?.productDetailId ?? "")
          )}` +
          "D" +
          moment().format("YYYYMMDDHHmmss");
      const fields: Record<string, string> = {
        amount: amount ? amount : totalOrderAmount.toFixed(1),
        //   amount: "1.0",
        ...(orderInfo?.email && { emailAddr: orderInfo.email }),
        storeId: paymentGateway?.profileId,
        autoRedirect: "1",
        ...(orderInfo?.phone && {
          mobileNum: orderInfo?.phone,
        }),
        orderRefNum: orderNumber,
        paymentMethod: "MA_PAYMENT_METHOD",
        postBackURL: `${window.location.origin}/ep-token`, // update in production
      };

      const encryptedValue = encryptRequestFields(
        fields,
        paymentGateway?.cert || ""
      );
      const requestBody = { ...fields, merchantHashedReq: encryptedValue };
      const formBody = queryString.stringify(requestBody);
      setPostData({
        uri: paymentGateway?.callBackUri || "",
        body: formBody,
      });
    },
    [
      items,
      paymentGateway?.callBackUri,
      paymentGateway?.cert,
      paymentGateway?.profileId,
      totalOrderAmount,
      orderInfo.email,
      orderInfo.phone,
    ]
  );

  const redirectWithPost = useCallback(() => {
    if (!postData) return;

    if (isPopUp) {
      // Open popup window
      const popupWidth = Math.round(window.screen.width * 0.5);
      const popupHeight = Math.round(window.screen.height * 0.8);
      const left = (window.screen.width - popupWidth) / 3;
      const top = (window.screen.height - popupHeight) / 3;
      const popup = window.open(
        "",
        "paymentPopup",
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
      );

      if (!popup) {
        // alert("Popup blocked. Please allow popups for this site.");
        return;
      }

      // Create form inside popup
      const popupDoc = popup.document;
      const form = popupDoc.createElement("form");
      form.method = "POST";
      form.action = postData.uri;

      postData.body.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        const input = popupDoc.createElement("input");
        input.type = "hidden";
        input.name = decodeURIComponent(key);
        input.value = decodeURIComponent(value);
        form.appendChild(input);
      });

      popupDoc.body.appendChild(form);
      form.submit();
    } else {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = postData.uri;

      postData.body.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = decodeURIComponent(key);
        input.value = decodeURIComponent(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      form.remove();
    }
  }, [postData, isPopUp]);

  useEffect(() => {
    if (postData) redirectWithPost();
  }, [postData, redirectWithPost]);

  return { prepareRequest };
};
