import { useLayoutEffect, useRef, useState } from "react";
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
  matchContentAspectRatio?: boolean;
  sharedSize?: FilmFrameSize | null;
  className?: string;
};

export type FilmFrameSize = {
  width: number;
  height: number;
};

type HoleOutline = {
  firstX: number;
  firstY: number;
  secondX: number;
  secondY: number;
};

type FilmFrameGeometry = {
  contentRadius: number;
  contentX: number;
  contentY: number;
  filmBodyPath: string;
  frameRadius: number;
  holeOutlines: HoleOutline[];
  holeRadius: number;
  holeSize: number;
  requestedHoleCount: number | undefined;
};

const DEFAULT_SIZE: FilmFrameSize = { width: 0, height: 0 };
const GEOMETRY_CACHE_LIMIT = 32;
const geometryCache = new Map<string, FilmFrameGeometry>();

function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  if (width <= 0 || height <= 0) return "";

  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  const right = x + width;
  const bottom = y + height;

  if (safeRadius === 0) {
    return `M ${x} ${y} H ${right} V ${bottom} H ${x} Z`;
  }

  return [
    `M ${x + safeRadius} ${y}`,
    `H ${right - safeRadius}`,
    `Q ${right} ${y} ${right} ${y + safeRadius}`,
    `V ${bottom - safeRadius}`,
    `Q ${right} ${bottom} ${right - safeRadius} ${bottom}`,
    `H ${x + safeRadius}`,
    `Q ${x} ${bottom} ${x} ${bottom - safeRadius}`,
    `V ${y + safeRadius}`,
    `Q ${x} ${y} ${x + safeRadius} ${y}`,
    "Z",
  ].join(" ");
}

function getFilmFrameGeometry({
  size,
  thickness,
  perforationSize,
  perforationGap,
  perforationCount,
  radius,
  orientation,
  matchContentAspectRatio,
}: {
  size: FilmFrameSize;
  thickness: number;
  perforationSize: number;
  perforationGap: number;
  perforationCount: number | undefined;
  radius: number;
  orientation: "horizontal" | "vertical";
  matchContentAspectRatio: boolean;
}) {
  const cacheKey = [
    size.width,
    size.height,
    thickness,
    perforationSize,
    perforationGap,
    perforationCount ?? "auto",
    radius,
    orientation,
    matchContentAspectRatio,
  ].join(":");
  const cachedGeometry = geometryCache.get(cacheKey);
  if (cachedGeometry) return cachedGeometry;

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
  let contentX = isVertical ? bandThickness : edgeThickness;
  let contentY = isVertical ? edgeThickness : bandThickness;
  if (matchContentAspectRatio && size.width > 0 && size.height > 0) {
    if (isVertical) {
      contentY = Math.min(size.height / 2, contentX * size.height / size.width);
    } else {
      contentX = Math.min(size.width / 2, contentY * size.width / size.height);
    }
  }
  const contentWidth = Math.max(0, size.width - contentX * 2);
  const contentHeight = Math.max(0, size.height - contentY * 2);
  const frameRadius = Math.max(0, radius);
  const holeRadius = holeSize * 0.12;
  const contentRadius = Math.min(frameRadius, bandThickness / 3);
  const holeOutlines = Array.from({ length: holeCount }, (_, index) => {
    const repeatPosition = holeStart + index * pitch;
    return {
      firstX: isVertical ? holeCrossStart : repeatPosition,
      firstY: isVertical ? repeatPosition : holeCrossStart,
      secondX: isVertical ? holeCrossEnd : repeatPosition,
      secondY: isVertical ? repeatPosition : holeCrossEnd,
    };
  });
  const filmBodyPath = [
    roundedRectPath(0, 0, size.width, size.height, frameRadius),
    roundedRectPath(contentX, contentY, contentWidth, contentHeight, contentRadius),
    ...holeOutlines.map((hole) => [
      roundedRectPath(hole.firstX, hole.firstY, holeSize, holeSize, holeRadius),
      roundedRectPath(hole.secondX, hole.secondY, holeSize, holeSize, holeRadius),
    ].join(" ")),
  ].join(" ");
  const geometry = {
    contentRadius,
    contentX,
    contentY,
    filmBodyPath,
    frameRadius,
    holeOutlines,
    holeRadius,
    holeSize,
    requestedHoleCount,
  };

  if (geometryCache.size >= GEOMETRY_CACHE_LIMIT) {
    const oldestCacheKey = geometryCache.keys().next().value;
    if (oldestCacheKey !== undefined) geometryCache.delete(oldestCacheKey);
  }
  geometryCache.set(cacheKey, geometry);
  return geometry;
}

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
  matchContentAspectRatio = false,
  sharedSize,
  className = "",
}: FilmFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [measuredSize, setMeasuredSize] = useState<FilmFrameSize>(DEFAULT_SIZE);
  const usesSharedSize = sharedSize !== undefined;

  useLayoutEffect(() => {
    if (usesSharedSize) return;
    const frame = frameRef.current;
    if (!frame) return;
    let animationFrameId = 0;
    let isMounted = true;

    const updateSize = () => {
      if (!isMounted) return;
      // Layout dimensions stay stable while ancestor film rolls rotate and
      // scale. Visual bounds include those transforms and create distorted
      // SVG geometry plus a measurement feedback loop.
      const width = frame.offsetWidth;
      const height = frame.offsetHeight;
      const nextSize = { width: Math.round(width), height: Math.round(height) };
      setMeasuredSize((currentSize) => (
        currentSize.width === nextSize.width && currentSize.height === nextSize.height
          ? currentSize
          : nextSize
      ));
    };

    const scheduleSizeUpdate = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(updateSize);
    };

    const resizeObserver = new ResizeObserver(scheduleSizeUpdate);
    resizeObserver.observe(frame);
    updateSize();
    window.addEventListener("resize", scheduleSizeUpdate, { passive: true });
    void document.fonts?.ready.then(scheduleSizeUpdate);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", scheduleSizeUpdate);
    };
  }, [usesSharedSize]);

  const size = sharedSize ?? measuredSize;
  const {
    contentRadius,
    contentX,
    contentY,
    filmBodyPath,
    frameRadius,
    holeOutlines,
    holeRadius,
    holeSize,
    requestedHoleCount,
  } = getFilmFrameGeometry({
    size,
    thickness,
    perforationSize,
    perforationGap,
    perforationCount,
    radius,
    orientation,
    matchContentAspectRatio,
  });

  const frameStyle = {
    "--film-content-inset-block": `${contentY}px`,
    "--film-content-inset-inline": `${contentX}px`,
    "--film-content-inset-block-ratio": size.height > 0
      ? `${(contentY / size.height) * 100}%`
      : `${contentY}px`,
    "--film-content-inset-inline-ratio": size.width > 0
      ? `${(contentX / size.width) * 100}%`
      : `${contentX}px`,
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
      data-match-content-aspect={matchContentAspectRatio || undefined}
      data-perforation-count={requestedHoleCount}
      data-geometry-source={usesSharedSize ? "shared" : "local"}
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
          <path
            d={filmBodyPath}
            fill="currentColor"
            fillRule="evenodd"
          />
          {holeOutlines.map((hole, index) => (
            <g key={`hole-outline-${index}`} aria-hidden="true">
              <rect
                x={hole.firstX}
                y={hole.firstY}
                width={holeSize}
                height={holeSize}
                rx={holeRadius}
                fill="none"
                stroke="#000"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x={hole.secondX}
                y={hole.secondY}
                width={holeSize}
                height={holeSize}
                rx={holeRadius}
                fill="none"
                stroke="#000"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
