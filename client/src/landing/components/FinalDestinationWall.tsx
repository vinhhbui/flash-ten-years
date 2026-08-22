import LiveWall from "../../components/LiveWall";
import "./finalDestinationWall.css";

export function FinalDestinationWall() {
  return (
    <section
      className="final-destination-wall"
      data-destination-wall
      aria-label="FLASH 10 final memory wall"
    >
      <div className="final-destination-wall__surface">
        <div className="final-destination-wall__plaque" aria-hidden="true">
          FLASH 10 / FINAL MEMORY WALL
        </div>

        <LiveWall variant="destination" />

        <div className="final-destination-wall__caption" aria-hidden="true">
          <span>10 YEARS / ONE LIVING ARCHIVE</span>
          <span>THE ROAD ENDS HERE</span>
        </div>
      </div>

      <div className="final-destination-wall__base" aria-hidden="true" />
    </section>
  );
}
