"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scissors, Maximize2, RectangleHorizontal, Copy, Clipboard, Trash2, Image as ImageIcon, Shuffle, Eraser, Plus } from "lucide-react";

interface PlaygroundFooterProps {
  hasImage?: boolean;
  isImageSelected?: boolean;
  onCropClick?: () => void;
  onScaleClick?: () => void;
  onBorderRadiusClick?: () => void;
  showBorderRadiusSlider?: boolean;
  borderRadius?: number;
  onBorderRadiusChange?: (value: number) => void;
  isManagingBlurBlocks?: boolean;
  selectedBlurBlockId?: string | null;
  onCopyBlurBlock?: () => void;
  onPasteBlurBlock?: () => void;
  onDeleteBlurBlock?: () => void;
  hasCopiedBlurBlock?: boolean;
  // Canvas controls
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  onBackgroundDrawerOpen?: () => void;
  onImageUpload?: (file: File) => void;
  onToggleBlurBlockMode?: () => void;
  onAddBlurBlock?: () => void;
  onImageSelectionDone?: () => void;
  isBackgroundDrawerOpen?: boolean;
}

export function PlaygroundFooter({
  hasImage = false,
  isImageSelected = false,
  onCropClick,
  onScaleClick,
  onBorderRadiusClick,
  showBorderRadiusSlider = false,
  borderRadius = 0,
  onBorderRadiusChange,
  isManagingBlurBlocks = false,
  selectedBlurBlockId = null,
  onCopyBlurBlock,
  onPasteBlurBlock,
  onDeleteBlurBlock,
  hasCopiedBlurBlock = false,
  zoomLevel = 85,
  onZoomChange,
  onBackgroundDrawerOpen,
  onImageUpload,
  onToggleBlurBlockMode,
  onAddBlurBlock,
  onImageSelectionDone,
  isBackgroundDrawerOpen = false,
}: PlaygroundFooterProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-center px-6 py-4">
        <motion.div 
          className="flex items-center justify-between w-full max-w-6xl"
          animate={{
            x: isBackgroundDrawerOpen ? -192 : 0,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
        {/* Left side - Zoom slider */}
        <div className="flex items-center gap-3">
          {onZoomChange && (
            <>
              <input
                type="range"
                min="50"
                max="85"
                value={zoomLevel}
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="w-48 h-1 bg-gray-300 rounded-full appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #d1d5db 0%, #d1d5db ${
                    ((zoomLevel - 50) / (85 - 50)) * 100
                  }%, #e5e7eb ${
                    ((zoomLevel - 50) / (85 - 50)) * 100
                  }%, #e5e7eb 100%)`,
                }}
              />
              <span className="text-sm text-gray-700 font-medium min-w-[3ch]">
                {zoomLevel}%
              </span>
            </>
          )}
        </div>

        {/* Center controls */}
        <div className="flex items-center gap-6">
          {/* Border radius moved to CanvasWithRulers for consistent positioning */}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          {hasImage && isImageSelected && !isManagingBlurBlocks ? (
            <>
              <button
                onClick={onCropClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Scissors className="w-3.5 h-3.5" />
                Crop
              </button>
              <button
                onClick={onScaleClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Scale
              </button>
              <button
                onClick={onBorderRadiusClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                  showBorderRadiusSlider
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <RectangleHorizontal className="w-3.5 h-3.5" />
                Radius
              </button>
              <button
                onClick={onImageSelectionDone}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors bg-gray-900 text-white hover:bg-gray-800"
              >
                Done
              </button>
            </>
          ) : isManagingBlurBlocks ? (
            <>
              <button
                onClick={onAddBlurBlock}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Blur
              </button>
              <button
                onClick={onCopyBlurBlock}
                disabled={!selectedBlurBlockId}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                  selectedBlurBlockId
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
              <button
                onClick={onPasteBlurBlock}
                disabled={!hasCopiedBlurBlock}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                  hasCopiedBlurBlock
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Clipboard className="w-3.5 h-3.5" />
                Paste
              </button>
              <button
                onClick={onDeleteBlurBlock}
                disabled={!selectedBlurBlockId}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                  selectedBlurBlockId
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <button
                onClick={onToggleBlurBlockMode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors bg-gray-900 text-white hover:bg-gray-800"
              >
                Done
              </button>
            </>
          ) : !isImageSelected && (
            <>
              <button
                onClick={onBackgroundDrawerOpen}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Change BG
              </button>
              <button
                onClick={handleImageUploadClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Upload Image
              </button>
              <button
                onClick={onToggleBlurBlockMode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Eraser className="w-3.5 h-3.5" />
                Blur
              </button>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        </motion.div>
      </div>
    </footer>
  );
}

