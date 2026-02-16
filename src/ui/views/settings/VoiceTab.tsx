import { useState, useEffect, useCallback } from "react";
import { Mic, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useVoiceContext, type VoiceMode } from "../../context/VoiceContext.js";
import {
  enumerateMicrophones,
  type MicrophoneInfo,
} from "../../../ai/voice/audio-utils.js";

export function VoiceTab() {
  const { settings, updateSettings, registry, ttsVoices } = useVoiceContext();

  const sttProviders = registry.listSTT();
  const ttsProviders = registry.listTTS();

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-1 text-on-surface">Voice</h2>
      <p className="text-xs text-on-surface-muted mb-5">
        Configure speech-to-text, text-to-speech, microphone, and voice interaction mode.
      </p>

      <div className="space-y-8 max-w-lg">
        {/* ── Microphone ── */}
        <MicrophoneSection
          selectedId={settings.microphoneId}
          onSelect={(id) => updateSettings({ microphoneId: id })}
        />

        {/* ── Speech-to-Text ── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-on-surface mb-2">Speech-to-Text</legend>

          <div>
            <label className="block text-xs font-medium text-on-surface-secondary mb-1">
              STT Provider
            </label>
            <select
              value={settings.sttProviderId}
              onChange={(e) => updateSettings({ sttProviderId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-on-surface"
            >
              {sttProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* ── Text-to-Speech ── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-on-surface mb-2">Text-to-Speech</legend>

          <div>
            <label className="block text-xs font-medium text-on-surface-secondary mb-1">
              TTS Provider
            </label>
            <select
              value={settings.ttsProviderId}
              onChange={(e) => updateSettings({ ttsProviderId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-on-surface"
            >
              {ttsProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {ttsVoices.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-on-surface-secondary mb-1">
                Voice
              </label>
              <select
                value={settings.ttsVoice}
                onChange={(e) => updateSettings({ ttsVoice: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-on-surface"
              >
                <option value="">Default</option>
                {ttsVoices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={settings.ttsEnabled}
              onChange={(e) => updateSettings({ ttsEnabled: e.target.checked })}
              className="accent-accent"
            />
            Read AI responses aloud
          </label>
        </fieldset>

        {/* ── Voice Mode ── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-on-surface mb-2">Interaction Mode</legend>

          <div>
            <div className="flex gap-4">
              {(["off", "push-to-talk", "vad"] as VoiceMode[]).map((mode) => (
                <label key={mode} className="flex items-center gap-1.5 text-sm text-on-surface">
                  <input
                    type="radio"
                    name="voiceMode"
                    value={mode}
                    checked={settings.voiceMode === mode}
                    onChange={() => updateSettings({ voiceMode: mode })}
                    className="accent-accent"
                  />
                  {mode === "off"
                    ? "Off"
                    : mode === "push-to-talk"
                      ? "Push-to-Talk"
                      : "VAD (Hands-free)"}
                </label>
              ))}
            </div>
            {settings.voiceMode === "vad" && (
              <p className="mt-2 text-xs text-on-surface-muted">
                Voice Activity Detection automatically detects when you start and stop speaking.
                Requires an API-based STT provider (e.g. Groq) since VAD produces raw audio.
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={settings.autoSend}
              onChange={(e) => updateSettings({ autoSend: e.target.checked })}
              className="accent-accent"
            />
            Auto-send transcribed text to AI
          </label>
        </fieldset>

        {/* ── Groq API Key ── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-on-surface mb-2">Groq Cloud Voice</legend>
          <div>
            <label className="block text-xs font-medium text-on-surface-secondary mb-1">
              API Key
              {settings.groqApiKey && (
                <span className="font-normal text-success ml-2">Set</span>
              )}
            </label>
            <input
              type="password"
              value={settings.groqApiKey}
              onChange={(e) => updateSettings({ groqApiKey: e.target.value })}
              placeholder="Enter Groq API key"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-on-surface"
            />
            <p className="mt-1 text-xs text-on-surface-muted">
              Enables Groq Whisper (STT) and PlayAI (TTS). Free tier available at groq.com.
            </p>
          </div>
        </fieldset>
      </div>
    </section>
  );
}

function MicrophoneSection({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [microphones, setMicrophones] = useState<MicrophoneInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const refreshMicrophones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const mics = await enumerateMicrophones();
      setMicrophones(mics);
      setPermissionGranted(mics.length > 0);
      // If selected mic is no longer available, reset to default
      if (selectedId && mics.length > 0 && !mics.some((m) => m.deviceId === selectedId)) {
        onSelect("");
      }
    } catch {
      setError("Could not access microphones. Check browser permissions.");
      setPermissionGranted(false);
    } finally {
      setLoading(false);
    }
  }, [selectedId, onSelect]);

  // Auto-detect on mount
  useEffect(() => {
    refreshMicrophones();
  }, [refreshMicrophones]);

  // Listen for device changes (plug/unplug)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;
    const handler = () => refreshMicrophones();
    navigator.mediaDevices.addEventListener("devicechange", handler);
    return () => navigator.mediaDevices.removeEventListener("devicechange", handler);
  }, [refreshMicrophones]);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-on-surface mb-2">Microphone</legend>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-xs">
        {loading ? (
          <span className="text-on-surface-muted flex items-center gap-1.5">
            <RefreshCw size={12} className="animate-spin" />
            Detecting microphones...
          </span>
        ) : error ? (
          <span className="text-error flex items-center gap-1.5">
            <AlertCircle size={12} />
            {error}
          </span>
        ) : permissionGranted ? (
          <span className="text-success flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            {microphones.length} microphone{microphones.length !== 1 ? "s" : ""} detected
          </span>
        ) : (
          <span className="text-on-surface-muted flex items-center gap-1.5">
            <Mic size={12} />
            No microphones detected
          </span>
        )}
      </div>

      {/* Dropdown */}
      <div className="flex items-center gap-2">
        <select
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          disabled={microphones.length === 0}
          className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-surface text-on-surface disabled:opacity-50"
        >
          <option value="">System default</option>
          {microphones.map((mic) => (
            <option key={mic.deviceId} value={mic.deviceId}>
              {mic.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={refreshMicrophones}
          disabled={loading}
          title="Refresh microphones"
          className="shrink-0 p-2 text-on-surface-muted hover:text-on-surface rounded-lg hover:bg-surface-secondary transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {!permissionGranted && !loading && !error && (
        <button
          type="button"
          onClick={refreshMicrophones}
          className="px-3 py-1.5 text-xs bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
        >
          Grant microphone access
        </button>
      )}
    </fieldset>
  );
}
