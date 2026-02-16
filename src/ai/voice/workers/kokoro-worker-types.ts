/**
 * Shared types for the Kokoro TTS Web Worker message protocol.
 */

export type KokoroWorkerRequest =
  | { type: "load"; modelId: string }
  | { type: "synthesize"; id: string; text: string; voice: string };

export type KokoroWorkerResponse =
  | { type: "load-progress"; progress: number }
  | { type: "load-complete" }
  | { type: "load-error"; error: string }
  | { type: "synthesize-complete"; id: string; buffer: ArrayBuffer }
  | { type: "synthesize-error"; id: string; error: string };
