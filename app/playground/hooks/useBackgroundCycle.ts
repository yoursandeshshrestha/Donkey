"use client";

import { useState } from "react";
import { generateRandomGradient, GradientData } from "../utils/gradientGenerator";

const backgrounds = [
  "/Background/1.jpg",
  "/Background/2.jpg",
  "/Background/3.jpg",
  "/Background/4.jpg",
  "/Background/5.jpg",
  "/Background/6.jpg",
  "/Background/7.jpg",
  "/Background/8.jpg",
  "/Background/9.jpg",
  "/Background/10.jpg",
  "/Background/11.jpg",
  "/Background/12.jpg",
  "/Background/13.jpg",
  "/Background/14.jpg",
  "/Background/15.jpg",
  "/Background/16.jpg",
];

export function useBackgroundCycle() {
  const [currentIndex, setCurrentIndex] = useState(-1); // Start with -1 to show white background
  const [uploadedBackground, setUploadedBackground] = useState<string | null>(
    null
  );
  const [generatedGradient, setGeneratedGradient] = useState<GradientData | null>(
    null
  );
  const [backgroundBlur, setBackgroundBlur] = useState<number>(0);

  const changeBackground = () => {
    setCurrentIndex((prev) => {
      if (prev === -1) return 0; // Move from white to first image
      return (prev + 1) % backgrounds.length;
    });
    setUploadedBackground(null); // Clear uploaded background when cycling
    setGeneratedGradient(null); // Clear gradient when cycling
  };

  const setSpecificBackground = (backgroundPath: string) => {
    const index = backgrounds.indexOf(backgroundPath);
    if (index !== -1) {
      setCurrentIndex(index);
      setUploadedBackground(null); // Clear uploaded background
      setGeneratedGradient(null); // Clear gradient
    }
  };

  const handleBackgroundUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedBackground(reader.result as string);
      setGeneratedGradient(null); // Clear gradient when uploading
    };
    reader.readAsDataURL(file);
  };

  const generateGradient = () => {
    const gradient = generateRandomGradient();
    setGeneratedGradient(gradient);
    setUploadedBackground(null); // Clear uploaded background when generating gradient
  };

  return {
    currentBackground: uploadedBackground || (currentIndex >= 0 ? backgrounds[currentIndex] : undefined),
    generatedGradient,
    changeBackground,
    setSpecificBackground,
    handleBackgroundUpload,
    generateGradient,
    backgroundBlur,
    setBackgroundBlur,
  };
}

