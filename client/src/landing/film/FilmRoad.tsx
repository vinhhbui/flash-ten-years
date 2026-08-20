import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { getFilmRoadPose, type FilmRoadPose } from "./filmRoadConfig";

const FILM_SAMPLE_COUNT = 28;
const EDGE_BAND_RATIO = 0.16;
const BODY_SAMPLE_DEPTHS = [0, 0.18, 0.36, 0.54, 0.7, 0.82, 0.91, 0.97, 1.06];

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

function resolveWidth(pose: FilmRoadPose, depth: number) {
  const taper = Math.pow(Math.max(0, depth), pose.widthPower);
  return pose.farWidth + (pose.nearWidth - pose.farWidth) * taper;
}

function resolveY(pose: FilmRoadPose, depth: number) {
  return pose.horizonY + Math.pow(Math.max(0, depth), pose.depthPower) * pose.verticalReach;
}

interface FilmSample {
  left: number;
  right: number;
  innerLeft: number;
  innerRight: number;
  y: number;
}

function getFilmSamples(pose: FilmRoadPose) {
  return BODY_SAMPLE_DEPTHS.map((depth) => {
    const width = resolveWidth(pose, depth);
    const left = pose.centerX - width / 2;
    const right = pose.centerX + width / 2;
    const edgeWidth = width * EDGE_BAND_RATIO;

    return {
      left,
      right,
      innerLeft: left + edgeWidth,
      innerRight: right - edgeWidth,
      y: resolveY(pose, depth),
    };
  });
}

function makeFilmSurface(samples: FilmSample[]) {
  const left = samples.map(({ left: x, y }) => `${x},${y}`);
  const right = samples.map(({ right: x, y }) => `${x},${y}`).reverse();

  return `M ${left.join(" L ")} L ${right.join(" L ")} Z`;
}

function makeEdgeBand(samples: FilmSample[], side: "left" | "right") {
  const outer = samples.map(({ left, right, y }) => `${side === "left" ? left : right},${y}`);
  const inner = samples.map(({ innerLeft, innerRight, y }) => `${side === "left" ? innerLeft : innerRight},${y}`).reverse();

  return `M ${outer.join(" L ")} L ${inner.join(" L ")} Z`;
}

function FilmPatternSample() {
  return (
    <g>
      <path className="film-road__separator" d="M18 0 H82" />
      <rect className="film-road__sprocket" x="5" y="20" width="8" height="60" rx="1.5" />
      <rect className="film-road__sprocket" x="87" y="20" width="8" height="60" rx="1.5" />
    </g>
  );
}

function getFilmShape(pose: FilmRoadPose) {
  const samples = getFilmSamples(pose);

  return {
    surface: makeFilmSurface(samples),
    leftBand: makeEdgeBand(samples, "left"),
    rightBand: makeEdgeBand(samples, "right"),
  };
}

function getSampleTransform(pose: FilmRoadPose, index: number, reel: number) {
  const depth = wrap(index / FILM_SAMPLE_COUNT + reel) * pose.depthRange;
  const nextDepth = depth + pose.depthRange / FILM_SAMPLE_COUNT + 0.004;
  const width = resolveWidth(pose, depth);
  const height = Math.max(3, resolveY(pose, nextDepth) - resolveY(pose, depth) + 1);
  const x = pose.centerX - width / 2;
  const y = resolveY(pose, depth);

  return `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(width / 100).toFixed(4)} ${(height / 100).toFixed(4)})`;
}

const initialFilmShape = getFilmShape(getFilmRoadPose(false));

export const FilmRoad = forwardRef<FilmRoadHandle>(function FilmRoad(_, ref) {
  const surfaceRef = useRef<SVGPathElement>(null);
  const leftBandRef = useRef<SVGPathElement>(null);
  const rightBandRef = useRef<SVGPathElement>(null);
  const sliceRefs = useRef<SVGGElement[]>([]);
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

    sliceRefs.current.forEach((slice, index) => {
      if (!slice) return;

      slice.setAttribute("transform", getSampleTransform(pose, index, state.reel));
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
            <g
              key={index}
              ref={(element) => {
                if (element) sliceRefs.current[index] = element;
              }}
              className="film-road__slice"
            >
              <FilmPatternSample />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
});
