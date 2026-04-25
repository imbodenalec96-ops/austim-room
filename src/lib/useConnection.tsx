"use client";

import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type ConnectionStatus = "connecting" | "live" | "offline" | "error";

/**
 * Map a Supabase realtime channel state to a plain status.
 * Listens to the channel's status callback via .subscribe().
 */
export function useChannelStatus(
  factory: () => RealtimeChannel | null,
  deps: ReadonlyArray<unknown>,
): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const channel = factory();
    if (!channel) return;
    channel.subscribe((s) => {
      switch (s) {
        case "SUBSCRIBED":
          setStatus("live");
          break;
        case "CHANNEL_ERROR":
        case "TIMED_OUT":
          setStatus("error");
          break;
        case "CLOSED":
          setStatus("offline");
          break;
        default:
          setStatus("connecting");
      }
    });
    return () => {
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return status;
}

export function ConnectionPill({ status }: { status: ConnectionStatus }) {
  const cfg: Record<
    ConnectionStatus,
    { label: string; bg: string; fg: string; dot: string }
  > = {
    live: { label: "Live", bg: "rgba(110,163,110,0.18)", fg: "#3e6b3e", dot: "#6ea36e" },
    connecting: { label: "Connecting…", bg: "rgba(212,160,74,0.18)", fg: "#7a5b1f", dot: "#d4a04a" },
    offline: { label: "Offline", bg: "rgba(138,138,138,0.18)", fg: "#555", dot: "#8a8a8a" },
    error: { label: "Connection error", bg: "rgba(199,107,107,0.18)", fg: "#7a3535", dot: "#c76b6b" },
  };
  const c = cfg[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 10px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          background: c.dot,
          animation:
            status === "live" ? "conn-pulse 1.6s ease-in-out infinite" : undefined,
        }}
      />
      {c.label}
    </span>
  );
}
