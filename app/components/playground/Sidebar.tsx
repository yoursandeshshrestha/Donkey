"use client";

import { ImagePlus, Wallpaper, Shuffle, Wand2, Scissors } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DownloadMenu } from "./DownloadMenu";
import { CanvasSize } from "../../playground/types";

interface SidebarProps {
  onImageUpload: (file: File) => void;
  onBackgroundChange: () => void;
  onBackgroundUpload: (file: File) => void;
  onGenerateGradient: () => void;
  onCropImage?: () => void;
  onDownload?: (scale: number) => void;
  hasImage?: boolean;
  borderRadius?: number;
  onBorderRadiusChange?: (value: number) => void;
  imageScale?: number;
  onImageScaleChange?: (value: number) => void;
  canvasSizes?: CanvasSize[];
  selectedCanvasSize?: number;
  onCanvasSizeChange?: (index: number) => void;
  backgroundBlur?: number;
  onBackgroundBlurChange?: (value: number) => void;
}

export function Sidebar({
  onImageUpload,
  onBackgroundChange,
  onBackgroundUpload,
  onGenerateGradient,
  onCropImage,
  onDownload,
  hasImage = false,
  borderRadius = 0,
  onBorderRadiusChange,
  imageScale = 100,
  onImageScaleChange,
  canvasSizes = [],
  selectedCanvasSize = 0,
  onCanvasSizeChange,
  backgroundBlur = 0,
  onBackgroundBlurChange,
}: SidebarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleBackgroundFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onBackgroundUpload(file);
    }
  };

  const handleImageUploadClick = () => {
    imageInputRef.current?.click();
  };

  const handleBackgroundUploadClick = () => {
    backgroundInputRef.current?.click();
  };

  return (
    <>
      {/* Trigger zone on the right edge */}
      <div
        className="fixed right-0 top-0 w-16 h-full z-40"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />

      {/* Full Height Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isVisible ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-[10%] h-[80%] w-59 bg-white z-50 flex flex-col py-12 "
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <div className="flex flex-col flex-1">
          <button
            onClick={handleImageUploadClick}
            className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
          >
            <ImagePlus className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Upload Image</span>
          </button>

          <button
            onClick={handleBackgroundUploadClick}
            className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
          >
            <Wallpaper className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Upload Background</span>
          </button>

          <button
            onClick={onBackgroundChange}
            className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
          >
            <Shuffle className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Change Background</span>
          </button>

          <button
            onClick={onGenerateGradient}
            className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
          >
            <Wand2 className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Generate Gradient</span>
          </button>

          {onBackgroundBlurChange && (
            <div className="px-3 py-3 border-b border-gray-100">
              <label className="text-xs text-gray-500 mb-3 block">
                Background Blur
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  value={backgroundBlur}
                  onChange={(e) =>
                    onBackgroundBlurChange(Number(e.target.value))
                  }
                  className="flex-1"
                  min="0"
                  max="50"
                  step="1"
                />
                <input
                  type="number"
                  value={backgroundBlur}
                  onChange={(e) =>
                    onBackgroundBlurChange(Number(e.target.value))
                  }
                  className="w-16 px-2 py-1.5 bg-gray-50 rounded text-sm text-gray-900 text-center font-mono focus:outline-none focus:bg-gray-100"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          )}

          {canvasSizes.length > 0 && onCanvasSizeChange && (
            <div className="px-3 py-3 border-b border-gray-100">
              <label className="text-xs text-gray-500 mb-3 block">
                Canvas Size
              </label>
              <select
                value={selectedCanvasSize}
                onChange={(e) => onCanvasSizeChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 rounded text-sm text-gray-900 focus:outline-none focus:bg-gray-100"
              >
                {canvasSizes.map((size, index) => (
                  <option key={index} value={index}>
                    {size.width} × {size.height} ({size.aspectRatio})
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasImage && (
            <>
              {onCropImage && (
                <button
                  onClick={onCropImage}
                  className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                >
                  <Scissors className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Crop Image</span>
                </button>
              )}

              {onImageScaleChange && (
                <div className="px-3 py-3 border-b border-gray-100">
                  <label className="text-xs text-gray-500 mb-3 block">
                    Image Scale
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      value={imageScale}
                      onChange={(e) =>
                        onImageScaleChange(Number(e.target.value))
                      }
                      className="flex-1"
                      min="10"
                      max="200"
                      step="1"
                    />
                    <input
                      type="number"
                      value={imageScale}
                      onChange={(e) =>
                        onImageScaleChange(Number(e.target.value))
                      }
                      className="w-16 px-2 py-1.5 bg-gray-50 rounded text-sm text-gray-900 text-center font-mono focus:outline-none focus:bg-gray-100"
                      min="10"
                      max="200"
                    />
                  </div>
                </div>
              )}

              {onBorderRadiusChange && (
                <div className="px-3 py-3 border-b border-gray-100">
                  <label className="text-xs text-gray-500 mb-3 block">
                    Border Radius
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      value={borderRadius}
                      onChange={(e) =>
                        onBorderRadiusChange(Number(e.target.value))
                      }
                      className="flex-1"
                      min="0"
                      max="500"
                      step="1"
                    />
                    <input
                      type="number"
                      value={borderRadius}
                      onChange={(e) =>
                        onBorderRadiusChange(Number(e.target.value))
                      }
                      className="w-16 px-2 py-1.5 bg-gray-50 rounded text-sm text-gray-900 text-center font-mono focus:outline-none focus:bg-gray-100"
                      min="0"
                      max="500"
                    />
                  </div>
                </div>
              )}

              {onDownload && (
                <div className="mt-auto pt-4 px-3">
                  <DownloadMenu onDownload={onDownload} />
                </div>
              )}
            </>
          )}
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
        />

        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/*"
          onChange={handleBackgroundFileChange}
          className="hidden"
        />
      </motion.div>
    </>
  );
}
