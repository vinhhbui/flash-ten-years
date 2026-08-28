import { useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./FilmFrame.css";

export type FilmFrameProps = {
  children?: ReactNode;
  thickness?: number;
  perforationSize?: number;
  perforationGap?: number;
  perforationCount?: number;
  radius?: number;
  orientation?: "horizontal" | "vertical";
  fitContent?: boolean;
  matchViewportAspectRatio?: boolean;
  className?: string;
};

type FrameSize = {
  width: number;
  height: number;
};

const DEFAULT_SIZE: FrameSize = { width: 0, height: 0 };

export default function FilmFrame({
  children,
  thickness = 64,
  perforationSize = 24,
  perforationGap = 16,
  perforationCount,
  radius = 4,
  orientation = "horizontal",
  fitContent = false,
  matchViewportAspectRatio = false,
  className = "",
}: FilmFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<FrameSize>(DEFAULT_SIZE);
  const componentId = useId().replace(/:/g, "");
  const maskId = `film-frame-mask-${componentId}`;

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateSize = (width: number, height: number) => {
      const nextSize = { width: Math.round(width), height: Math.round(height) };
      setSize((currentSize) => (
        currentSize.width === nextSize.width && currentSize.height === nextSize.height
          ? currentSize
          : nextSize
      ));
    };

    const initialBounds = frame.getBoundingClientRect();
    updateSize(initialBounds.width, initialBounds.height);

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      updateSize(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const isVertical = orientation === "vertical";
  const bandAxis = isVertical ? size.width : size.height;
  const repeatAxis = isVertical ? size.height : size.width;
  const bandThickness = Math.max(12, Math.min(thickness, bandAxis * 0.22, repeatAxis * 0.24));
  const baseHoleSize = Math.max(6, Math.min(perforationSize, bandThickness * 0.5));
  const baseHoleGap = Math.max(4, perforationGap);
  const requestedHoleCount = perforationCount === undefined
    ? undefined
    : Math.max(1, Math.floor(perforationCount));
  const requiredFixedPatternLength = requestedHoleCount === undefined
    ? 0
    : requestedHoleCount * baseHoleSize + (requestedHoleCount + 1) * baseHoleGap;
  const fixedPatternScale = requiredFixedPatternLength > 0
    ? Math.min(1, repeatAxis / requiredFixedPatternLength)
    : 1;
  const holeSize = requestedHoleCount === undefined
    ? baseHoleSize
    : baseHoleSize * fixedPatternScale;
  const minimumHoleGap = requestedHoleCount === undefined
    ? baseHoleGap
    : baseHoleGap * fixedPatternScale;
  const automaticPitch = holeSize + baseHoleGap;
  const perforationLength = Math.max(0, repeatAxis - baseHoleGap * 2);
  const automaticHoleCount = repeatAxis > 0
    ? Math.max(1, Math.floor((perforationLength + baseHoleGap) / automaticPitch))
    : 0;
  const holeCount = requestedHoleCount ?? automaticHoleCount;
  const distributedHoleGap = requestedHoleCount !== undefined && repeatAxis > 0
    ? (repeatAxis - holeCount * holeSize) / (holeCount + 1)
    : baseHoleGap;
  const holeGap = Math.max(minimumHoleGap, distributedHoleGap);
  const pitch = holeSize + holeGap;
  const holesLength = holeCount * holeSize + Math.max(0, holeCount - 1) * holeGap;
  const holeStart = (repeatAxis - holesLength) / 2;
  const holeCrossStart = (bandThickness - holeSize) / 2;
  const holeCrossEnd = bandAxis - bandThickness + holeCrossStart;
  const edgeThickness = Math.max(5, Math.min(12, bandThickness * 0.16));
  const contentX = isVertical ? bandThickness : edgeThickness;
  const contentY = isVertical ? edgeThickness : bandThickness;
  const contentWidth = Math.max(0, size.width - contentX * 2);
  const contentHeight = Math.max(0, size.height - contentY * 2);
  const frameRadius = Math.max(0, radius);
  const holeRadius = holeSize * 0.12;
  const contentRadius = Math.min(frameRadius, bandThickness / 3);

  const frameStyle = {
    "--film-content-inset-block": `${contentY}px`,
    "--film-content-inset-inline": `${contentX}px`,
    "--film-content-radius": `${contentRadius}px`,
    "--film-frame-radius": `${frameRadius}px`,
    "--film-frame-fixed-aspect-ratio": requestedHoleCount === undefined
      ? undefined
      : `4 / ${requestedHoleCount}`,
  } as CSSProperties;

  return (
    <div
      ref={frameRef}
      className={`film-frame${className ? ` ${className}` : ""}`}
      data-orientation={orientation}
      data-fit-content={fitContent || undefined}
      data-match-viewport-aspect={matchViewportAspectRatio || undefined}
      data-perforation-count={requestedHoleCount}
      style={frameStyle}
    >
      <div className="film-frame__content">{children}</div>
      {size.width > 0 && size.height > 0 && (
        <svg
          className="film-frame__geometry"
          viewBox={`0 0 ${size.width} ${size.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <mask
              id={maskId}
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              maskUnits="userSpaceOnUse"
            >
              <rect width={size.width} height={size.height} fill="white" />
              <rect
                x={contentX}
                y={contentY}
                width={contentWidth}
                height={contentHeight}
                rx={contentRadius}
                fill="black"
              />
              {Array.from({ length: holeCount }, (_, index) => {
                const repeatPosition = holeStart + index * pitch;
                return (
                  <g key={index}>
                    <rect
                      x={isVertical ? holeCrossStart : repeatPosition}
                      y={isVertical ? repeatPosition : holeCrossStart}
                      width={holeSize}
                      height={holeSize}
                      rx={holeRadius}
                      fill="black"
                      data-edge={isVertical ? "left" : "top"}
                    />
                    <rect
                      x={isVertical ? holeCrossEnd : repeatPosition}
                      y={isVertical ? repeatPosition : holeCrossEnd}
                      width={holeSize}
                      height={holeSize}
                      rx={holeRadius}
                      fill="black"
                      data-edge={isVertical ? "right" : "bottom"}
                    />
                  </g>
                );
              })}
            </mask>
          </defs>
          <rect
            width={size.width}
            height={size.height}
            rx={frameRadius}
            fill="currentColor"
            mask={`url(#${maskId})`}
          />
          {Array.from({ length: holeCount }, (_, index) => {
            const repeatPosition = holeStart + index * pitch;

            return (
              <g key={`hole-outline-${index}`} aria-hidden="true">
                <rect
                  x={isVertical ? holeCrossStart : repeatPosition}
                  y={isVertical ? repeatPosition : holeCrossStart}
                  width={holeSize}
                  height={holeSize}
                  rx={holeRadius}
                  fill="none"
                  stroke="#000"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                <rect
                  x={isVertical ? holeCrossEnd : repeatPosition}
                  y={isVertical ? repeatPosition : holeCrossEnd}
                  width={holeSize}
                  height={holeSize}
                  rx={holeRadius}
                  fill="none"
                  stroke="#000"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
