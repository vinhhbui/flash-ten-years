import RectangleScrollTest from "../rectangle-test/RectangleScrollTest";
import "./landing-page.css";

type LandingPageProps = {
  isActive: boolean;
  standalone?: boolean;
};

export default function LandingPage({
  isActive,
  standalone = false,
}: LandingPageProps) {
  return (
    <section
      className={`landing-page${standalone ? " landing-page--standalone" : ""}`}
      aria-label="Landing page"
      aria-hidden={!isActive}
      inert={isActive ? undefined : true}
    >
      <div className="landing-page__film">
        <RectangleScrollTest embedded isActive={isActive} />
      </div>
      <section className="landing-page__blank" aria-hidden="true" />
    </section>
  );
}
