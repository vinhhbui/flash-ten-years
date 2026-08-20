import { Link } from "react-router-dom";

type DepthBeatId = "flash10" | "ten-years" | "connected" | "flashback" | "memory";
type DepthObject = "ten" | "ring" | "disc" | "frame" | "star";

interface DepthBeatData {
  id: DepthBeatId;
  title: string;
  label: string;
  object: DepthObject;
  cta?: boolean;
}

const depthBeats: DepthBeatData[] = [
  { id: "flash10", title: "FLASH 10", label: "THE ROAD STARTS HERE", object: "ten" },
  { id: "ten-years", title: "TEN YEARS", label: "2016 — 2026", object: "ring" },
  { id: "connected", title: "CONNECTED", label: "ONE ROAD / MANY FRAMES", object: "disc" },
  { id: "flashback", title: "FLASHBACK", label: "THE ARCHIVE IS MOVING", object: "frame" },
  { id: "memory", title: "MAKE A MEMORY", label: "YOUR NEXT FRAME IS READY", object: "star", cta: true },
];

function DepthBeat({ id, title, label, object, cta }: DepthBeatData) {
  return (
    <section className={`depth-beat depth-beat--${id}`} data-depth-beat={id} aria-label={title}>
      <div className="depth-beat__content">
        <p className="depth-beat__label">{label}</p>
        <h2 className="depth-beat__title">{title}</h2>
        <span className={`depth-beat__object depth-beat__object--${object}`} aria-hidden="true">
          {object === "ten" ? "10" : undefined}
        </span>
        {cta ? (
          <div className="depth-beat__actions">
            <Link className="depth-action depth-action--primary" to="/create">CREATE YOUR MEMORY</Link>
            <Link className="depth-action" to="/wall">VIEW LIVE WALL</Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function DepthWorld() {
  return <div className="depth-world">{depthBeats.map((beat) => <DepthBeat key={beat.id} {...beat} />)}</div>;
}
