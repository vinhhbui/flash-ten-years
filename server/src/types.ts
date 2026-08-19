export type AnimationType = "float" | "hop";

export interface Submission {
  id: string;
  name?: string;
  image: string;
  animation: AnimationType;
  createdAt: string;
}

export interface SubmissionInput {
  imageData?: unknown;
  name?: unknown;
  animation?: unknown;
}
