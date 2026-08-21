export type AnimationType = string;

export type SubmissionSource = "digital" | "scanner";

export interface Submission {
  id: string;
  name?: string;
  image: string;
  animation: AnimationType;
  frameId?: string;
  createdAt: string;
  source?: SubmissionSource;
  sourceHash?: string;
  originalFileName?: string;
}
