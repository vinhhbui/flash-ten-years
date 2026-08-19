import { gsap } from "gsap";
import type { WallAnimationDefinition } from "./animationRegistry";

export const floatAnimation: WallAnimationDefinition = {
  id: "float",
  label: "Float",
  enabledForScanner: true,
  run({ element, origin, random = Math.random }) {
    const drift = () => Math.round((random() - 0.5) * 40);
    const timeline = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
    timeline
      .to(element, { x: origin.x + drift(), y: origin.y - 13, rotation: 3, duration: 2.8 })
      .to(element, { x: origin.x + drift(), y: origin.y + 12, rotation: -3, duration: 3.1 });
    return () => timeline.kill();
  },
};
