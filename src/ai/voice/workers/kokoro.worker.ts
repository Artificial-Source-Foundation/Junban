/// <reference lib="webworker" />

/**
 * Kokoro TTS Web Worker.
 * Runs ONNX WASM inference off the main thread to prevent UI freezes.
 */

import { float32ToWav } from "../audio-utils.js";
import type { KokoroWorkerRequest, KokoroWorkerResponse } from "./kokoro-worker-types.js";

const ctx = self as unknown as DedicatedWorkerGlobalScope;

/** Minimal interface for the KokoroTTS instance used in this worker. */
interface KokoroTTSInstance {
  generate(
    text: string,
    options: { voice: string },
  ): Promise<{
    audio?: Float32Array;
    data?: Float32Array;
    sampling_rate?: number;
    samplingRate?: number;
  }>;
}

let ttsInstance: KokoroTTSInstance | null = null;

function post(msg: KokoroWorkerResponse, transfer?: Transferable[]) {
  ctx.postMessage(msg, { transfer: transfer ?? [] });
}

ctx.addEventListener("message", async (e: MessageEvent<KokoroWorkerRequest>) => {
  const msg = e.data;

  if (msg.type === "load") {
    try {
      const { KokoroTTS } = await import("kokoro-js");
      ttsInstance = (await KokoroTTS.from_pretrained(msg.modelId, {
        device: "wasm",
        progress_callback: (event: { status: string; progress?: number }) => {
          if (event.status === "progress" && typeof event.progress === "number") {
            post({ type: "load-progress", progress: Math.round(event.progress) });
          }
        },
      })) as unknown as KokoroTTSInstance;
      post({ type: "load-complete" });
    } catch (err) {
      ttsInstance = null;
      post({ type: "load-error", error: err instanceof Error ? err.message : String(err) });
    }
  }

  if (msg.type === "synthesize") {
    try {
      if (!ttsInstance) {
        throw new Error("Model not loaded");
      }
      const result = await ttsInstance.generate(msg.text, { voice: msg.voice });
      const samples = result.audio ?? result.data;
      if (!samples) throw new Error("No audio data in result");
      const sampleRate = result.sampling_rate ?? result.samplingRate ?? 24000;

      const wavBlob = float32ToWav(samples, sampleRate);
      const buffer = await wavBlob.arrayBuffer();

      post({ type: "synthesize-complete", id: msg.id, buffer }, [buffer]);
    } catch (err) {
      post({
        type: "synthesize-error",
        id: msg.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
});
