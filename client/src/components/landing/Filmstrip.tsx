import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import type { FilmFrameContent } from "../../data/landingContent";

const FILM_PATH = "M 70 480 C 74 214 258 84 372 214 C 490 348 164 432 228 168 C 285 -50 622 38 608 242 C 596 422 440 450 538 568 C 662 718 886 586 916 354";
const SPROCKET_COUNT = 34;

const tones = {
  acid: "#d9ff32",
  pink: "#ff4fa4",
  blue: "#3b6cff",
  orange: "#ff6d2d",
  white: "#f6f4ed",
  lilac: "#b99aff",
} as const;

export interface FilmstripHandle {
  setProgress: (progress: number) => void;
}

interface FilmstripProps {
  frames: FilmFrameContent[];
  className?: string;
  label: string;
}

function wrapDistance(value: number, length: number) {
  return Math.max(length * 0.035, Math.min(length * 0.965, value));
}

function angleAt(path: SVGPathElement, distance: number, length: number) {
  const before = path.getPointAtLength(wrapDistance(distance - 2, length));
  const after = path.getPointAtLength(wrapDistance(distance + 2, length));
  return Math.atan2(after.y - before.y, after.x - before.x) * (180 / Math.PI);
}

function FilmFrame({ frame, index, frameRef }: {
  frame: FilmFrameContent;
  index: number;
  frameRef: (element: SVGGElement | null) => void;
}) {
  const tone = tones[frame.tone];
  const isMilestone = frame.type === "milestone";
  const isCat = frame.type === "memory-cat";
  const isBlank = frame.type === "blank";

  return (
    <g ref={frameRef} className={`filmstrip__frame filmstrip__frame--${frame.type}`}>
      <rect className="filmstrip__frame-shell" x="-72" y="-48" width="144" height="96" rx="7" />
      <rect className="filmstrip__frame-window" x="-58" y="-30" width="116" height="60" rx="2" fill={tone} />
      {frame.type === "photo" && <>
        <path className="filmstrip__photo-mark" d="M-58 21 L-24 -12 L4 9 L24 -21 L58 15 V30 H-58 Z" />
        <circle className="filmstrip__photo-sun" cx="30" cy="-11" r="8" />
      </>}
      {isCat && <g className="filmstrip__cat-mark">
        <path d="M-25 11 V-17 L-10 -5 L8 -5 L23 -17 V12 C23 29 11 34 -1 34 C-14 34 -25 29 -25 11 Z" />
        <path d="M21 15 C42 10 43 34 27 30" fill="none" />
        <circle cx="-9" cy="10" r="2.5" />
        <circle cx="8" cy="10" r="2.5" />
      </g>}
      {isBlank && <rect className="filmstrip__blank-outline" x="-46" y="-18" width="92" height="36" rx="2" />}
      {isMilestone && frame.year && <text className="filmstrip__frame-year" x="0" y="-1">{frame.year}</text>}
      {!isMilestone && !isCat && !isBlank && <text className="filmstrip__frame-title" x="0" y="5">{frame.title}</text>}
      {isCat && <text className="filmstrip__frame-title filmstrip__frame-title--cat" x="0" y="-31">{frame.title}</text>}
      {isBlank && <text className="filmstrip__frame-title filmstrip__frame-title--blank" x="0" y="43">{frame.title}</text>}
      {isMilestone && <text className="filmstrip__frame-caption" x="0" y="20">{frame.title}</text>}
      <text className="filmstrip__frame-index" x="-59" y="-37">{String(index + 1).padStart(2, "0")}</text>
    </g>
  );
}

export const Filmstrip = forwardRef<FilmstripHandle, FilmstripProps>(function Filmstrip(
  { frames, className = "", label },
  ref,
) {
  const pathRef = useRef<SVGPathElement>(null);
  const filmRef = useRef<SVGGElement>(null);
  const frameRefs = useRef<SVGGElement[]>([]);
  const sprocketRefs = useRef<SVGRectElement[]>([]);

  const updateGeometry = useCallback((progress: number) => {
    const path = pathRef.current;
    const film = filmRef.current;
    if (!path || !film) return;

    const boundedProgress = Math.max(0, Math.min(1, progress));
    const length = path.getTotalLength();
    const tension = boundedProgress * 0.78;
    const scaleX = 1 + tension * 0.07;
    const scaleY = 1 + tension * 0.035;
    film.setAttribute(
      "transform",
      `translate(${500 - 500 * scaleX} ${350 - 350 * scaleY}) scale(${scaleX} ${scaleY})`,
    );

    const frameSpacing = 0.115 + tension * 0.018;
    const frameStart = 0.16 + boundedProgress * 0.13;
    const activeIndex = Math.min(frames.length - 1, Math.floor(boundedProgress * frames.length));

    frameRefs.current.forEach((frame, index) => {
      if (!frame) return;
      const distance = wrapDistance(length * (frameStart + index * frameSpacing), length);
      const point = path.getPointAtLength(distance);
      const angle = angleAt(path, distance, length);
      frame.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
      frame.classList.toggle("is-active", index === activeIndex);
    });

    sprocketRefs.current.forEach((sprocket, index) => {
      if (!sprocket) return;
      const side = index % 2 === 0 ? -1 : 1;
      const sprocketIndex = Math.floor(index / 2);
      const distance = wrapDistance(length * (0.055 + sprocketIndex * (0.89 / (SPROCKET_COUNT - 1))), length);
      const point = path.getPointAtLength(distance);
      const angle = angleAt(path, distance, length);
      const radians = (angle * Math.PI) / 180;
      const normalX = -Math.sin(radians) * side * 45;
      const normalY = Math.cos(radians) * side * 45;
      sprocket.setAttribute("transform", `translate(${point.x + normalX} ${point.y + normalY}) rotate(${angle})`);
    });
  }, [frames.length]);

  useLayoutEffect(() => {
    updateGeometry(0.08);
  }, [updateGeometry]);

  useImperativeHandle(ref, () => ({ setProgress: updateGeometry }), [updateGeometry]);

  return (
    <svg className={`filmstrip ${className}`} viewBox="0 0 1000 700" role="img" aria-label={label}>
      <g ref={filmRef}>
        <path ref={pathRef} className="filmstrip__shadow" d={FILM_PATH} />
        <path className="filmstrip__body" d={FILM_PATH} />
        <path className="filmstrip__edge filmstrip__edge--top" d={FILM_PATH} />
        <path className="filmstrip__edge filmstrip__edge--bottom" d={FILM_PATH} />
        {Array.from({ length: SPROCKET_COUNT * 2 }, (_, index) => (
          <rect
            key={index}
            ref={(element) => {
              if (element) sprocketRefs.current[index] = element;
            }}
            className="filmstrip__sprocket"
            x="-7"
            y="-8"
            width="14"
            height="16"
            rx="2.5"
          />
        ))}
        {frames.map((frame, index) => (
          <FilmFrame
            key={frame.id}
            frame={frame}
            index={index}
            frameRef={(element) => {
              if (element) frameRefs.current[index] = element;
            }}
          />
        ))}
      </g>
    </svg>
  );
});
