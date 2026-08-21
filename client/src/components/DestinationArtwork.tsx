import { useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { serverUrl } from "../lib/api";
import type { Submission } from "../types/submission";
import { resolveWallVisual } from "../visuals/resolveWallVisual";

interface DestinationArtworkProps {
  submission: Submission;
  index: number;
  isNew?: boolean;
}

interface DestinationPlacement {
  x: number;
  y: number;
  width: number;
  rotation: number;
  driftX: number;
  driftY: number;
  idleRotation: number;
  duration: number;
  delay: number;
  entryX: number;
  entryY: number;
  zIndex: number;
}

type DestinationStyle = CSSProperties & Record<`--destination-${string}`, string | number>;

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function resolvePlacement(id: string, index: number): DestinationPlacement {
  const hash = hashString(id);
  const column = index % 7;
  const row = Math.floor(index / 7) % 4;
  const layer = Math.floor(index / 28);
  const jitterX = ((hash & 255) / 255 - 0.5) * 3.6;
  const jitterY = (((hash >>> 8) & 255) / 255 - 0.5) * 3.4;

  return {
    x: 7.5 + column * 14.15 + jitterX + (layer % 2 === 0 ? -0.8 : 0.8),
    y: 15 + row * 22.5 + jitterY + (column % 2 === 0 ? 0 : 2.2),
    width: 7.2 + ((hash >>> 16) % 28) / 10,
    rotation: -5 + ((hash >>> 20) % 101) / 10,
    driftX: 1.5 + ((hash >>> 5) % 25) / 10,
    driftY: 2 + ((hash >>> 10) % 31) / 10,
    idleRotation: 0.5 + ((hash >>> 15) % 15) / 10,
    duration: 4.8 + ((hash >>> 18) % 35) / 10,
    delay: -((hash >>> 21) % 40) / 10,
    entryX: (hash % 2 === 0 ? -1 : 1) * (90 + ((hash >>> 9) % 170)),
    entryY: -80 - ((hash >>> 14) % 140),
    zIndex: 3 + (hash % 9),
  };
}

export default function DestinationArtwork({ submission, index, isNew = false }: DestinationArtworkProps) {
  const artworkRef = useRef<HTMLDivElement>(null);
  const placement = useMemo(() => resolvePlacement(submission.id, index), [index, submission.id]);
  const { frame } = resolveWallVisual(submission);

  useLayoutEffect(() => {
    const element = artworkRef.current;
    if (!element) return undefined;

    gsap.set(element, {
      xPercent: -50,
      yPercent: -50,
      rotation: placement.rotation,
      scale: 1,
      opacity: 1,
      transformOrigin: "50% 60%",
    });

    if (!isNew) return undefined;

    const entrance = gsap.timeline();
    entrance
      .fromTo(element, {
        x: placement.entryX,
        y: placement.entryY,
        scale: 3.2,
        rotation: placement.rotation + (placement.entryX < 0 ? -9 : 9),
        opacity: 0,
      }, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: placement.rotation,
        opacity: 1,
        duration: 0.82,
        ease: "power3.out",
      })
      .to(element, { scale: 0.94, duration: 0.09, ease: "power2.in" })
      .to(element, { scale: 1, duration: 0.16, ease: "back.out(2.4)" });

    return () => entrance.kill();
  }, [isNew, placement]);

  const imageUrl = submission.image.startsWith("http") ? submission.image : `${serverUrl}${submission.image}`;
  const placementStyle = {
    left: `${placement.x}%`,
    top: `${placement.y}%`,
    zIndex: placement.zIndex,
    "--destination-memory-width": `${placement.width}%`,
    "--destination-drift-x": `${placement.driftX}px`,
    "--destination-drift-y": `${placement.driftY}px`,
    "--destination-idle-rotation": `${placement.idleRotation}deg`,
    "--destination-idle-duration": `${placement.duration}s`,
    "--destination-idle-delay": `${placement.delay}s`,
  } satisfies DestinationStyle;
  const frameStyle = { aspectRatio: String(frame.aspectRatio) } satisfies CSSProperties;
  const artworkStyle = frame.artworkInset
    ? {
      left: `${frame.artworkInset.x}%`,
      top: `${frame.artworkInset.y}%`,
      width: `${frame.artworkInset.width}%`,
      height: `${frame.artworkInset.height}%`,
    } satisfies CSSProperties
    : undefined;

  return (
    <div
      ref={artworkRef}
      className={`destination-memory${isNew ? " is-new" : ""}`}
      style={placementStyle}
      aria-label={`${submission.name ?? "Guest"}'s memory`}
    >
      <div className="destination-memory__idle" style={frameStyle}>
        <img
          className={`destination-memory__artwork${frame.artworkInset ? " has-inset" : ""}`}
          style={artworkStyle}
          src={imageUrl}
          alt="Submitted FLASH 10 memory"
          draggable={false}
        />
        {frame.overlayAsset && <img className="destination-memory__overlay" src={frame.overlayAsset} alt="" aria-hidden="true" />}
      </div>
      {isNew && <span className="destination-memory__new">NEW ARRIVAL</span>}
    </div>
  );
}
