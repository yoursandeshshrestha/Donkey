"use client";

import { useState } from "react";

export interface ImageTransform {
  width: number;
  height: number;
  rotation: number;
  scale: number;
  borderRadius: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

export function useImageTransform(initialWidth: number, initialHeight: number) {
  const [transform, setTransform] = useState<ImageTransform>({
    width: initialWidth,
    height: initialHeight,
    rotation: 0,
    scale: 100,
    borderRadius: 0,
    cropX: 0,
    cropY: 0,
    cropWidth: 100,
    cropHeight: 100,
  });

  const setWidth = (width: number) => {
    setTransform((prev) => ({ ...prev, width }));
  };

  const setHeight = (height: number) => {
    setTransform((prev) => ({ ...prev, height }));
  };

  const setRotation = (rotation: number) => {
    setTransform((prev) => ({ ...prev, rotation }));
  };

  const setScale = (scale: number) => {
    setTransform((prev) => ({ ...prev, scale }));
  };

  const setBorderRadius = (borderRadius: number) => {
    setTransform((prev) => ({ ...prev, borderRadius }));
  };

  const setCropX = (cropX: number) => {
    setTransform((prev) => ({ ...prev, cropX }));
  };

  const setCropY = (cropY: number) => {
    setTransform((prev) => ({ ...prev, cropY }));
  };

  const setCropWidth = (cropWidth: number) => {
    setTransform((prev) => ({ ...prev, cropWidth }));
  };

  const setCropHeight = (cropHeight: number) => {
    setTransform((prev) => ({ ...prev, cropHeight }));
  };

  const resetTransform = () => {
    setTransform({
      width: initialWidth,
      height: initialHeight,
      rotation: 0,
      scale: 100,
      borderRadius: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 100,
      cropHeight: 100,
    });
  };

  return {
    transform,
    setWidth,
    setHeight,
    setRotation,
    setScale,
    setBorderRadius,
    setCropX,
    setCropY,
    setCropWidth,
    setCropHeight,
    resetTransform,
  };
}

