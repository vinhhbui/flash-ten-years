import { Link } from "react-router-dom";

export function LandingHeader() {
  return (
    <header className="film-nav" aria-label="FLASH 10 navigation">
      <Link className="film-nav__brand" to="/" aria-label="FLASH 10 home">
        FLASH <span>10</span>
      </Link>
      <nav className="film-nav__links" aria-label="Landing sections">
        <a href="#timeline">10 YEARS</a>
        <a href="#memory-cat">MEMORY CAT</a>
        <a href="#final">THE END</a>
      </nav>
      <Link className="film-nav__action" to="/create">CREATE</Link>
    </header>
  );
}
