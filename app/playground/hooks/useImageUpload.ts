"use client";

import { useState } from "react";

export function useImageUpload() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      setUploadedImage(imageData);
      setOriginalImage(imageData); // Store original
    };
    reader.readAsDataURL(file);
  };

  const updateImage = (newImageUrl: string) => {
    setUploadedImage(newImageUrl);
    // Keep originalImage unchanged so we can always crop from original
  };

  const clearImage = () => {
    setUploadedImage(null);
    setOriginalImage(null);
  };

  return {
    uploadedImage,
    originalImage,
    handleImageUpload,
    updateImage,
    clearImage,
  };
}

