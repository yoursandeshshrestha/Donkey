"use client";

import {
  MoveHorizontal,
  MoveVertical,
  RotateCw,
  Maximize2,
  Circle,
} from "lucide-react";

interface ImageControlsProps {
  width: number;
  height: number;
  rotation: number;
  scale: number;
  borderRadius: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onRotationChange: (rotation: number) => void;
  onScaleChange: (scale: number) => void;
  onBorderRadiusChange: (borderRadius: number) => void;
}

export function ImageControls({
  width,
  height,
  rotation,
  scale,
  borderRadius,
  onWidthChange,
  onHeightChange,
  onRotationChange,
  onScaleChange,
  onBorderRadiusChange,
}: ImageControlsProps) {
  return (
    <div className="fixed right-24 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg p-4 space-y-4 w-64">
      {/* Width Control */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <MoveHorizontal className="w-4 h-4" />
          Width: {width}px
        </label>
        <input
          type="range"
          min="200"
          max="2000"
          value={width}
          onChange={(e) => onWidthChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Height Control */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <MoveVertical className="w-4 h-4" />
          Height: {height}px
        </label>
        <input
          type="range"
          min="200"
          max="2000"
          value={height}
          onChange={(e) => onHeightChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Scale Control */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <Maximize2 className="w-4 h-4" />
          Scale: {scale}%
        </label>
        <input
          type="range"
          min="10"
          max="200"
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Rotation Control */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <RotateCw className="w-4 h-4" />
          Rotation: {rotation}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={rotation}
          onChange={(e) => onRotationChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Border Radius Control */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <Circle className="w-4 h-4" />
          Radius: {borderRadius}px
        </label>
        <input
          type="range"
          min="0"
          max="500"
          value={borderRadius}
          onChange={(e) => onBorderRadiusChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
