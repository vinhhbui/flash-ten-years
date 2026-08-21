import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { gsap } from "gsap";
import { serverUrl } from "../lib/api";
import type { Submission } from "../types/submission";
import { resolveWallVisual } from "../visuals/resolveWallVisual";

interface ArtworkSpriteProps {
  submission: Submission;
  position: { x: number; y: number };
  viewportWidth?: number;
  viewportHeight?: number;
  isNew?: boolean;
}

export default function ArtworkSprite({
  submission,
  position,
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
  isNew = false,
}: ArtworkSpriteProps) {
  const spriteRef = useRef<HTMLDivElement>(null);
  const { frame, animation } = resolveWallVisual(submission);

  useLayoutEffect(() => {
    const element = spriteRef.current;
    if (!element) return undefined;
    let stopAnimation: (() => void) | undefined;
    const startAnimation = () => {
      stopAnimation = animation.run({
        element,
        origin: position,
        viewportWidth,
        viewportHeight,
      });
    };
    const entrance = gsap.timeline();
    gsap.set(element, { x: position.x, y: position.y, transformOrigin: "50% 50%" });
    if (isNew) {
      entrance
        .fromTo(element, { scale: 0 }, { scale: 1.14, duration: 0.28, ease: "back.out(2.2)" })
        .to(element, { scale: 1, duration: 0.16 })
        .call(startAnimation);
    } else {
      startAnimation();
    }
    return () => {
      entrance.kill();
      stopAnimation?.();
    };
  }, [animation, isNew, position, viewportHeight, viewportWidth]);

  const imageUrl = submission.image.startsWith("http") ? submission.image : `${serverUrl}${submission.image}`;
  const frameStyle = {
    width: `clamp(120px, 13vw, ${frame.defaultWidth}px)`,
    aspectRatio: String(frame.aspectRatio),
  } satisfies CSSProperties;
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
      ref={spriteRef}
      className={`cat-sprite artwork-sprite ${isNew ? "new-sprite" : ""}`}
      style={frameStyle}
      aria-label={`${submission.name ?? "Guest"}'s memory cat`}
    >
      <img
        className="artwork-sprite__artwork"
        style={artworkStyle}
        src={imageUrl}
        alt="Decorated memory cat"
        draggable={false}
      />
      {frame.overlayAsset && <img className="artwork-sprite__overlay" src={frame.overlayAsset} alt="" aria-hidden="true" />}
      {isNew && <span className="new-memory">NEW MEMORY!</span>}
    </div>
  );
}
