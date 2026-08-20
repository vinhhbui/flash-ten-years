import { SceneStage } from "../components/SceneStage";

export function TakeoverScene() {
  return (
    <SceneStage id="takeover" className="film-scene--takeover">
      <p className="scene-kicker takeover-kicker">A MARK THAT FILLS THE ROOM</p>
      <span className="takeover-number" aria-hidden="true">10</span>
      <h2 className="takeover-title">MAKE<br />IT FLASH.</h2>
      <p className="takeover-copy">One mark becomes a whole field. The active frame comes through the middle.</p>
      <span className="takeover-sweep" aria-hidden="true" />
      <span className="takeover-token" aria-hidden="true">ROLL</span>
    </SceneStage>
  );
}
