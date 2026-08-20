import { FloatingObject } from "../components/FloatingObject";
import { KineticText } from "../components/KineticText";

export function HeroScene() {
  return (
    <section className="landing-composition hero-composition" data-composition="hero">
      <div className="scene-grid" aria-hidden="true" />
      <p className="scene-kicker hero-kicker">FLASH 10 / 2016 — 2026</p>
      <KineticText as="h1" className="hero-title" lines={["FLASH", "10"]} dataAttribute="hero" />
      <p className="hero-manifesto">TEN YEARS. ONE STORY STILL MOVING.</p>
      <p className="hero-scroll-cue">SCROLL TO FEED THE FILM</p>
      <span className="hero-portal" aria-hidden="true">10</span>
      <FloatingObject className="floating-object--star hero-object hero-object--star" />
      <FloatingObject className="floating-object--bolt hero-object hero-object--bolt" />
      <FloatingObject className="floating-object--disc hero-object hero-object--disc" />
      <FloatingObject className="floating-object--frame hero-object hero-object--frame" />
      <FloatingObject className="floating-object--label hero-object hero-object--label" label="A FLASH 10 memory label" />
    </section>
  );
}
