import crypto from "node:crypto";
import { appendSubmission, removeSavedImage, saveImage } from "./storage.js";
import type { AnimationType, Submission, SubmissionSource } from "./types.js";

export interface CreateSubmissionInput {
  image: Buffer;
  animation: AnimationType;
  idPrefix: string;
  name?: string;
  frameId?: string;
  source?: SubmissionSource;
  sourceHash?: string;
  originalFileName?: string;
}

export interface SubmissionService {
  createSubmission(input: CreateSubmissionInput): Promise<Submission>;
}

export function createSubmissionService(
  broadcastNewArtwork: (submission: Submission) => void,
): SubmissionService {
  return {
    async createSubmission(input) {
      const id = `${input.idPrefix}_${crypto.randomUUID()}`;
      const submission: Submission = {
        id,
        ...(input.name ? { name: input.name } : {}),
        image: await saveImage(id, input.image),
        animation: input.animation,
        ...(input.frameId ? { frameId: input.frameId } : {}),
        createdAt: new Date().toISOString(),
        ...(input.source ? { source: input.source } : {}),
        ...(input.sourceHash ? { sourceHash: input.sourceHash } : {}),
        ...(input.originalFileName ? { originalFileName: input.originalFileName } : {}),
      };

      try {
        await appendSubmission(submission);
      } catch (error) {
        await removeSavedImage(id).catch(() => undefined);
        throw error;
      }

      broadcastNewArtwork(submission);
      return submission;
    },
  };
}
