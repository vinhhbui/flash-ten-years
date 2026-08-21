import type { Submission } from "../types/submission";

export const serverUrl = import.meta.env.VITE_SERVER_URL ?? `${window.location.protocol}//${window.location.hostname}:3001`;

export async function getSubmissions(): Promise<Submission[]> {
  const response = await fetch(`${serverUrl}/api/submissions`);
  if (!response.ok) throw new Error("Could not load memories.");
  return response.json() as Promise<Submission[]>;
}
