"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;

/**
 * Browser Supabase client (singleton).
 * Falls back to placeholder values when env vars are missing so that
 * Next.js prerender / build does not crash; runtime calls will simply
 * fail until the real env vars are available.
 */
export function getSupabase(): SupabaseClient {
  if (browserClient) return browserClient;
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
  if (
    typeof window !== "undefined" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      "Supabase env vars missing — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  browserClient = createClient(url, key, {
    realtime: { params: { eventsPerSecond: 10 } },
    auth: { persistSession: false },
  });
  return browserClient;
}
