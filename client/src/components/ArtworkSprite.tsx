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
  motion?: "free" | "pinned";
}

export default function ArtworkSprite({
  submission,
  position,
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
  isNew = false,
  motion = "free",
}: ArtworkSpriteProps) {
  const spriteRef = useRef<HTMLDivElement>(null);
  const { frame, animation } = resolveWallVisual(submission);

  useLayoutEffect(() => {
    const element = spriteRef.current;
    if (!element) return undefined;
    let stopAnimation: (() => void) | undefined;

    const startAnimation = () => {
      if (motion === "pinned") {
        const idle = gsap.timeline({ repeat: -1, yoyo: true });
        idle.to(element, {
          y: position.y - 4,
          rotation: 1.2,
          duration: 3.4,
          ease: "sine.inOut",
        });
        stopAnimation = () => idle.kill();
        return;
      }

      stopAnimation = animation.run({
        element,
        origin: position,
        viewportWidth,
        viewportHeight,
      });
    };

    const entrance = gsap.timeline();
    gsap.set(element, { x: position.x, y: position.y, transformOrigin: "50% 50%" });

    if (isNew && motion === "pinned") {
      entrance
        .fromTo(
          element,
          { scale: 1.7, opacity: 0.15, filter: "blur(6px)" },
          { scale: 1.06, opacity: 1, filter: "blur(0px)", duration: 0.52, ease: "power3.out" },
        )
        .to(element, { scale: 1, duration: 0.18, ease: "back.out(2)" })
        .call(startAnimation);
    } else if (isNew) {
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
  }, [animation, isNew, motion, position, viewportHeight, viewportWidth]);

  const imageUrl = submission.image.startsWith("http") ? submission.image : `${serverUrl}${submission.image}`;
  const pinnedWidth = Math.min(frame.defaultWidth, 180);
  const frameStyle = {
    width: motion === "pinned"
      ? `clamp(82px, 10vw, ${pinnedWidth}px)`
      : `clamp(120px, 13vw, ${frame.defaultWidth}px)`,
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
      className={`cat-sprite artwork-sprite artwork-sprite--${motion} ${isNew ? "new-sprite" : ""}`}
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
