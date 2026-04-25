/**
 * /api/tts — proxies ElevenLabs text-to-speech.
 *
 * The API key is read from the ELEVENLABS_API_KEY env var (server only —
 * never NEXT_PUBLIC_ prefixed) and is .trim()ed defensively so an env-var
 * trailing newline can't break authentication (lesson learned from the
 * Supabase apikey newline bug).
 *
 * The default voice is "Rachel" — a calm, clear narrator voice that
 * works well for autism-classroom announcements. Pass `voiceId` in the
 * body to use a different one.
 */

const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";
// Sarah — "Mature, Reassuring, Confident". Premade voice (works on the
// free tier), and the description fits autism-classroom announcements
// perfectly. Override per-call by passing `voiceId` in the request body.
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
// eleven_turbo_v2_5 is fast (~300ms latency) and high-quality. Good for
// short classroom announcements.
const DEFAULT_MODEL = "eleven_turbo_v2_5";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { text?: string; voiceId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) return new Response("missing text", { status: 400 });
  if (text.length > 500)
    return new Response("text too long (>500 chars)", { status: 400 });

  const apiKey = (process.env.ELEVENLABS_API_KEY ?? "").trim();
  if (!apiKey) {
    return new Response("ELEVENLABS_API_KEY not configured", { status: 503 });
  }

  const voiceId = (body.voiceId ?? DEFAULT_VOICE_ID).trim();

  const upstream = await fetch(
    `${ELEVENLABS_BASE}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: DEFAULT_MODEL,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.85,
          style: 0.05,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!upstream.ok) {
    const errText = await upstream.text();
    return new Response(`elevenlabs ${upstream.status}: ${errText.slice(0, 200)}`, {
      status: 502,
    });
  }

  const audio = await upstream.arrayBuffer();
  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      // Cache aggressively — same text + voice = same audio
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
