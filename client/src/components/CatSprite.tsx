import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { startFloatAnimation } from "../animations/floatAnimation";
import { startHopAnimation } from "../animations/hopAnimation";
import { serverUrl } from "../lib/api";
import type { Submission } from "../types/submission";

interface CatSpriteProps {
  submission: Submission;
  position: { x: number; y: number };
  isNew?: boolean;
}

export default function CatSprite({ submission, position, isNew = false }: CatSpriteProps) {
  const spriteRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = spriteRef.current;
    if (!element) return;
    let loop: { kill: () => void } | null = null;
    const startLoop = () => {
      loop = submission.animation === "float" ? startFloatAnimation(element, position) : startHopAnimation(element, position);
    };
    const entrance = gsap.timeline();
    gsap.set(element, { x: position.x, y: position.y, transformOrigin: "50% 50%" });
    if (isNew) {
      entrance
        .fromTo(element, { scale: 0 }, { scale: 1.14, duration: 0.28, ease: "back.out(2.2)" })
        .to(element, { scale: 1, duration: 0.16 })
        .add(startLoop);
    } else {
      startLoop();
    }
    return () => { entrance.kill(); loop?.kill(); };
  }, [isNew, position, submission.animation]);

  const imageUrl = submission.image.startsWith("http") ? submission.image : `${serverUrl}${submission.image}`;
  return (
    <div ref={spriteRef} className={`cat-sprite ${isNew ? "new-sprite" : ""}`} aria-label={`${submission.name ?? "Guest"}'s memory cat`}>
      <img src={imageUrl} alt="Decorated memory cat" draggable={false} />
      {isNew && <span className="new-memory">NEW MEMORY!</span>}
    </div>
  );
}
