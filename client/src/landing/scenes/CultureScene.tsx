import { MediaCard } from "../components/MediaCard";
import { SceneStage } from "../components/SceneStage";

export function CultureScene() {
  // DECOR-LATER: replace these temporary culture cards with approved event memories.
  return (
    <SceneStage id="culture" className="film-scene--culture">
      <p className="scene-kicker culture-kicker">CULTURE / PEOPLE / MEMORY</p>
      <h2 className="culture-title">KEEP<br />THE LIGHT.</h2>
      <p className="culture-copy">Temporary photo cards make room for the people who will carry the final FLASH archive.</p>
      <MediaCard className="culture-card culture-card--one" index="A" label="MORNING SHIFT" />
      <MediaCard className="culture-card culture-card--two" index="B" label="THE BIG CHEER" />
      <MediaCard className="culture-card culture-card--three" index="C" label="ANOTHER MEMORY" />
      <span className="culture-foreground" aria-hidden="true">MEMORY</span>
      <span className="culture-final-handoff" aria-hidden="true">NEXT<br />FRAME</span>
    </SceneStage>
  );
}
