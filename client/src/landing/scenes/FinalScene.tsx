import { Link } from "react-router-dom";
import { SceneStage } from "../components/SceneStage";

export function FinalScene() {
  return (
    <SceneStage id="final" className="film-scene--final">
      <p className="scene-kicker final-kicker">FLASH 10 / KEEP ROLLING</p>
      <h2 className="final-title">MAKE THE<br />NEXT FRAME.</h2>
      <p className="final-copy">Your memory is ready to become part of the living film.</p>
      <div className="final-actions">
        <Link className="final-action final-action--primary" to="/create">CREATE YOUR MEMORY</Link>
        <Link className="final-action final-action--secondary" to="/wall">VIEW LIVE WALL</Link>
      </div>
      <p className="final-credit">FLASH 10 / TEMPORARY LANDING ART DIRECTION</p>
    </SceneStage>
  );
}
