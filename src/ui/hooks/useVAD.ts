/**
 * React hook wrapping @ricky0123/vad-web for voice activity detection.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { float32ToWav } from "../../ai/voice/audio-utils.js";

interface UseVADProps {
  onSpeechStart?: () => void;
  onSpeechEnd?: (audio: Blob) => void;
  enabled: boolean;
  deviceId?: string;
}

interface UseVADReturn {
  isListening: boolean;
  isSpeaking: boolean;
  start: () => Promise<void>;
  stop: () => void;
  isSupported: boolean;
}

export function useVAD({ onSpeechStart, onSpeechEnd, enabled, deviceId }: UseVADProps): UseVADReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const vadRef = useRef<any>(null);
  const onSpeechStartRef = useRef(onSpeechStart);
  const onSpeechEndRef = useRef(onSpeechEnd);

  // Keep callback refs up to date
  onSpeechStartRef.current = onSpeechStart;
  onSpeechEndRef.current = onSpeechEnd;

  const deviceIdRef = useRef(deviceId);
  deviceIdRef.current = deviceId;

  const start = useCallback(async () => {
    if (vadRef.current) return;

    try {
      console.log("[VAD] Loading @ricky0123/vad-web...");
      const { MicVAD } = await import("@ricky0123/vad-web");
      const vadOptions: any = {
        onSpeechStart: () => {
          console.log("[VAD] Speech started");
          setIsSpeaking(true);
          onSpeechStartRef.current?.();
        },
        onSpeechEnd: (audio: Float32Array) => {
          console.log("[VAD] Speech ended, audio samples:", audio.length);
          setIsSpeaking(false);
          const wavBlob = float32ToWav(audio, 16000);
          onSpeechEndRef.current?.(wavBlob);
        },
      };
      if (deviceIdRef.current) {
        vadOptions.additionalAudioConstraints = {
          deviceId: { exact: deviceIdRef.current },
        };
      }
      const vad = await MicVAD.new(vadOptions);

      vadRef.current = vad;
      vad.start();
      setIsListening(true);
      console.log("[VAD] Started successfully");
    } catch (err) {
      console.warn("[VAD] Failed to initialize:", err);
      setIsSupported(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (vadRef.current) {
      vadRef.current.pause();
      vadRef.current.destroy();
      vadRef.current = null;
    }
    setIsListening(false);
    setIsSpeaking(false);
  }, []);

  // Auto-start/stop when enabled changes
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  return { isListening, isSpeaking, start, stop, isSupported };
}
