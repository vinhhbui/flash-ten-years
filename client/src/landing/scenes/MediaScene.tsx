import { MediaCard } from "../components/MediaCard";
import { SceneStage } from "../components/SceneStage";

export function MediaScene() {
  // DECOR-LATER: replace these geometric media cards with final FLASH 10 photography.
  return (
    <SceneStage id="media" className="film-scene--media">
      <p className="scene-kicker media-kicker">THE FLOATING ARCHIVE / PLACEHOLDER MEDIA</p>
      <h2 className="media-title">MORE THAN<br />A MOMENT.</h2>
      <p className="media-copy">The road carries fragments from every direction, never in a grid.</p>
      <span className="media-background-word" aria-hidden="true">PLAY</span>
      <MediaCard className="media-card--one" index="01" label="FIRST LIGHT" />
      <MediaCard className="media-card--two" index="02" label="SIDE STORY" />
      <MediaCard className="media-card--three" index="03" label="LOUD COLORS" />
      <MediaCard className="media-card--four" index="04" label="TOGETHER" />
      <span className="media-transfer-token" aria-hidden="true">10</span>
    </SceneStage>
  );
}
