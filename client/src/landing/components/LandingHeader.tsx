import { Link } from "react-router-dom";

export function LandingHeader() {
  return (
    <header className="film-road-nav" aria-label="FLASH 10 navigation">
      <Link className="film-road-nav__brand" to="/" aria-label="FLASH 10 home">
        FLASH <span>10</span>
      </Link>
      <nav className="film-road-nav__links" aria-label="Landing stages">
        <a href="#experience">10 STORIES</a>
        <a href="#live-wall">LIVE WALL</a>
      </nav>
    </header>
  );
}
