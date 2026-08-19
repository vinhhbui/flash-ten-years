import type { AnimationType, Submission } from "../types/submission";

export const serverUrl = import.meta.env.VITE_SERVER_URL ?? `${window.location.protocol}//${window.location.hostname}:3001`;

export async function getSubmissions(): Promise<Submission[]> {
  const response = await fetch(`${serverUrl}/api/submissions`);
  if (!response.ok) throw new Error("Could not load memories.");
  return response.json() as Promise<Submission[]>;
}

export async function submitArtwork(input: {
  imageData: string;
  name?: string;
  animation: AnimationType;
}): Promise<Submission> {
  const response = await fetch(`${serverUrl}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Your cat could not be submitted.");
  }

  return response.json() as Promise<Submission>;
}
