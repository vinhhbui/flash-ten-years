import { MediaCard } from "../components/MediaCard";

export function MediaScene() {
  // DECOR-LATER: replace these geometric media cards with final FLASH 10 photography.
  return (
    <section className="landing-composition media-composition" data-composition="media">
      <p className="scene-kicker media-kicker">THE FLOATING ARCHIVE / PLACEHOLDER MEDIA</p>
      <h2 className="media-title">MORE THAN<br />A MOMENT.</h2>
      <p className="media-copy">The road carries fragments from every direction, never in a grid.</p>
      <span className="media-background-word" aria-hidden="true">PLAY</span>
      <MediaCard className="media-card--one" depth="far" index="01" label="FIRST LIGHT" />
      <MediaCard className="media-card--two" depth="mid" index="02" label="SIDE STORY" />
      <MediaCard className="media-card--three" depth="near" index="03" label="LOUD COLORS" />
      <MediaCard className="media-card--four" depth="far" index="04" label="TOGETHER" />
      <MediaCard className="media-card--five" depth="mid" index="05" label="STILL HERE" />
      <MediaCard className="media-card--six" depth="near" index="06" label="ONE MORE" />
      <span className="media-transfer-token" aria-hidden="true">10</span>
    </section>
  );
}
