import { COMPANY_NAME } from "@/constants/constants";
import { API_URL } from "@/services/apiClient";
import axios from "axios";
import jsPDF from "jspdf";
import { cleanPath, getItemDiscount, getItemPrice } from "./menuUtils";
import { DealItem, MenuCategory, MenuItem, StoreInfo } from "./types";

const imageCache = new Map<string, string>();

const getImageDataUrl = async (url: string): Promise<string | null> => {
  if (imageCache.has(url)) return imageCache.get(url)!;

  try {
    // Skip proxy for local images
    if (url.startsWith("/")) {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const base64 = Buffer.from(response.data, "binary").toString("base64");
      let mimeType = "image/jpeg";
      if (url.endsWith(".png")) mimeType = "image/png";
      const dataUrl = `data:${mimeType};base64,${base64}`;
      imageCache.set(url, dataUrl);
      return dataUrl;
    }

    // For external URLs, try direct fetch first
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const base64 = Buffer.from(response.data, "binary").toString("base64");
      let mimeType = "image/jpeg";
      if (url.endsWith(".png")) mimeType = "image/png";
      const dataUrl = `data:${mimeType};base64,${base64}`;
      imageCache.set(url, dataUrl);
      return dataUrl;
    } catch {
      // If direct fetch fails, try proxy
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
      const response = await axios.get(proxyUrl, {
        responseType: "arraybuffer",
      });
      const base64 = Buffer.from(response.data, "binary").toString("base64");
      let mimeType = "image/jpeg";
      if (url.endsWith(".png")) mimeType = "image/png";
      const dataUrl = `data:${mimeType};base64,${base64}`;
      imageCache.set(url, dataUrl);
      return dataUrl;
    }
  } catch (error) {
    console.warn("Failed to fetch image:", url, error);
    return null;
  }
};

// Add safe text width calculation function
const getSafeTextWidth = (
  pdf: jsPDF,
  text: string | undefined | null,
  fontSize: number
): number => {
  if (!text) return 0;
  try {
    return (pdf.getStringUnitWidth(text) * fontSize) / pdf.internal.scaleFactor;
  } catch (error) {
    console.warn("Error calculating text width:", error);
    return 0;
  }
};

// Add safe text rendering function
const safeText = (
  pdf: jsPDF,
  text: string | string[] | undefined | null,
  x: number,
  y: number
) => {
  if (!text) return;
  try {
    if (Array.isArray(text)) {
      text.forEach((line, index) => {
        if (line) {
          pdf.text(line, x, y + index * 5);
        }
      });
    } else {
      pdf.text(text, x, y);
    }
  } catch (error) {
    console.warn("Error rendering text:", error);
  }
};

// Add minimal type guards for DealItem
const isDealItem = (item: MenuItem | DealItem): item is DealItem => {
  return "dealPrice" in item;
};

// Helper functions for item properties
const getItemImageUrl = (item: MenuItem): string | null => {
  return cleanPath(item.producturl);
};

const getItemName = (item: MenuItem | DealItem): string => {
  if (isDealItem(item)) {
    return item.dealCode;
  }
  return item.productname;
};

const getItemPrices = (item: MenuItem | DealItem): number => {
  if (isDealItem(item)) {
    return item?.dealPrice;
  }
  return getItemPrice(item);
};

const getItemDiscounts = (item: MenuItem | DealItem): number => {
  if (isDealItem(item)) {
    return item.schemeAmount - item.dealPrice;
  }
  return getItemDiscount(item);
};

export const exportPDF = async (
  categorizedMenu: MenuCategory[],
  store: StoreInfo
) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const margin = 6;
  let y = margin;
  const lineHeight = 5;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const itemsPerRow = 3;
  const itemWidth =
    (pageWidth - margin * 2 - margin * (itemsPerRow - 1)) / itemsPerRow;
  const imageSize = itemWidth; // Make image size equal to item width
  const pageCenterX = pageWidth / 2;

  // Add function to draw footer with date
  const drawFooter = () => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const footerText = `${COMPANY_NAME} | Printed on ${currentDate}`;

    // Save current state
    pdf.saveGraphicsState();

    // Set footer style
    pdf.setFontSize(8);
    pdf.setFont("times", "normal");
    pdf.setTextColor(100, 100, 100); // Subtle gray color

    // Calculate text width for centering
    const textWidth = getSafeTextWidth(pdf, footerText, 8);
    const footerX = (pageWidth - textWidth) / 2;
    const footerY = pageHeight - 5; // 5mm from bottom

    // Draw footer text
    safeText(pdf, footerText, footerX, footerY);

    // Restore state
    pdf.restoreGraphicsState();
  };

  // ==== STORE HEADER ====
  // Add header background
  pdf.setFillColor(245, 245, 245);
  const headerHeight = 45; // Adjusted header height
  pdf.rect(0, 0, pageWidth, headerHeight);

  // Try to load logo, but continue if it fails
  let logoDataUrl = null;
  try {
    const logoUrl = API_URL + store.logoPath;
    logoDataUrl = await getImageDataUrl(logoUrl);
  } catch (error) {
    console.warn("Failed to load store logo:", error);
  }

  // Draw store logo (if available)
  const logoSize = 25;
  if (logoDataUrl) {
    const logoX = pageCenterX - logoSize / 2; // Center logo horizontally
    const logoY = margin; // Position logo at top margin
    pdf.addImage(logoDataUrl, "JPEG", logoX, logoY, logoSize, logoSize);
  }

  // Store name
  pdf.setFontSize(16);
  pdf.setFont("times", "bold");
  pdf.setTextColor(30, 30, 30);
  const storeNameText = `${store.name || store.tradeName || "Store Menu"}`;

  const storeNameWidth = getSafeTextWidth(pdf, storeNameText, 16);
  const storeNameX = pageCenterX - storeNameWidth / 2; // Center store name horizontally
  const storeNameY = margin + logoSize + 5; // Position store name below logo with spacing
  safeText(pdf, storeNameText, storeNameX, storeNameY);

  // Store address
  pdf.setFontSize(12);
  pdf.setFont("times", "normal");
  pdf.setTextColor(80, 80, 80);
  const storeAddressText = store.address
    ? store.address + `${store.contact ? `, ${store.contact}` : ""}`
    : "No address provided";
  const storeAddressWidth = getSafeTextWidth(pdf, storeAddressText, 12);
  const storeAddressX = pageCenterX - storeAddressWidth / 2; // Center store address horizontally
  const storeAddressY = storeNameY + 5; // Position store address below store name with spacing
  safeText(pdf, storeAddressText, storeAddressX, storeAddressY);

  y = headerHeight + 5; // Start content below header with padding

  // Add footer to first page
  drawFooter();

  // Improved page break check function
  const checkAddPage = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Function to calculate total height needed for an item
  const calculateItemHeight = (item: MenuItem | DealItem) => {
    let height = imageSize;

    // Name height with unit name
    const productName =
      getItemName(item) +
      (!isDealItem(item) && item.unitname ? ` - ${item.unitname}` : "");
    const nameLines = pdf.splitTextToSize(productName, itemWidth - 10);
    const baseLineHeight = lineHeight * 1.2; // Consistent line height multiplier
    height += nameLines.length * baseLineHeight;

    // Add extra padding for long names
    const minHeight = imageSize + baseLineHeight * 2; // Minimum height for any item
    if (height < minHeight) {
      height = minHeight;
    }

    return height;
  };

  // ==== MENU ITEMS BY CATEGORY ====
  let currentX = margin;
  let rowY = y;
  let maxRowHeight = 0;

  // Flatten all items from all categories into a single array
  const allItems = categorizedMenu.flatMap(
    (category) => category.items as MenuItem[]
  );

  for (const item of allItems) {
    const itemTotalHeight = calculateItemHeight(item);

    // Check if we need a new row
    if (currentX + itemWidth > pageWidth - margin) {
      // Check if we need a new page before starting new row
      if (checkAddPage(itemTotalHeight)) {
        drawFooter(); // Add footer to each new page
        rowY = y;
      } else {
        rowY = y + maxRowHeight + 3; // Add consistent 3mm spacing between rows
      }
      currentX = margin;
      maxRowHeight = 0;
      y = rowY; // Update y to match rowY
    }

    // Check if current item will fit on the page
    if (rowY + itemTotalHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      rowY = y;
      currentX = margin;
      maxRowHeight = 0;
      drawFooter(); // Add footer to each new page
    }

    // Update max row height
    maxRowHeight = Math.max(maxRowHeight, itemTotalHeight);

    // Create main item container with fancy border
    const itemContainerHeight = itemTotalHeight;

    // Draw outer decorative border
    pdf.setDrawColor(200, 204, 210); // Light gray for outer border
    pdf.setLineWidth(0.3);
    pdf.roundedRect(
      currentX - 1,
      rowY - 1,
      itemWidth + 2,
      itemContainerHeight + 2,
      3,
      3,
      "S"
    );

    // Draw inner decorative border
    pdf.setDrawColor(220, 224, 230); // Lighter gray for inner border
    pdf.setLineWidth(0.2);
    pdf.roundedRect(
      currentX - 0.5,
      rowY - 0.5,
      itemWidth + 1,
      itemContainerHeight + 1,
      2.5,
      2.5,
      "S"
    );

    // Item background - only for details section
    const detailsHeight = itemContainerHeight - imageSize;

    // Create attractive background for item details
    pdf.setFillColor(245, 247, 250); // Light blue-gray base
    pdf.roundedRect(
      currentX,
      rowY + imageSize,
      itemWidth,
      detailsHeight,
      2,
      2,
      "F"
    );

    // Add subtle border to details section
    pdf.setDrawColor(220, 224, 230); // Light gray border
    pdf.setLineWidth(0.2);
    pdf.roundedRect(
      currentX,
      rowY + imageSize,
      itemWidth,
      detailsHeight,
      2,
      2,
      "S"
    );

    // Get product image
    let imageDataUrl = null;
    try {
      const imageUrl = getItemImageUrl(item);
      if (imageUrl) {
        imageDataUrl = await getImageDataUrl(
          `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
        );
      }
    } catch (error) {
      console.warn("Failed to fetch product image:", error);
    }

    if (!imageDataUrl) {
      try {
        imageDataUrl = await getImageDataUrl("/no-image.png");
      } catch (error) {
        console.warn("Failed to load fallback image:", error);
      }
    }

    // Add product image
    if (imageDataUrl) {
      // Use fixed dimensions and center the image
      pdf.addImage(
        imageDataUrl,
        "JPEG",
        currentX,
        rowY,
        itemWidth,
        itemWidth,
        undefined,
        "FAST"
      );
    }

    // Draw offer badge if applicable
    if (item.offerPerc > 0) {
      const hasVariations =
        Array.isArray(item.variations) && item.variations.length > 0;

      if (!hasVariations) {
        // For items without variations, show single offer badge
        const offerText = item.offerQty
          ? `BUY ${item.offerQty} GET ${item.offerPerc}% OFF`
          : `${item.offerPerc}% OFF`;

        // Calculate badge dimensions
        pdf.setFontSize(8); // Increased font size
        pdf.setFont("times", "bold");
        const textWidth = getSafeTextWidth(pdf, offerText, 8);
        const badgeWidth = textWidth + 6; // Increased padding
        const badgeHeight = 6; // Increased height
        const badgeX = currentX;
        const badgeY = rowY - 2;

        // Draw badge background
        pdf.setFillColor(0, 128, 0); // Green background
        pdf.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, "F");

        // Draw badge text with adjusted position
        pdf.setTextColor(255, 255, 255);
        const textX = badgeX + (badgeWidth - textWidth) / 3; // Center horizontally
        const textY = badgeY + 4; // Adjusted vertical position for better centering
        safeText(pdf, offerText, textX, textY);
      }
    }

    // Item details below image with padding
    let detailY = rowY + imageSize + 6; // Top padding
    const detailX = currentX + 2; // Left padding
    const detailWidth = itemWidth - 4; // Account for left and right padding

    const hasVariations =
      Array.isArray(item.variations) && item.variations.length > 0;

    // Item name
    const productName =
      getItemName(item) + (!hasVariations ? ` - ${item.unitname || ""}` : "");

    pdf.setFontSize(12);
    pdf.setFont("times", "bold");
    pdf.setTextColor(0, 0, 0); // Black text for item name

    // Adjust text wrapping width to prevent edge hitting
    const textWrapWidth = detailWidth - 1; // Reduced from detailWidth - 10 to give more padding
    const nameLines = pdf.splitTextToSize(productName, textWrapWidth);

    // Calculate actual height needed for the name
    const nameHeight = nameLines.length * lineHeight;

    // Adjust detailY based on actual content height
    safeText(pdf, nameLines, detailX, detailY);
    detailY += nameHeight;

    // Recalculate the actual height needed for the details section
    const actualDetailsHeight = detailY - (rowY + imageSize);

    // Update the item container height based on actual content
    const updatedItemHeight = imageSize + actualDetailsHeight;

    // Update max row height with the actual content height
    maxRowHeight = Math.max(maxRowHeight, updatedItemHeight);

    // Draw price container
    const priceDisplayType = !hasVariations
      ? (() => {
          const productDiscount = getItemDiscounts(item);
          return productDiscount && productDiscount > 0
            ? "discounted"
            : "regular";
        })()
      : "from_variation";

    // Calculate the required text width based on content and determine priceWidth
    let contentTextWidth = 0;
    let priceText = "";

    if (!hasVariations) {
      const productPrice = getItemPrices(item);
      const productDiscount = getItemDiscounts(item);
      priceText = `${productPrice?.toFixed(2)}`;

      if (productDiscount && productDiscount > 0) {
        // Current price width
        const currencyWidth = getSafeTextWidth(
          pdf,
          store.currencyCode ?? "USD",
          8
        );
        const [currentWhole, currentDecimal] = priceText.split(".");
        const currentWholeWidth = getSafeTextWidth(pdf, currentWhole, 14);
        const currentDecimalWidth = getSafeTextWidth(pdf, currentDecimal, 8);

        // Original price width
        const originalPrice = productDiscount + productPrice;
        const [originalWhole, originalDecimal] = originalPrice
          .toFixed(2)
          .split(".");
        const originalWholeWidth = getSafeTextWidth(pdf, originalWhole, 9);
        const originalDecimalWidth = getSafeTextWidth(pdf, originalDecimal, 6);

        // Content width is currency + current whole + current decimal + space + original whole + original decimal
        contentTextWidth =
          currencyWidth +
          currentWholeWidth +
          currentDecimalWidth +
          2 +
          originalWholeWidth +
          originalDecimalWidth;
      } else {
        // Regular price width
        const currencyWidth = getSafeTextWidth(
          pdf,
          store.currencyCode ?? "USD",
          8
        );
        const [whole, decimal] = priceText.split(".");
        const wholeWidth = getSafeTextWidth(pdf, whole, 14);
        const decimalWidth = getSafeTextWidth(pdf, decimal, 8);
        contentTextWidth = currencyWidth + wholeWidth + decimalWidth;
      }
    } else {
      // Calculate minimum and maximum variation prices
      let minPrice = Infinity;
      let maxPrice = -Infinity;
      if (item.variations && item.variations.length > 0) {
        minPrice = Math.min(...item.variations.map((v) => getItemPrices(v)));
        maxPrice = Math.max(...item.variations.map((v) => getItemPrices(v)));
      }

      const fromText = "From ";
      const minPriceText = minPrice === Infinity ? "N/A" : minPrice.toFixed(2);
      const maxPriceText = maxPrice === -Infinity ? "N/A" : maxPrice.toFixed(2);
      const currencyWidth = getSafeTextWidth(
        pdf,
        store.currencyCode ?? "USD",
        8
      );

      // Calculate width for "From [min price] ~ [max price]"
      const fromTextWidth = getSafeTextWidth(pdf, fromText, 8);
      const [minWhole, minDecimal] = minPriceText.split(".");
      const [maxWhole, maxDecimal] = maxPriceText.split(".");
      const minWholeWidth = getSafeTextWidth(pdf, minWhole, 14);
      const minDecimalWidth = getSafeTextWidth(pdf, minDecimal, 8);
      const maxWholeWidth = getSafeTextWidth(pdf, maxWhole, 14);
      const maxDecimalWidth = getSafeTextWidth(pdf, maxDecimal, 8);
      const separatorWidth = getSafeTextWidth(pdf, " ~ ", 8);

      contentTextWidth =
        fromTextWidth +
        currencyWidth +
        minWholeWidth +
        minDecimalWidth +
        separatorWidth +
        maxWholeWidth +
        maxDecimalWidth; // Extra padding for better spacing
    }

    const horizontalPadding = 4; // Increased horizontal padding
    const priceWidth = contentTextWidth + horizontalPadding * 2;

    // Draw price container if there's content width
    if (contentTextWidth > 0) {
      pdf.setFillColor(0, 0, 0);

      // Draw the main rectangle with rounded corners
      const radius = 3;
      const containerHeight = 10;
      const containerX = currentX + itemWidth - priceWidth;
      const containerY = rowY + imageSize - containerHeight;

      pdf.roundedRect(
        containerX,
        containerY,
        priceWidth,
        containerHeight,
        radius,
        radius,
        "F"
      );

      // Draw price text based on type
      if (priceDisplayType === "regular") {
        const [whole, decimal] = priceText.split(".");

        // Draw currency
        pdf.setFontSize(8);
        pdf.setFont("times", "normal");
        pdf.setTextColor(255, 255, 255);
        safeText(
          pdf,
          store.currencyCode ?? "USD",
          containerX + horizontalPadding,
          containerY + containerHeight / 2 + 1
        );

        // Draw regular price whole number
        pdf.setFontSize(14);
        pdf.setFont("times", "bold");
        const wholeWidth = getSafeTextWidth(pdf, whole, 14);
        const currencyWidth = getSafeTextWidth(
          pdf,
          store.currencyCode ?? "USD",
          8
        );
        safeText(
          pdf,
          whole,
          containerX + horizontalPadding + currencyWidth + 1,
          containerY + containerHeight / 2 + 1
        );

        // Draw regular price decimal
        pdf.setFontSize(8);
        safeText(
          pdf,
          decimal,
          containerX + horizontalPadding + currencyWidth + wholeWidth + 1,
          containerY + containerHeight / 2 - 1
        );
      } else if (priceDisplayType === "discounted") {
        const productPrice = getItemPrices(item);
        const productDiscount = getItemDiscounts(item);
        const originalPrice = productDiscount + productPrice;

        // Split current price into whole and decimal parts
        const [currentWhole, currentDecimal] = priceText.split(".");

        // Draw currency
        pdf.setFontSize(8);
        pdf.setFont("times", "normal");
        pdf.setTextColor(255, 255, 255);
        safeText(
          pdf,
          store.currencyCode ?? "USD",
          containerX + horizontalPadding,
          containerY + containerHeight / 2 + 1
        );

        // Draw current price whole number
        pdf.setFontSize(14);
        pdf.setFont("times", "bold");
        const currentWholeWidth = getSafeTextWidth(pdf, currentWhole, 14);
        const currencyWidth = getSafeTextWidth(
          pdf,
          store.currencyCode ?? "USD",
          8
        );
        safeText(
          pdf,
          currentWhole,
          containerX + horizontalPadding + currencyWidth + 1,
          containerY + containerHeight / 2 + 1
        );

        // Draw current price decimal
        pdf.setFontSize(8);
        const currentDecimalWidth = getSafeTextWidth(pdf, currentDecimal, 8);
        safeText(
          pdf,
          currentDecimal,
          containerX +
            horizontalPadding +
            currencyWidth +
            currentWholeWidth +
            1,
          containerY + containerHeight / 2 - 1
        );

        // Calculate width of current price text for positioning original price
        const currentPriceFullWidth =
          currencyWidth + currentWholeWidth + currentDecimalWidth;

        // Split original price into whole and decimal parts
        const originalPriceValue = originalPrice;
        const [originalWhole, originalDecimal] = originalPriceValue
          .toFixed(2)
          .split(".");

        // Draw original price whole number
        pdf.setFontSize(11);
        pdf.setTextColor(220, 220, 220);
        const originalWholeWidth = getSafeTextWidth(pdf, originalWhole, 9);
        const originalPriceStartX =
          containerX + horizontalPadding + currentPriceFullWidth + 2;
        safeText(
          pdf,
          originalWhole,
          originalPriceStartX,
          containerY + containerHeight / 2 + 3
        );

        // Draw original price decimal
        pdf.setFontSize(8);
        const originalDecimalWidth = getSafeTextWidth(pdf, originalDecimal, 6);
        safeText(
          pdf,
          originalDecimal,
          originalPriceStartX + originalWholeWidth + 1,
          containerY + containerHeight / 2 + 2
        );

        // Draw strikethrough line
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.2);
        const originalPriceFullTextWidth =
          originalWholeWidth + originalDecimalWidth;
        pdf.line(
          originalPriceStartX,
          containerY + containerHeight / 2 + 2,
          originalPriceStartX + originalPriceFullTextWidth,
          containerY + containerHeight / 2 + 2
        );
      } else if (priceDisplayType === "from_variation") {
        const minPrice =
          item.variations && item.variations.length > 0
            ? Math.min(...item.variations.map((v) => getItemPrices(v)))
            : 0;
        const maxPrice =
          item.variations && item.variations.length > 0
            ? Math.max(...item.variations.map((v) => getItemPrices(v)))
            : 0;
        const fromText = "From ";
        const minPriceText = minPrice.toFixed(2);
        const maxPriceText = maxPrice.toFixed(2);

        // Draw "From"
        pdf.setFontSize(8);
        pdf.setFont("times", "normal");
        pdf.setTextColor(255, 255, 255);
        const fromTextWidth = getSafeTextWidth(pdf, fromText, 8);
        safeText(
          pdf,
          fromText,
          containerX + horizontalPadding,
          containerY + containerHeight / 2 + 1
        );

        // Draw first currency
        safeText(
          pdf,
          store.currencyCode ?? "USD",
          containerX + horizontalPadding + fromTextWidth,
          containerY + containerHeight / 2 + 1
        );

        // Draw minimum price
        const [minWhole, minDecimal] = minPriceText.split(".");
        pdf.setFontSize(14);
        pdf.setFont("times", "bold");
        const minWholeWidth = getSafeTextWidth(pdf, minWhole, 14);
        const currencyWidth = getSafeTextWidth(
          pdf,
          store.currencyCode ?? "USD",
          8
        );
        const minPriceStartX =
          containerX + horizontalPadding + fromTextWidth + currencyWidth + 1;
        safeText(
          pdf,
          minWhole,
          minPriceStartX,
          containerY + containerHeight / 2 + 1
        );

        // Draw minimum price decimal
        pdf.setFontSize(8);
        pdf.setFont("times", "normal");
        safeText(
          pdf,
          minDecimal,
          minPriceStartX + minWholeWidth,
          containerY + containerHeight / 2 - 1
        );

        // Draw separator
        const separatorX =
          minPriceStartX + minWholeWidth + getSafeTextWidth(pdf, minDecimal, 8);
        pdf.setFontSize(8);
        safeText(pdf, " ~ ", separatorX, containerY + containerHeight / 2 + 1);

        // Draw maximum price
        const [maxWhole, maxDecimal] = maxPriceText.split(".");
        pdf.setFontSize(14);
        pdf.setFont("times", "bold");
        const maxPriceStartX = separatorX + getSafeTextWidth(pdf, " ~ ", 8);
        safeText(
          pdf,
          maxWhole,
          maxPriceStartX,
          containerY + containerHeight / 2 + 1
        );

        // Draw maximum price decimal
        pdf.setFontSize(8);
        pdf.setFont("times", "normal");
        safeText(
          pdf,
          maxDecimal,
          maxPriceStartX + getSafeTextWidth(pdf, maxWhole, 14),
          containerY + containerHeight / 2 - 1
        );
      }
    }

    // Move to next item position
    currentX += itemWidth + margin;
  }

  // Add footer to last page
  drawFooter();

  const pdfBlob = pdf.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  const filename = `${(store.name || "store").replace(/\s+/g, "_")}_Menu.pdf`;
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};
