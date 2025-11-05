"use client";

import { Canvas } from "./Canvas";
import { GradientData } from "../../playground/utils/gradientGenerator";
import { ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BlurBlock } from "../../playground/types";
import { BlurBlockOverlay } from "./BlurBlockOverlay";
import { CROP_PRESETS } from "./InlineCrop";

interface CanvasWithRulersProps {
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
  onImageClick?: () => void;
  onBackgroundClick?: () => void;
  overlay?: ReactNode;
  onBackgroundDrawerOpen?: () => void;
  onImageUpload?: (file: File) => void;
  isImageSelected?: boolean;
  isCropping?: boolean;
  cropPresetIndex?: number;
  onCropPresetChange?: (index: number) => void;
  isBackgroundDrawerOpen?: boolean;
  blurBlocks?: BlurBlock[];
  isManagingBlurBlocks?: boolean;
  onAddBlurBlock?: () => void;
  onUpdateBlurBlock?: (id: string, updates: Partial<BlurBlock>) => void;
  onDeleteBlurBlock?: (id: string) => void;
  onToggleBlurBlockMode?: () => void;
  selectedBlurBlockId?: string | null;
  onSelectBlurBlock?: (id: string | null) => void;
  onCopyBlurBlock?: (id: string) => void;
  onPasteBlurBlock?: () => void;
  hasCopiedBlurBlock?: boolean;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  onEnterBlurMode?: () => void;
  isCustomCanvas?: boolean;
  onCanvasWidthChange?: (width: number) => void;
  onCanvasHeightChange?: (height: number) => void;
  showBorderRadiusSlider?: boolean;
  borderRadius?: number;
  onBorderRadiusChange?: (radius: number) => void;
}

export function CanvasWithRulers({
  width,
  height,
  backgroundSrc,
  backgroundGradient,
  backgroundBlur,
  uploadedImageSrc,
  imageTransform,
  onImageClick,
  onBackgroundClick,
  overlay,
  onBackgroundDrawerOpen,
  onImageUpload,
  isImageSelected = false,
  isCropping = false,
  cropPresetIndex = 0,
  onCropPresetChange,
  isBackgroundDrawerOpen = false,
  blurBlocks = [],
  isManagingBlurBlocks = false,
  onAddBlurBlock,
  onUpdateBlurBlock,
  onDeleteBlurBlock,
  onToggleBlurBlockMode,
  selectedBlurBlockId = null,
  onSelectBlurBlock,
  onCopyBlurBlock,
  onPasteBlurBlock,
  hasCopiedBlurBlock = false,
  zoomLevel: externalZoomLevel,
  onZoomChange,
  onEnterBlurMode,
  isCustomCanvas = false,
  onCanvasWidthChange,
  onCanvasHeightChange,
  showBorderRadiusSlider = false,
  borderRadius = 0,
  onBorderRadiusChange,
}: CanvasWithRulersProps) {
  // Use state for viewport-dependent calculations to avoid hydration errors
  const [maxDisplayWidth, setMaxDisplayWidth] = useState(1200);
  const [maxDisplayHeight, setMaxDisplayHeight] = useState(800);
  const [internalZoomLevel, setInternalZoomLevel] = useState(85);
  const zoomLevel = externalZoomLevel ?? internalZoomLevel;

  // State for resize handles
  type ResizeDirection =
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | null;
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialDimensions, setInitialDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Update display dimensions after mount (client-side only)
    const updateDimensions = () => {
      setMaxDisplayWidth(window.innerWidth * 0.7);
      setMaxDisplayHeight(window.innerHeight * 0.8);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const scaleX = Math.min(1, maxDisplayWidth / width);
  const scaleY = Math.min(1, maxDisplayHeight / height);
  const baseDisplayScale = Math.min(scaleX, scaleY);
  const displayScale = baseDisplayScale * (zoomLevel / 85);

  // Handle resize dragging with requestAnimationFrame for smooth performance
  useEffect(() => {
    if (!resizeDirection) return;

    let animationFrameId: number;
    let lastMouseX = dragStart.x;
    let lastMouseY = dragStart.y;

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      // Cancel any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Use requestAnimationFrame for smooth updates
      animationFrameId = requestAnimationFrame(() => {
        const deltaX = (lastMouseX - dragStart.x) / displayScale;
        const deltaY = (lastMouseY - dragStart.y) / displayScale;

        // Edge handles only affect one dimension
        if (resizeDirection === "right" || resizeDirection === "left") {
          // Only change width for left/right edges
          let newWidth =
            resizeDirection === "right"
              ? initialDimensions.width + deltaX
              : initialDimensions.width - deltaX;

          newWidth = Math.max(400, Math.min(3840, newWidth));
          if (onCanvasWidthChange && newWidth !== width) {
            onCanvasWidthChange(Math.round(newWidth));
          }
        } else if (resizeDirection === "top" || resizeDirection === "bottom") {
          // Only change height for top/bottom edges
          let newHeight =
            resizeDirection === "bottom"
              ? initialDimensions.height + deltaY
              : initialDimensions.height - deltaY;

          newHeight = Math.max(400, Math.min(2160, newHeight));
          if (onCanvasHeightChange && newHeight !== height) {
            onCanvasHeightChange(Math.round(newHeight));
          }
        } else {
          // Corner handles affect both dimensions
          let newWidth = initialDimensions.width;
          let newHeight = initialDimensions.height;

          if (resizeDirection?.includes("right")) {
            newWidth = initialDimensions.width + deltaX;
          } else if (resizeDirection?.includes("left")) {
            newWidth = initialDimensions.width - deltaX;
          }

          if (resizeDirection?.includes("bottom")) {
            newHeight = initialDimensions.height + deltaY;
          } else if (resizeDirection?.includes("top")) {
            newHeight = initialDimensions.height - deltaY;
          }

          // Constrain dimensions
          newWidth = Math.max(400, Math.min(3840, newWidth));
          newHeight = Math.max(400, Math.min(2160, newHeight));

          // Update both dimensions for corners
          if (onCanvasWidthChange && newWidth !== width) {
            onCanvasWidthChange(Math.round(newWidth));
          }
          if (onCanvasHeightChange && newHeight !== height) {
            onCanvasHeightChange(Math.round(newHeight));
          }
        }
      });
    };

    const handleMouseUp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setResizeDirection(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    resizeDirection,
    dragStart,
    initialDimensions,
    displayScale,
    onCanvasWidthChange,
    onCanvasHeightChange,
    width,
    height,
  ]);

  const handleResizeStart =
    (direction: ResizeDirection) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizeDirection(direction);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialDimensions({ width, height });
    };

  const displayWidth = width * displayScale;
  const displayHeight = height * displayScale;

  return (
    <>
      <motion.div
        className="relative inline-block"
        animate={{
          x: isBackgroundDrawerOpen ? -192 : 0,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div
          className="relative inline-block border border-gray-200"
          style={{
            width: displayWidth,
            height: displayHeight,
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Canvas with scale transform */}
          <div
            className="relative"
            style={{
              transform: `scale(${displayScale})`,
              transformOrigin: "top left",
              width: width,
              height: height,
            }}
          >
            <Canvas
              width={width}
              height={height}
              backgroundSrc={backgroundSrc}
              backgroundGradient={backgroundGradient}
              backgroundBlur={backgroundBlur}
              uploadedImageSrc={uploadedImageSrc}
              imageTransform={imageTransform}
              onImageClick={onImageClick}
              onBackgroundClick={onBackgroundClick}
              blurBlocks={blurBlocks}
            />
            {/* Render overlay inside the same scaled container */}
            {overlay}
            {/* Render blur block overlay - always show if there are blur blocks */}
            {blurBlocks.length > 0 &&
              onUpdateBlurBlock &&
              onDeleteBlurBlock &&
              onSelectBlurBlock && (
                <BlurBlockOverlay
                  blurBlocks={blurBlocks}
                  onUpdateBlurBlock={onUpdateBlurBlock}
                  onDeleteBlurBlock={onDeleteBlurBlock}
                  canvasWidth={width}
                  canvasHeight={height}
                  selectedBlockId={
                    isManagingBlurBlocks ? selectedBlurBlockId : null
                  }
                  onSelectBlock={onSelectBlurBlock}
                  onCopyBlock={onCopyBlurBlock}
                  onPasteBlock={onPasteBlurBlock}
                  hasCopiedBlock={hasCopiedBlurBlock}
                  onEnterBlurMode={onEnterBlurMode}
                  isEditMode={isManagingBlurBlocks}
                />
              )}
          </div>

          {/* Resize handles for custom canvas mode */}
          {isCustomCanvas && onCanvasWidthChange && onCanvasHeightChange && (
            <>
              {/* Edge handles */}
              {/* Top */}
              <div
                className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-500/30 transition-colors z-10"
                onMouseDown={handleResizeStart("top")}
              />

              {/* Right */}
              <div
                className="absolute top-0 -right-1 bottom-0 w-2 cursor-ew-resize hover:bg-blue-500/30 transition-colors z-10"
                onMouseDown={handleResizeStart("right")}
              />

              {/* Bottom */}
              <div
                className="absolute top-0 left-0 -bottom-1 right-0 h-2 cursor-ns-resize hover:bg-blue-500/30 transition-colors z-10"
                onMouseDown={handleResizeStart("bottom")}
              />

              {/* Left */}
              <div
                className="absolute -left-1 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-500/30 transition-colors z-10"
                onMouseDown={handleResizeStart("left")}
              />

              {/* Corner handles */}
              {/* Top-Left */}
              <div
                className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize hover:scale-125 transition-transform z-20 shadow-md"
                onMouseDown={handleResizeStart("top-left")}
              />

              {/* Top-Right */}
              <div
                className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize hover:scale-125 transition-transform z-20 shadow-md"
                onMouseDown={handleResizeStart("top-right")}
              />

              {/* Bottom-Right */}
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize hover:scale-125 transition-transform z-20 shadow-md"
                onMouseDown={handleResizeStart("bottom-right")}
              />

              {/* Bottom-Left */}
              <div
                className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize hover:scale-125 transition-transform z-20 shadow-md"
                onMouseDown={handleResizeStart("bottom-left")}
              />
            </>
          )}
        </div>
      </motion.div>

      {/* Crop controls - show when cropping */}
      {isCropping && onCropPresetChange && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {/* Crop Dimension Presets - left side */}
          <div className="absolute bottom-10 left-10 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-medium">
                  Crop Dimension:
                </span>
                <div className="flex gap-2">
                  {CROP_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => onCropPresetChange(index)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        cropPresetIndex === index
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard hints - right side */}
          <div className="absolute bottom-10 right-10 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-3 shadow-lg flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                Press{" "}
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  Enter
                </kbd>{" "}
                to apply
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                Press{" "}
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  Esc
                </kbd>{" "}
                to cancel
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blur controls - show when managing blur blocks */}
      {isManagingBlurBlocks && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {/* Blur amount control - left side (same position as Crop Dimension) */}
          <div className="absolute bottom-10 left-10 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-medium">
                  {selectedBlurBlockId ? "Blur Amount:" : "Select a blur block"}
                </span>
                {selectedBlurBlockId && (
                  <>
                    <input
                      type="range"
                      value={
                        blurBlocks.find((b) => b.id === selectedBlurBlockId)
                          ?.blurAmount || 10
                      }
                      onChange={(e) => {
                        if (onUpdateBlurBlock) {
                          onUpdateBlurBlock(selectedBlurBlockId, {
                            blurAmount: Number(e.target.value),
                          });
                        }
                      }}
                      className="w-32 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
                      min="1"
                      max="50"
                      step="1"
                    />
                    <input
                      type="number"
                      value={
                        blurBlocks.find((b) => b.id === selectedBlurBlockId)
                          ?.blurAmount || 10
                      }
                      onChange={(e) => {
                        if (onUpdateBlurBlock) {
                          onUpdateBlurBlock(selectedBlurBlockId, {
                            blurAmount: Number(e.target.value),
                          });
                        }
                      }}
                      className="w-16 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                      min="1"
                      max="50"
                    />
                    <span className="text-xs text-gray-500">px</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Keyboard hints - right side (same position as crop mode hints) */}
          <div className="absolute bottom-10 right-10 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-3 shadow-lg flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                Press{" "}
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  Enter
                </kbd>{" "}
                to save and exit
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Border Radius controls - show when border radius mode is active */}
      {showBorderRadiusSlider && onBorderRadiusChange && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {/* Border Radius control - left side (same position as Crop/Blur) */}
          <div className="absolute bottom-10 left-10 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-medium">
                  Border Radius:
                </span>
                <input
                  type="range"
                  value={borderRadius}
                  onChange={(e) => onBorderRadiusChange(Number(e.target.value))}
                  className="w-32 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
                  min="0"
                  max="500"
                  step="1"
                />
                <input
                  type="number"
                  value={borderRadius}
                  onChange={(e) => onBorderRadiusChange(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                  min="0"
                  max="500"
                />
                <span className="text-xs text-gray-500">px</span>
              </div>
            </div>
          </div>

          {/* Keyboard hints - right side */}
          <div className="absolute bottom-10 right-10 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-3 shadow-lg flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                Press{" "}
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  Enter
                </kbd>{" "}
                to save and exit
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
