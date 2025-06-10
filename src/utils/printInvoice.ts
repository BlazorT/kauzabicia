import { OrderProduct } from "./types";
import jsPDF from "jspdf";
import moment from "moment";
import { API_URL } from "@/services/apiClient";
import axios from "axios";
import { CustomerInfo } from "@/components/order/order-detail";
import { calculateTotal } from "./orderUtils";
import { COMPANY_NAME } from "@/constants/constants";

const getImageDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    let mimeType = "image/jpeg";
    if (url.endsWith(".png")) mimeType = "image/png";
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.warn("Failed to fetch image:", url, error);
    return null;
  }
};

export const printInvoice = async (
  orderItems: OrderProduct[],
  orderType: string,
  taxNumber: string
) => {
  if (!orderItems.length) return;

  const order = orderItems[0];
  const pdf = new jsPDF({
    unit: "mm",
    format: [80, 297], // 80mm width (3.14 inches)
    orientation: "portrait",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 2;
  let y = margin;

  // Get store logo
  const logoUrl = API_URL + order.logoPath;
  const logoDataUrl = await getImageDataUrl(
    `/api/image-proxy?url=${encodeURIComponent(logoUrl)}`
  );

  // Draw store logo
  if (logoDataUrl) {
    const logoSize = 10;
    const logoX = (pageWidth - logoSize) / 2;
    pdf.addImage(logoDataUrl, "JPEG", logoX, y, logoSize, logoSize);
    y += logoSize + 3;
  }

  // Store name
  pdf.setFontSize(10);
  pdf.setFont("times", "bold");
  pdf.setTextColor(0, 0, 0);
  const storeNameText = order.tradeName;
  const storeNameWidth =
    (pdf.getStringUnitWidth(storeNameText) * 10) / pdf.internal.scaleFactor;
  const storeNameX = (pageWidth - storeNameWidth) / 2;
  pdf.text(storeNameText, storeNameX, y);
  y += 3;

  // Store address
  pdf.setFontSize(8);
  pdf.setFont("times", "normal");
  const addressLines = pdf.splitTextToSize(
    order.storeAddress,
    pageWidth - margin * 2
  );
  const addressText = addressLines.join("\n");
  const addressWidth =
    (pdf.getStringUnitWidth(addressText) * 8) / pdf.internal.scaleFactor;
  const addressX = (pageWidth - addressWidth) / 2;
  pdf.text(addressLines, addressX, y);
  y += addressLines.length * 2 + 3;

  // Order details
  pdf.setFontSize(8);
  const lineHeight = 4;

  // Helper function to draw justified text
  const drawJustifiedText = (key: string, value: string, yPos: number) => {
    const valueWidth =
      (pdf.getStringUnitWidth(value) * 8) / pdf.internal.scaleFactor;
    pdf.text(key, margin, yPos);
    pdf.text(value, pageWidth - margin - valueWidth, yPos);
  };

  const parseCustomerInfo: CustomerInfo | null = (() => {
    if (!order?.customerInfo || typeof order.customerInfo !== "string") {
      return null;
    }

    try {
      return JSON.parse(order.customerInfo) as CustomerInfo;
    } catch (error) {
      console.error("Error parsing customerInfo:", error);
      return null;
    }
  })();

  // Tax Number
  drawJustifiedText("Tax Number:", taxNumber || "xxx-xxxx", y);
  y += lineHeight;

  // Order #
  drawJustifiedText("Order #:", order.saleId.toString(), y);
  y += lineHeight;

  // Order Type
  drawJustifiedText("Order Type:", orderType, y);
  y += lineHeight;

  // Delivery/ETA Time
  const timeLabel = order.saleTypeId === 3 ? "Delivery Time" : "ETA Time";
  const timeText = moment(order.deliveryTime).format("DD MMM YYYY, hh:mm A");
  drawJustifiedText(timeLabel + ":", timeText, y);

  y += lineHeight;
  if (parseCustomerInfo?.name || parseCustomerInfo?.contact) {
    drawJustifiedText(
      "Customer : ",
      parseCustomerInfo?.name || parseCustomerInfo?.contact || "",
      y
    );
  }
  y += lineHeight;

  // Draw striped separator
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.2);
  for (let i = margin; i < pageWidth - margin; i += 2) {
    pdf.line(i, y - 2, i + 1, y - 2);
  }
  y += 2;

  // Items list
  pdf.setFontSize(8);
  for (const item of orderItems) {
    const itemText = `${item.totalLoadedQty} x ${item.productName}`;
    drawJustifiedText(itemText, `${calculateTotal(item)}`, y);
    y += lineHeight;
  }

  // Draw striped separator
  for (let i = margin; i < pageWidth - margin; i += 2) {
    pdf.line(i, y - 2, i + 1, y - 2);
  }
  y += 2;

  // Tax and Total
  drawJustifiedText("Tax:", `${order.taxAmount?.toFixed(2) || "0.00"}`, y);
  y += lineHeight;

  // Make Total Bill bold
  pdf.setFont("times", "bold");
  drawJustifiedText(
    `Total Bill: (${order.currencyCode ?? ""})`,
    `${order.payableBill?.toFixed(2) || "0.00"}`,
    y
  );
  pdf.setFont("times", "normal"); // Reset font
  y += lineHeight;

  // Draw final striped separator
  for (let i = margin; i < pageWidth - margin; i += 2) {
    pdf.line(i, y - 2, i + 1, y - 2);
  }
  y += 4;

  // Thank you message
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100); // Muted gray color
  const thankYouText = "Thank you for choosing our restaurant";
  const thankYouWidth =
    (pdf.getStringUnitWidth(thankYouText) * 8) / pdf.internal.scaleFactor;
  const thankYouX = (pageWidth - thankYouWidth) / 2;
  pdf.text(thankYouText, thankYouX, y);
  y += 6;

  // Footer
  pdf.setFontSize(7);
  pdf.setTextColor(80, 80, 80); // Darker gray for footer
  const footerText = COMPANY_NAME;
  const footerWidth =
    (pdf.getStringUnitWidth(footerText) * 7) / pdf.internal.scaleFactor;
  const footerX = (pageWidth - footerWidth) / 2;
  pdf.text(footerText, footerX, y);

  //   const dateTime = moment().format("YYYYMMDD_HHmmss");
  //   const filename = `invoice_${order.saleId}_${dateTime}.pdf`;
  //   pdf.save(filename);

  // Generate PDF as Data URL
  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = pdfUrl;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();
  };
};
