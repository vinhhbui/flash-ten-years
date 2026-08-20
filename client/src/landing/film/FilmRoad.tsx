import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { getFilmRoadPose, type FilmRoadPose } from "./filmRoadConfig";

const FILM_SAMPLE_COUNT = 30;
const EDGE_BAND_RATIO = 0.16;

export interface FilmRoadState {
  reel: number;
}

export interface FilmRoadHandle {
  setState: (state: FilmRoadState) => void;
  setCompact: (compact: boolean) => void;
}

function wrap(value: number) {
  return ((value % 1) + 1) % 1;
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function resolveY(pose: FilmRoadPose, depth: number) {
  return pose.horizonY + Math.pow(Math.max(0, depth), pose.depthPower) * (pose.foregroundY - pose.horizonY);
}

function resolveWidthAtY(pose: FilmRoadPose, y: number) {
  const amount = Math.max(0, Math.min(1, (y - pose.horizonY) / (pose.foregroundY - pose.horizonY)));
  return lerp(pose.farWidth, pose.nearWidth, amount);
}

function getRoadCorners(pose: FilmRoadPose) {
  return {
    farLeft: [pose.centerX - pose.farWidth / 2, pose.horizonY],
    farRight: [pose.centerX + pose.farWidth / 2, pose.horizonY],
    nearLeft: [pose.centerX - pose.nearWidth / 2, pose.foregroundY],
    nearRight: [pose.centerX + pose.nearWidth / 2, pose.foregroundY],
  } as const;
}

function getBandCorners(pose: FilmRoadPose) {
  const { farLeft, farRight, nearLeft, nearRight } = getRoadCorners(pose);
  const farBandWidth = pose.farWidth * EDGE_BAND_RATIO;
  const nearBandWidth = pose.nearWidth * EDGE_BAND_RATIO;

  return {
    leftInnerFar: [farLeft[0] + farBandWidth, farLeft[1]],
    leftInnerNear: [nearLeft[0] + nearBandWidth, nearLeft[1]],
    rightInnerFar: [farRight[0] - farBandWidth, farRight[1]],
    rightInnerNear: [nearRight[0] - nearBandWidth, nearRight[1]],
  } as const;
}

function makePath(points: readonly (readonly [number, number])[]) {
  return `M ${points.map(([x, y]) => `${x},${y}`).join(" L ")} Z`;
}

function getFilmShape(pose: FilmRoadPose) {
  const { farLeft, farRight, nearLeft, nearRight } = getRoadCorners(pose);
  const { leftInnerFar, leftInnerNear, rightInnerFar, rightInnerNear } = getBandCorners(pose);

  return {
    surface: makePath([farLeft, nearLeft, nearRight, farRight]),
    leftBand: makePath([farLeft, nearLeft, leftInnerNear, leftInnerFar]),
    rightBand: makePath([farRight, nearRight, rightInnerNear, rightInnerFar]),
  };
}

function getPatternGeometry(pose: FilmRoadPose, index: number, reel: number) {
  const depth = wrap(index / FILM_SAMPLE_COUNT + reel) * pose.depthRange;
  const nextDepth = depth + pose.depthRange / FILM_SAMPLE_COUNT;
  const y = resolveY(pose, depth);
  const width = resolveWidthAtY(pose, y);
  const edgeWidth = width * EDGE_BAND_RATIO;
  const gap = Math.max(1.5, edgeWidth * 0.14);
  const holeWidth = Math.max(3, edgeWidth - gap * 2);
  const spacing = Math.max(3, resolveY(pose, nextDepth) - y);
  const holeHeight = Math.max(2.5, spacing * 0.58);
  const left = pose.centerX - width / 2;
  const right = pose.centerX + width / 2;
  const holeY = y + Math.max(1, (spacing - holeHeight) * 0.5);

  return {
    leftX: left + gap,
    rightX: right - edgeWidth + gap,
    y: holeY,
    width: holeWidth,
    height: holeHeight,
    separatorStart: left + edgeWidth,
    separatorEnd: right - edgeWidth,
  };
}

function setNumericAttribute(element: SVGElement, name: string, value: number) {
  element.setAttribute(name, value.toFixed(2));
}

const initialFilmShape = getFilmShape(getFilmRoadPose(false));

export const FilmRoad = forwardRef<FilmRoadHandle>(function FilmRoad(_, ref) {
  const surfaceRef = useRef<SVGPathElement>(null);
  const leftBandRef = useRef<SVGPathElement>(null);
  const rightBandRef = useRef<SVGPathElement>(null);
  const leftSprocketRefs = useRef<SVGRectElement[]>([]);
  const rightSprocketRefs = useRef<SVGRectElement[]>([]);
  const separatorRefs = useRef<SVGLineElement[]>([]);
  const compactRef = useRef(false);
  const currentState = useRef<FilmRoadState>({ reel: 0.04 });

  const render = (state: FilmRoadState) => {
    const surface = surfaceRef.current;
    const leftBand = leftBandRef.current;
    const rightBand = rightBandRef.current;
    if (!surface || !leftBand || !rightBand) return;

    const pose = getFilmRoadPose(compactRef.current);
    const shape = getFilmShape(pose);

    surface.setAttribute("d", shape.surface);
    leftBand.setAttribute("d", shape.leftBand);
    rightBand.setAttribute("d", shape.rightBand);

    leftSprocketRefs.current.forEach((leftSprocket, index) => {
      const rightSprocket = rightSprocketRefs.current[index];
      const separator = separatorRefs.current[index];
      if (!leftSprocket || !rightSprocket || !separator) return;

      const pattern = getPatternGeometry(pose, index, state.reel);
      setNumericAttribute(leftSprocket, "x", pattern.leftX);
      setNumericAttribute(leftSprocket, "y", pattern.y);
      setNumericAttribute(leftSprocket, "width", pattern.width);
      setNumericAttribute(leftSprocket, "height", pattern.height);
      setNumericAttribute(rightSprocket, "x", pattern.rightX);
      setNumericAttribute(rightSprocket, "y", pattern.y);
      setNumericAttribute(rightSprocket, "width", pattern.width);
      setNumericAttribute(rightSprocket, "height", pattern.height);
      setNumericAttribute(separator, "x1", pattern.separatorStart);
      setNumericAttribute(separator, "x2", pattern.separatorEnd);
      setNumericAttribute(separator, "y1", pattern.y + pattern.height / 2);
      setNumericAttribute(separator, "y2", pattern.y + pattern.height / 2);
    });
  };

  useImperativeHandle(ref, () => ({
    setState: (state) => {
      currentState.current = state;
      render(state);
    },
    setCompact: (compact) => {
      compactRef.current = compact;
      render(currentState.current);
    },
  }));

  useLayoutEffect(() => {
    render(currentState.current);
  }, []);

  return (
    <div className="film-road" aria-hidden="true">
      <svg viewBox="0 0 1000 1160" preserveAspectRatio="none" focusable="false">
        <g>
          <path ref={surfaceRef} className="film-road__surface" d={initialFilmShape.surface} />
          <path ref={leftBandRef} className="film-road__edge-band" d={initialFilmShape.leftBand} />
          <path ref={rightBandRef} className="film-road__edge-band" d={initialFilmShape.rightBand} />
          {Array.from({ length: FILM_SAMPLE_COUNT }, (_, index) => (
            <g key={index}>
              <line
                ref={(element) => {
                  if (element) separatorRefs.current[index] = element;
                }}
                className="film-road__separator"
              />
              <rect
                ref={(element) => {
                  if (element) leftSprocketRefs.current[index] = element;
                }}
                className="film-road__sprocket"
                rx="1.5"
              />
              <rect
                ref={(element) => {
                  if (element) rightSprocketRefs.current[index] = element;
                }}
                className="film-road__sprocket"
                rx="1.5"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
});
