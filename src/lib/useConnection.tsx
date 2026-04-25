"use client";

import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type ConnectionStatus = "connecting" | "live" | "offline" | "error";

export type ConnectionState = {
  status: ConnectionStatus;
  detail?: string;
};

/**
 * Map a Supabase realtime channel state to a plain status.
 * Listens to the channel's status callback via .subscribe().
 *
 * Every transition is logged to the browser console with the prefix [rt]
 * so realtime breakage is debuggable without source-mapping the bundle.
 */
export function useChannelStatus(
  factory: () => RealtimeChannel | null,
  deps: ReadonlyArray<unknown>,
): ConnectionStatus {
  return useChannelState(factory, deps).status;
}

export function useChannelState(
  factory: () => RealtimeChannel | null,
  deps: ReadonlyArray<unknown>,
): ConnectionState {
  const [state, setState] = useState<ConnectionState>({ status: "connecting" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const channel = factory();
    if (!channel) return;
    let watchdog: ReturnType<typeof setTimeout> | null = setTimeout(
      () => {
        // eslint-disable-next-line no-console
        console.warn("[rt] watchdog: no SUBSCRIBED in 10s");
        setState((cur) =>
          cur.status === "connecting"
            ? { status: "error", detail: "no SUBSCRIBED in 10s" }
            : cur,
        );
      },
      10_000,
    );
    function clearWatchdog() {
      if (watchdog) {
        clearTimeout(watchdog);
        watchdog = null;
      }
    }
    channel.subscribe((s, err?: Error) => {
      // eslint-disable-next-line no-console
      console.log("[rt] channel status:", s, err ? `err=${err.message}` : "");
      switch (s) {
        case "SUBSCRIBED":
          clearWatchdog();
          setState({ status: "live" });
          break;
        case "CHANNEL_ERROR":
          clearWatchdog();
          setState({
            status: "error",
            detail: err?.message ?? "CHANNEL_ERROR",
          });
          break;
        case "TIMED_OUT":
          clearWatchdog();
          setState({ status: "error", detail: "TIMED_OUT" });
          break;
        case "CLOSED":
          clearWatchdog();
          setState({ status: "offline", detail: "channel closed" });
          break;
        default:
          setState({ status: "connecting", detail: String(s) });
      }
    });
    return () => {
      clearWatchdog();
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export function ConnectionPill({
  status,
  detail,
}: {
  status: ConnectionStatus;
  detail?: string;
}) {
  const cfg: Record<
    ConnectionStatus,
    { label: string; bg: string; fg: string; dot: string }
  > = {
    live: {
      label: "Live",
      bg: "rgba(110,163,110,0.18)",
      fg: "#3e6b3e",
      dot: "#6ea36e",
    },
    connecting: {
      label: "Connecting…",
      bg: "rgba(212,160,74,0.18)",
      fg: "#7a5b1f",
      dot: "#d4a04a",
    },
    offline: {
      label: "Offline",
      bg: "rgba(138,138,138,0.18)",
      fg: "#555",
      dot: "#8a8a8a",
    },
    error: {
      label: "Connection error",
      bg: "rgba(199,107,107,0.18)",
      fg: "#7a3535",
      dot: "#c76b6b",
    },
  };
  const c = cfg[status];
  const label =
    detail && status !== "live" ? `${c.label} · ${detail}` : c.label;
  return (
    <span
      title={detail ?? ""}
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
        maxWidth: 480,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          background: c.dot,
          animation:
            status === "live"
              ? "conn-pulse 1.6s ease-in-out infinite"
              : undefined,
        }}
      />
      {label}
    </span>
  );
}
