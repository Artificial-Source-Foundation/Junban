import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const vadMocks = vi.hoisted(() => ({
  micVADNew: vi.fn(),
}));

vi.mock("@ricky0123/vad-web", () => ({
  MicVAD: {
    new: vadMocks.micVADNew,
  },
}));

vi.mock("../../../src/ai/voice/audio-utils.js", () => ({
  float32ToWav: vi.fn(() => new Blob(["wav"], { type: "audio/wav" })),
}));

import { useVAD } from "../../../src/ui/hooks/useVAD.js";

interface MockVAD {
  start: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function createMockVAD(): MockVAD {
  return {
    start: vi.fn(),
    pause: vi.fn(),
    destroy: vi.fn(),
  };
}

describe("useVAD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("destroys a MicVAD instance that resolves after VAD is disabled", async () => {
    const onSpeechStart = vi.fn();
    const deferred = createDeferred<MockVAD>();
    const vad = createMockVAD();
    vadMocks.micVADNew.mockReturnValueOnce(deferred.promise);

    const { rerender } = renderHook(({ enabled }) => useVAD({ enabled, onSpeechStart }), {
      initialProps: { enabled: true },
    });

    await waitFor(() => expect(vadMocks.micVADNew).toHaveBeenCalledTimes(1));
    const options = vadMocks.micVADNew.mock.calls[0][0] as { onSpeechStart: () => void };

    rerender({ enabled: false });

    await act(async () => {
      deferred.resolve(vad);
      await deferred.promise;
      await Promise.resolve();
    });

    expect(vad.start).not.toHaveBeenCalled();
    expect(vad.pause).toHaveBeenCalledTimes(1);
    expect(vad.destroy).toHaveBeenCalledTimes(1);

    options.onSpeechStart();
    expect(onSpeechStart).not.toHaveBeenCalled();
  });

  it("starts a fresh MicVAD when re-enabled while the first start is pending", async () => {
    const onSpeechStart = vi.fn();
    const firstDeferred = createDeferred<MockVAD>();
    const secondDeferred = createDeferred<MockVAD>();
    const firstVad = createMockVAD();
    const secondVad = createMockVAD();
    vadMocks.micVADNew
      .mockReturnValueOnce(firstDeferred.promise)
      .mockReturnValueOnce(secondDeferred.promise);

    const { rerender, result } = renderHook(({ enabled }) => useVAD({ enabled, onSpeechStart }), {
      initialProps: { enabled: true },
    });

    await waitFor(() => expect(vadMocks.micVADNew).toHaveBeenCalledTimes(1));
    const firstOptions = vadMocks.micVADNew.mock.calls[0][0] as { onSpeechStart: () => void };

    rerender({ enabled: false });
    rerender({ enabled: true });

    await waitFor(() => expect(vadMocks.micVADNew).toHaveBeenCalledTimes(2));
    const secondOptions = vadMocks.micVADNew.mock.calls[1][0] as { onSpeechStart: () => void };

    await act(async () => {
      secondDeferred.resolve(secondVad);
      await secondDeferred.promise;
      await Promise.resolve();
    });

    expect(secondVad.start).toHaveBeenCalledTimes(1);
    expect(secondVad.pause).not.toHaveBeenCalled();
    expect(secondVad.destroy).not.toHaveBeenCalled();
    expect(result.current.isListening).toBe(true);

    await act(async () => {
      firstDeferred.resolve(firstVad);
      await firstDeferred.promise;
      await Promise.resolve();
    });

    expect(firstVad.start).not.toHaveBeenCalled();
    expect(firstVad.pause).toHaveBeenCalledTimes(1);
    expect(firstVad.destroy).toHaveBeenCalledTimes(1);
    expect(secondVad.pause).not.toHaveBeenCalled();
    expect(secondVad.destroy).not.toHaveBeenCalled();

    firstOptions.onSpeechStart();
    expect(onSpeechStart).not.toHaveBeenCalled();

    await act(async () => {
      secondOptions.onSpeechStart();
      await Promise.resolve();
    });
    expect(onSpeechStart).toHaveBeenCalledTimes(1);
  });

  it("destroys a MicVAD instance that resolves after unmount", async () => {
    const deferred = createDeferred<MockVAD>();
    const vad = createMockVAD();
    vadMocks.micVADNew.mockReturnValueOnce(deferred.promise);

    const { unmount } = renderHook(() => useVAD({ enabled: true }));

    await waitFor(() => expect(vadMocks.micVADNew).toHaveBeenCalledTimes(1));
    unmount();

    await act(async () => {
      deferred.resolve(vad);
      await deferred.promise;
      await Promise.resolve();
    });

    expect(vad.start).not.toHaveBeenCalled();
    expect(vad.pause).toHaveBeenCalledTimes(1);
    expect(vad.destroy).toHaveBeenCalledTimes(1);
  });
});
