import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ArtworkSprite from "./ArtworkSprite";
import { getSubmissions, serverUrl } from "../lib/api";
import { wallSocket } from "../lib/socket";
import type { Submission } from "../types/submission";

type WallCat = Submission & { position: { x: number; y: number }; isNew?: boolean };

interface LiveWallProps {
  variant?: "page" | "embedded";
}

interface WallBounds {
  width: number;
  height: number;
}

function safePosition({ width, height }: WallBounds): { x: number; y: number } {
  const minimumX = 24;
  const minimumY = Math.min(120, Math.max(30, height * 0.18));
  const maximumX = Math.max(minimumX, width - 185);
  const maximumY = Math.max(minimumY, height - 205);

  return {
    x: Math.round(minimumX + Math.random() * (maximumX - minimumX)),
    y: Math.round(minimumY + Math.random() * (maximumY - minimumY)),
  };
}

function preload(image: string) {
  return new Promise<void>((resolve) => {
    const loaded = new Image();
    loaded.onload = () => resolve();
    loaded.onerror = () => resolve();
    loaded.src = image.startsWith("http") ? image : `${serverUrl}${image}`;
  });
}

export default function LiveWall({ variant = "page" }: LiveWallProps) {
  const wallRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<WallBounds>({ width: window.innerWidth, height: window.innerHeight });
  const [bounds, setBounds] = useState<WallBounds>(boundsRef.current);
  const [cats, setCats] = useState<WallCat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const addCat = useCallback(async (submission: Submission, isNew = false) => {
    await preload(submission.image);
    setCats((current) => current.some((cat) => cat.id === submission.id) ? current : [...current, { ...submission, position: safePosition(boundsRef.current), isNew }]);
  }, []);

  useLayoutEffect(() => {
    const wall = wallRef.current;
    if (!wall) return undefined;

    const updateBounds = () => {
      const nextBounds = { width: wall.clientWidth, height: wall.clientHeight };
      if (!nextBounds.width || !nextBounds.height) return;
      boundsRef.current = nextBounds;
      setBounds(nextBounds);
    };
    const observer = new ResizeObserver(updateBounds);
    observer.observe(wall);
    updateBounds();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    getSubmissions()
      .then(async (submissions) => { for (const submission of submissions) await addCat(submission); })
      .catch(() => active && setError("The wall cannot reach the server yet."))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [addCat]);

  useEffect(() => {
    const receive = (submission: Submission) => void addCat(submission, true);
    wallSocket.connect();
    wallSocket.on("new_artwork", receive);
    return () => { wallSocket.off("new_artwork", receive); wallSocket.disconnect(); };
  }, [addCat]);

  return (
    <div ref={wallRef} className={`live-wall live-wall--${variant}`}>
      <header className="wall-header"><span>FLASH 10</span><h1>MEMORIES, ALIVE</h1><p>{cats.length} memory cats</p></header>
      {isLoading && <p className="wall-status">Loading the wall...</p>}
      {error && <p className="wall-status error">{error}</p>}
      {!isLoading && !error && cats.length === 0 && <p className="wall-status">Your first cat is waiting to come alive.</p>}
      {cats.map((cat) => (
        <ArtworkSprite
          key={cat.id}
          submission={cat}
          position={cat.position}
          viewportWidth={bounds.width}
          viewportHeight={bounds.height}
          isNew={cat.isNew}
        />
      ))}
    </div>
  );
}
