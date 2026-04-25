import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client. Returns a working client with placeholder
 * values when env vars are missing so build-time module evaluation does
 * not throw; runtime selects will fail until env vars are set.
 */
export function getSupabaseServer(): SupabaseClient {
  // .trim() guards against trailing whitespace in the env var (Realtime WS
  // auth rejects %0A in apikey, even though REST tolerates it).
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
  ).trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
  ).trim();
  return createClient(url, key, { auth: { persistSession: false } });
}
