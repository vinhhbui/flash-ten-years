import { useCallback, useEffect, useState } from "react";
import CatSprite from "./CatSprite";
import { getSubmissions, serverUrl } from "../lib/api";
import { wallSocket } from "../lib/socket";
import type { Submission } from "../types/submission";

type WallCat = Submission & { position: { x: number; y: number }; isNew?: boolean };

function safePosition(): { x: number; y: number } {
  return {
    x: Math.max(24, Math.round(Math.random() * Math.max(1, window.innerWidth - 185))),
    y: Math.max(30, Math.round(Math.random() * Math.max(1, window.innerHeight - 205))),
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

export default function LiveWall() {
  const [cats, setCats] = useState<WallCat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const addCat = useCallback(async (submission: Submission, isNew = false) => {
    await preload(submission.image);
    setCats((current) => current.some((cat) => cat.id === submission.id) ? current : [...current, { ...submission, position: safePosition(), isNew }]);
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
    <section className="live-wall">
      <header className="wall-header"><span>FLASH 10</span><h1>MEMORIES, ALIVE</h1><p>{cats.length} memory cats</p></header>
      {isLoading && <p className="wall-status">Loading the wall...</p>}
      {error && <p className="wall-status error">{error}</p>}
      {!isLoading && !error && cats.length === 0 && <p className="wall-status">Your first cat is waiting to come alive.</p>}
      {cats.map((cat) => <CatSprite key={cat.id} submission={cat} position={cat.position} isNew={cat.isNew} />)}
    </section>
  );
}
