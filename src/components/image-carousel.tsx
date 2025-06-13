import { getImageUrlsFromVariation } from "@/utils/menuUtils";
import { MenuItem } from "@/utils/types";
import Image from "next/image";
import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { createPortal } from "react-dom";

interface ImageCarouselProps {
  item: MenuItem;
  className?: string;
  selectedImage: number;
  setSelectedImage: React.Dispatch<React.SetStateAction<number>>;
  setIsLightboxOpen: (value: boolean) => void;
  isLightboxOpen: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  item,
  className,
  setIsLightboxOpen,
  isLightboxOpen,
  setSelectedImage,
  selectedImage,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const imageUrls = getImageUrlsFromVariation(item);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className={cn("flex flex-col gap-4", className)}>
        {/* Main Image with Zoom and Navigation */}
        <div className="relative">
          <div
            className="relative w-full aspect-square rounded-lg overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => setIsLightboxOpen(true)}
          >
            <Image
              src={imageUrls[selectedImage]}
              alt={item.productname}
              fill
              className="object-cover cursor-zoom-in"
            />
            {isHovering && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${imageUrls[selectedImage]})`,
                  backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                  backgroundSize: "200%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}
          </div>

          {/* Navigation Arrows */}
          {imageUrls.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {imageUrls.length > 1 && (
          <div className="flex gap-2 justify-center">
            {imageUrls.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "relative w-16 h-16 cursor-pointer border-2 rounded-md overflow-hidden",
                  selectedImage === index
                    ? "border-primary"
                    : "border-transparent"
                )}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image}
                  alt={`${item.productname} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Portal */}
      {typeof window !== "undefined" &&
        createPortal(
          <Lightbox
            open={isLightboxOpen}
            close={() => setIsLightboxOpen(false)}
            index={selectedImage}
            slides={imageUrls.map((img) => ({
              src: img,
              title: item.productname,
              description: item.description,
            }))}
            plugins={[Captions, Fullscreen, Slideshow, Thumbnails, Zoom]}
            styles={{ container: { zIndex: 99999999 } }}
            carousel={{ finite: true }}
            controller={{ closeOnBackdropClick: false }}
          />,
          document.body
        )}
    </>
  );
};

export default ImageCarousel;
