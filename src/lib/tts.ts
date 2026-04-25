"use client";

/**
 * Text-to-speech with ElevenLabs primary + browser SpeechSynthesis fallback.
 *
 *   import { speak } from "@/lib/tts";
 *   await speak("Leo says I see water");
 *
 * The audio for a given text is cached in-memory for the session so the
 * second time the same phrase is spoken it plays instantly without a
 * round-trip to the API.
 */

type Cache = Map<string, string>; // text → object URL
const audioCache: Cache = new Map();

let lastAudio: HTMLAudioElement | null = null;

function browserFallback(text: string) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* noop */
  }
}

/**
 * Speak `text` aloud. Cancels any in-flight utterance first.
 * Uses ElevenLabs via /api/tts; falls back to browser TTS if the API
 * fails (no key configured, network down, rate limit, etc).
 */
export async function speak(text: string): Promise<void> {
  if (!text.trim()) return;
  if (typeof window === "undefined") return;

  // Cancel any current playback for snappy turn-taking
  if (lastAudio) {
    try { lastAudio.pause(); } catch { /* noop */ }
    lastAudio = null;
  }
  if ("speechSynthesis" in window) {
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
  }

  // Cache hit — reuse blob URL
  const cached = audioCache.get(text);
  if (cached) {
    const audio = new Audio(cached);
    lastAudio = audio;
    audio.play().catch(() => browserFallback(text));
    return;
  }

  let url: string | null = null;
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`tts ${res.status}`);
    const blob = await res.blob();
    url = URL.createObjectURL(blob);
  } catch {
    browserFallback(text);
    return;
  }

  audioCache.set(text, url);
  const audio = new Audio(url);
  lastAudio = audio;
  // If the browser refuses to autoplay (no user gesture yet), gracefully
  // fall back to SpeechSynthesis which has a more permissive policy.
  audio.play().catch(() => browserFallback(text));
}
