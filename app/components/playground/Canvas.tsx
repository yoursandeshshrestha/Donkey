"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { GradientData } from "../../playground/utils/gradientGenerator";
import {
  getCachedImage,
  preloadImage,
} from "../../playground/hooks/useImagePreloader";
import { BlurBlock } from "../../playground/types";

interface CanvasProps {
  width: number;
  height: number;
  backgroundSrc?: string;
  backgroundGradient?: GradientData | null;
  backgroundBlur?: number;
  uploadedImageSrc?: string;
  imageTransform: {
    width: number;
    height: number;
    rotation: number;
    scale: number;
    borderRadius: number;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
  };
  blurBlocks?: BlurBlock[];
}

interface CanvasClickProps extends CanvasProps {
  onImageClick?: () => void;
  onBackgroundClick?: () => void;
}

export function Canvas({
  width,
  height,
  backgroundSrc,
  backgroundGradient,
  backgroundBlur = 0,
  uploadedImageSrc,
  imageTransform,
  onImageClick,
  onBackgroundClick,
  blurBlocks = [],
}: CanvasClickProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blurCanvasRef = useRef<HTMLCanvasElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);
  const blurUpdateTimeoutRef = useRef<number | null>(null);
  const [baseCanvasReady, setBaseCanvasReady] = useState<number>(0); // Counter to trigger composite re-render

  // Memoize base canvas dependency key
  const baseCanvasKey = useMemo(() => 
    `${width}-${height}-${backgroundSrc}-${JSON.stringify(backgroundGradient)}-${backgroundBlur}-${uploadedImageSrc}-${JSON.stringify(imageTransform)}`,
    [width, height, backgroundSrc, backgroundGradient, backgroundBlur, uploadedImageSrc, imageTransform]
  );

  // Draw base canvas (background + image) - cached
  useEffect(() => {
    let mounted = true;
    
    const drawBaseCanvas = () => {
      if (!mounted) return;
      
      // Create or reuse base canvas
      if (!baseCanvasRef.current) {
        baseCanvasRef.current = document.createElement("canvas");
      }
      
      const baseCanvas = baseCanvasRef.current;
      const dpr = window.devicePixelRatio || 1;

      baseCanvas.width = width * dpr;
      baseCanvas.height = height * dpr;

      const ctx = baseCanvas.getContext("2d", {
        alpha: true,
        desynchronized: false,
        willReadFrequently: false,
      });
      if (!ctx) return;

      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background (gradient, image, or white)
      if (backgroundGradient) {
        // Apply blur if needed
        if (backgroundBlur > 0) {
          ctx.filter = `blur(${backgroundBlur}px)`;
        }

        // Convert angle to radians and calculate gradient direction
        const angleRad = (backgroundGradient.angle - 90) * (Math.PI / 180);
        const x0 = width / 2 + (Math.cos(angleRad) * width) / 2;
        const y0 = height / 2 + (Math.sin(angleRad) * height) / 2;
        const x1 = width / 2 - (Math.cos(angleRad) * width) / 2;
        const y1 = height / 2 - (Math.sin(angleRad) * height) / 2;

        // Create canvas gradient
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        // Add color stops
        backgroundGradient.colors.forEach((color, index) => {
          const position = index / (backgroundGradient.colors.length - 1);
          gradient.addColorStop(position, color);
        });

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Reset filter
        ctx.filter = "none";
      } else if (backgroundImageRef.current?.complete) {
        // Apply blur if needed
        if (backgroundBlur > 0) {
          ctx.filter = `blur(${backgroundBlur}px)`;
        }

        ctx.drawImage(backgroundImageRef.current, 0, 0, width, height);

        // Reset filter
        ctx.filter = "none";
      } else {
        // Draw white background when no gradient or image
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }

      // Draw uploaded image with transforms
      if (uploadedImageRef.current?.complete && uploadedImageSrc) {
        ctx.save();

        // Move to center of canvas
        ctx.translate(width / 2, height / 2);

        // Apply rotation
        ctx.rotate((imageTransform.rotation * Math.PI) / 180);

        // Apply scale
        const finalScale = imageTransform.scale / 100;
        ctx.scale(finalScale, finalScale);

        const img = uploadedImageRef.current;

        // Calculate crop area in source image coordinates
        const cropXPx = (img.naturalWidth * imageTransform.cropX) / 100;
        const cropYPx = (img.naturalHeight * imageTransform.cropY) / 100;
        const cropWidthPx = (img.naturalWidth * imageTransform.cropWidth) / 100;
        const cropHeightPx =
          (img.naturalHeight * imageTransform.cropHeight) / 100;

        // Calculate display dimensions maintaining aspect ratio
        const cropAspect = cropWidthPx / cropHeightPx;
        const boxAspect = imageTransform.width / imageTransform.height;

        let drawWidth: number;
        let drawHeight: number;

        if (cropAspect > boxAspect) {
          // Crop is wider than box
          drawWidth = imageTransform.width;
          drawHeight = imageTransform.width / cropAspect;
        } else {
          // Crop is taller than box
          drawHeight = imageTransform.height;
          drawWidth = imageTransform.height * cropAspect;
        }

        const x = -drawWidth / 2;
        const y = -drawHeight / 2;

        if (imageTransform.borderRadius > 0) {
          // Draw with rounded corners
          ctx.beginPath();
          const radius = Math.min(
            imageTransform.borderRadius,
            drawWidth / 2,
            drawHeight / 2
          );
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + drawWidth - radius, y);
          ctx.quadraticCurveTo(x + drawWidth, y, x + drawWidth, y + radius);
          ctx.lineTo(x + drawWidth, y + drawHeight - radius);
          ctx.quadraticCurveTo(
            x + drawWidth,
            y + drawHeight,
            x + drawWidth - radius,
            y + drawHeight
          );
          ctx.lineTo(x + radius, y + drawHeight);
          ctx.quadraticCurveTo(x, y + drawHeight, x, y + drawHeight - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.clip();
        }

        // Draw cropped portion of image
        ctx.drawImage(
          img,
          cropXPx,
          cropYPx,
          cropWidthPx,
          cropHeightPx,
          x,
          y,
          drawWidth,
          drawHeight
        );

        ctx.restore();
      }
    };

    const loadAllImages = async () => {
      const promises: Promise<void>[] = [];
      
      // Load background image
      if (backgroundSrc && !backgroundGradient) {
        const cachedBg = getCachedImage(backgroundSrc);
        if (cachedBg && cachedBg.complete) {
          backgroundImageRef.current = cachedBg;
        } else {
          const bgPromise = preloadImage(backgroundSrc)
            .then((img) => {
              if (mounted) {
                backgroundImageRef.current = img;
              }
            })
            .catch((err) => {
              console.error("Failed to load background:", err);
              if (mounted) {
                backgroundImageRef.current = null;
              }
            });
          promises.push(bgPromise);
        }
      } else {
        backgroundImageRef.current = null;
      }

      // Load uploaded image
      if (uploadedImageSrc) {
        const cachedUpload = getCachedImage(uploadedImageSrc);
        if (cachedUpload && cachedUpload.complete) {
          uploadedImageRef.current = cachedUpload;
        } else {
          const uploadPromise = preloadImage(uploadedImageSrc)
            .then((img) => {
              if (mounted) {
                uploadedImageRef.current = img;
              }
            })
            .catch((err) => {
              console.error("Failed to load uploaded image:", err);
              if (mounted) {
                uploadedImageRef.current = null;
              }
            });
          promises.push(uploadPromise);
        }
      } else {
        uploadedImageRef.current = null;
      }

      // Wait for all images to load before drawing
      await Promise.all(promises);
      
      if (mounted) {
        drawBaseCanvas();
        // Trigger composite canvas update by incrementing counter
        setBaseCanvasReady(prev => prev + 1);
      }
    };

    loadAllImages();

    return () => {
      mounted = false;
    };
  }, [baseCanvasKey]);

  // Composite base canvas with blur blocks - fast updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseCanvasRef.current) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d", {
      alpha: false, // Disable alpha to get opaque white background
      desynchronized: true,
      willReadFrequently: false,
    });
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const compositeCanvas = () => {
      // Fill with white first (since alpha is false, this ensures white background)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      
      // Draw base canvas on top
      ctx.drawImage(baseCanvasRef.current!, 0, 0, width, height);

      // Draw blur blocks on top
      if (blurBlocks.length > 0) {
        blurBlocks.forEach((block) => {
          ctx.save();

          const blockX = (width * block.x) / 100;
          const blockY = (height * block.y) / 100;
          const blockWidth = (width * block.width) / 100;
          const blockHeight = (height * block.height) / 100;

          // Clip to block bounds
          ctx.beginPath();
          ctx.rect(blockX, blockY, blockWidth, blockHeight);
          ctx.clip();

          // Create temp canvas for blur
          const padding = block.blurAmount * 2;
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: false });
          if (!tempCtx) return;

          tempCanvas.width = (blockWidth + padding * 2) * dpr;
          tempCanvas.height = (blockHeight + padding * 2) * dpr;
          tempCtx.scale(dpr, dpr);

          // Copy region from base canvas
          tempCtx.drawImage(
            baseCanvasRef.current!,
            (blockX - padding) * dpr,
            (blockY - padding) * dpr,
            (blockWidth + padding * 2) * dpr,
            (blockHeight + padding * 2) * dpr,
            0,
            0,
            blockWidth + padding * 2,
            blockHeight + padding * 2
          );

          // Apply blur and draw
          ctx.filter = `blur(${block.blurAmount}px)`;
          ctx.drawImage(
            tempCanvas,
            blockX - padding,
            blockY - padding,
            blockWidth + padding * 2,
            blockHeight + padding * 2
          );
          ctx.filter = "none";

          ctx.restore();
        });
      }
    };

    // Use requestAnimationFrame for smooth updates without flickering
    if (blurUpdateTimeoutRef.current) {
      cancelAnimationFrame(blurUpdateTimeoutRef.current);
    }

    blurUpdateTimeoutRef.current = requestAnimationFrame(compositeCanvas);

    return () => {
      if (blurUpdateTimeoutRef.current) {
        cancelAnimationFrame(blurUpdateTimeoutRef.current);
      }
    };
  }, [width, height, blurBlocks, baseCanvasKey, baseCanvasReady]);

  const isClickOnImage = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImageSrc) return false;

    const canvas = canvasRef.current;
    if (!canvas) return false;

    const rect = canvas.getBoundingClientRect();
    // Convert click coordinates from displayed size to actual canvas coordinates
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const centerX = width / 2;
    const centerY = height / 2;
    const halfWidth = imageTransform.width / 2;
    const halfHeight = imageTransform.height / 2;

    return (
      x >= centerX - halfWidth &&
      x <= centerX + halfWidth &&
      y >= centerY - halfHeight &&
      y <= centerY + halfHeight
    );
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isClickOnImage(e)) {
      onImageClick?.();
    } else {
      onBackgroundClick?.();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        imageRendering: "auto",
        cursor: uploadedImageSrc ? "pointer" : "default",
      }}
      className="block"
    />
  );
}
