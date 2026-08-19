import { gsap } from "gsap";

export function startHopAnimation(element: HTMLElement, origin: { x: number; y: number }) {
  let position = { ...origin };
  let stopped = false;
  let activeTimeline: gsap.core.Timeline | null = null;
  const nextPosition = () => ({
    x: Math.max(30, Math.min(window.innerWidth - 190, position.x + (Math.random() - 0.5) * 220)),
    y: Math.max(45, Math.min(window.innerHeight - 190, position.y + (Math.random() - 0.5) * 140)),
  });
  const hop = () => {
    if (stopped) return;
    const target = nextPosition();
    const arcY = Math.max(20, Math.min(position.y, target.y) - 100);
    activeTimeline = gsap.timeline({ onComplete: () => { position = target; hop(); } });
    activeTimeline
      .to(element, { scaleX: 1.1, scaleY: 0.9, duration: 0.16, ease: "power2.out" })
      .to(element, { x: (position.x + target.x) / 2, y: arcY, scaleX: 0.95, scaleY: 1.08, rotation: (Math.random() - 0.5) * 8, duration: 0.38, ease: "power2.out" })
      .to(element, { x: target.x, y: target.y, scaleX: 1.15, scaleY: 0.85, rotation: 0, duration: 0.32, ease: "power2.in" })
      .to(element, { scaleX: 1, scaleY: 1, duration: 0.16, ease: "back.out(2)" })
      .to({}, { duration: 1.1 + Math.random() * 1.2 });
  };
  hop();
  return {
    kill: () => {
      stopped = true;
      activeTimeline?.kill();
    },
  };
}
