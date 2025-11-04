"use client";

import { useEffect, useState } from "react";

const imageCache = new Map<string, HTMLImageElement>();

export function preloadImage(src: string): Promise<HTMLImageElement> {
  // Return cached image if available
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };

    img.onerror = reject;
    img.src = src;
  });
}

export function useImagePreloader(imagePaths: string[]) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoadedCount(0); // Reset count on effect run
    setIsLoading(true);

    const loadImages = async () => {
      const promises = imagePaths.map((path) =>
        preloadImage(path)
          .then(() => {
            if (mounted) {
              setLoadedCount((prev) => prev + 1);
            }
          })
          .catch((err) => {
            console.error(`Failed to preload ${path}:`, err);
          })
      );

      await Promise.all(promises);

      if (mounted) {
        setIsLoading(false);
      }
    };

    loadImages();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps since imagePaths is static in this use case

  return { isLoading, loadedCount, totalCount: imagePaths.length };
}

export function getCachedImage(src: string): HTMLImageElement | null {
  return imageCache.get(src) || null;
}
