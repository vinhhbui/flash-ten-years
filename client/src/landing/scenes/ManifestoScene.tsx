import { KineticText } from "../components/KineticText";
import { SceneStage } from "../components/SceneStage";

export function ManifestoScene() {
  return (
    <SceneStage id="manifesto" className="film-scene--manifesto">
      <p className="scene-kicker manifesto-kicker">THE REEL / A SHARED ARCHIVE</p>
      <KineticText className="manifesto-title" lines={["10 YEARS.", "STILL MOVING."]} dataAttribute="manifesto" />
      <p className="manifesto-copy">Every frame grows bigger when someone carries it forward.</p>
      <span className="manifesto-surface" aria-hidden="true">STORY</span>
      <span className="manifesto-stamp" aria-hidden="true">ROLL<br />ON</span>
      <span className="manifesto-handoff" aria-hidden="true">FRAME<br />TO<br />FRAME</span>
    </SceneStage>
  );
}
