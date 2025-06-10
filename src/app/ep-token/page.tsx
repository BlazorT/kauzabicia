"use client";
import React, { useEffect } from "react";

// Helper function to get query parameters
function getQueryParam(param: string) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const PaymentConfirmation = () => {
  useEffect(() => {
    const authToken = getQueryParam("auth_token");

    // Check if auth_token is present in the URL
    if (authToken) {
      // Prepare the form data
      const formData = {
        auth_token: authToken,
        postBackURL: `${window.location.origin}/checkout`,
      };

      // Create the form dynamically
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://easypay.easypaisa.com.pk/easypay/Confirm.jsf";

      // Add the auth_token and postBackURL as hidden inputs
      for (const key in formData) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key as keyof typeof formData;
        input.value = formData[key as keyof typeof formData];
        form.appendChild(input);
      }

      // Submit the form
      document.body.appendChild(form);
      form.submit();
      //   form.remove();
    } else {
      console.error("auth_token not found in URL.");
    }
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h3>Processing Payment Confirmation...</h3>
    </div>
  );
};

export default PaymentConfirmation;
