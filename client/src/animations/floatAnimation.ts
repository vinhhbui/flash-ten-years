import { gsap } from "gsap";

export function startFloatAnimation(element: HTMLElement, origin: { x: number; y: number }) {
  const drift = () => Math.round((Math.random() - 0.5) * 40);
  const timeline = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
  timeline
    .to(element, { x: origin.x + drift(), y: origin.y - 13, rotation: 3, duration: 2.8 })
    .to(element, { x: origin.x + drift(), y: origin.y + 12, rotation: -3, duration: 3.1 });
  return timeline;
}
