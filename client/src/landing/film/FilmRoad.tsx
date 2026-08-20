import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { getFilmRoadPose, type FilmRoadPose } from "./filmRoadConfig";

const FRAME_COUNT = 16;

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

function power(value: number) {
  return Math.pow(Math.max(0, value), 1.65);
}

function resolveCenter(pose: FilmRoadPose) {
  return pose.centerX;
}

function resolveWidth(pose: FilmRoadPose, depth: number) {
  return pose.farWidth + (pose.nearWidth - pose.farWidth) * power(depth);
}

function resolveY(pose: FilmRoadPose, depth: number) {
  return pose.horizonY + power(depth) * 910;
}

function makeFilmBody(pose: FilmRoadPose) {
  const samples = [0, 0.32, 0.66, 1.06].map((depth) => ({
    center: resolveCenter(pose),
    width: resolveWidth(pose, depth),
    y: resolveY(pose, depth),
  }));
  const left = samples.map(({ center, width, y }) => `${center - width / 2},${y}`);
  const right = samples.map(({ center, width, y }) => `${center + width / 2},${y}`);

  return [
    `M ${left[0]}`,
    `C ${left[1]} ${left[2]} ${left[3]}`,
    `L ${right[3]}`,
    `C ${right[2]} ${right[1]} ${right[0]}`,
    "Z",
  ].join(" ");
}

function SliceArtwork({ index }: { index: number }) {
  const tone = ["#f7ee57", "#ff6d45", "#a8f45a", "#7c79ff", "#f9f6ed", "#ff9ed2"][index % 6];

  return (
    <g>
      <rect className="film-road__frame-window" x="18" y="10" width="64" height="80" rx="2" fill={tone} />
      <path className="film-road__image-mountain" d="M21 77 L39 48 L51 61 L65 37 L79 70 V87 H21 Z" />
      <circle className="film-road__image-sun" cx="66" cy="30" r="7" />
      <path className="film-road__separator" d="M16 4 H84 M16 96 H84" />
      <rect className="film-road__sprocket" x="4" y="10" width="9" height="25" rx="2" />
      <rect className="film-road__sprocket" x="4" y="62" width="9" height="25" rx="2" />
      <rect className="film-road__sprocket" x="87" y="10" width="9" height="25" rx="2" />
      <rect className="film-road__sprocket" x="87" y="62" width="9" height="25" rx="2" />
    </g>
  );
}

export const FilmRoad = forwardRef<FilmRoadHandle>(function FilmRoad(_, ref) {
  const bodyRef = useRef<SVGPathElement>(null);
  const sliceRefs = useRef<SVGGElement[]>([]);
  const compactRef = useRef(false);
  const currentState = useRef<FilmRoadState>({ reel: 0.04 });

  const render = (state: FilmRoadState) => {
    const body = bodyRef.current;
    if (!body) return;

    const pose = getFilmRoadPose(compactRef.current);

    body.setAttribute("d", makeFilmBody(pose));

    sliceRefs.current.forEach((slice, index) => {
      if (!slice) return;

      const depth = wrap(index / FRAME_COUNT + state.reel);
      const nextDepth = Math.min(depth + 1 / FRAME_COUNT + 0.012, 1.08);
      const width = resolveWidth(pose, depth);
      const height = Math.max(14, resolveY(pose, nextDepth) - resolveY(pose, depth) + 2);
      const x = resolveCenter(pose) - width / 2;
      const y = resolveY(pose, depth);

      slice.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(width / 100).toFixed(4)} ${(height / 100).toFixed(4)})`);
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
          <path ref={bodyRef} className="film-road__body" d={makeFilmBody(getFilmRoadPose(false))} />
          {Array.from({ length: FRAME_COUNT }, (_, index) => (
            <g
              key={index}
              ref={(element) => {
                if (element) sliceRefs.current[index] = element;
              }}
              className="film-road__slice"
            >
              <SliceArtwork index={index} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
});
