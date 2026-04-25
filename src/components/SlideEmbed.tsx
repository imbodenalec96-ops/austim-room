/**
 * SlideEmbed — renders the right kind of viewer based on the URL.
 *
 *   YouTube  (youtu.be/X, youtube.com/watch?v=X, youtube.com/embed/X)
 *     → responsive iframe with autoplay+mute (browser autoplay policy)
 *   Image    (.jpg / .png / .webp / .gif / .svg) → big <img>
 *   PDF      (.pdf) → embedded viewer
 *   Anything else → iframe (Google Slides, Loom, generic)
 */

export type SlideEmbedProps = {
  url: string;
  title?: string;
  className?: string;
  /** When true, autoplay video where supported. Default true on the
   *  presentation view, false in the schedule editor preview. */
  autoplay?: boolean;
};

function youtubeIdOf(u: URL): string | null {
  if (u.hostname.endsWith("youtu.be")) {
    return u.pathname.slice(1).split("/")[0] || null;
  }
  if (u.hostname.endsWith("youtube.com") || u.hostname.endsWith("youtube-nocookie.com")) {
    if (u.pathname === "/watch") return u.searchParams.get("v");
    if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
    if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
  }
  return null;
}

function vimeoIdOf(u: URL): string | null {
  if (u.hostname.endsWith("vimeo.com")) {
    const m = u.pathname.match(/^\/(\d+)/);
    return m ? m[1] : null;
  }
  return null;
}

function isImage(pathname: string): boolean {
  return /\.(jpe?g|png|webp|gif|svg|avif|bmp)$/i.test(pathname);
}

function isPdf(pathname: string): boolean {
  return /\.pdf$/i.test(pathname);
}

export function SlideEmbed({
  url,
  title,
  className,
  autoplay = true,
}: SlideEmbedProps) {
  const trimmed = url.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return (
      <div className={className} style={{ padding: 16, color: "var(--bad)" }}>
        Invalid URL: {trimmed}
      </div>
    );
  }

  // YouTube → responsive iframe
  const ytId = youtubeIdOf(parsed);
  if (ytId) {
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    if (autoplay) {
      params.set("autoplay", "1");
      params.set("mute", "1"); // browsers require muted to autoplay
    }
    return (
      <div className={`slide-frame ${className ?? ""}`}>
        <iframe
          title={title ?? "YouTube video"}
          src={`https://www.youtube.com/embed/${ytId}?${params.toString()}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Vimeo
  const vimeoId = vimeoIdOf(parsed);
  if (vimeoId) {
    return (
      <div className={`slide-frame ${className ?? ""}`}>
        <iframe
          title={title ?? "Vimeo video"}
          src={`https://player.vimeo.com/video/${vimeoId}${autoplay ? "?autoplay=1&muted=1" : ""}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Image
  if (isImage(parsed.pathname)) {
    return (
      <div className={`slide-frame slide-frame-image ${className ?? ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trimmed} alt={title ?? ""} />
      </div>
    );
  }

  // PDF
  if (isPdf(parsed.pathname)) {
    return (
      <div className={`slide-frame ${className ?? ""}`}>
        <iframe title={title ?? "PDF"} src={trimmed} />
      </div>
    );
  }

  // Generic iframe (Google Slides, Loom, Canva, etc.)
  return (
    <div className={`slide-frame ${className ?? ""}`}>
      <iframe
        title={title ?? "Embedded slide"}
        src={trimmed}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
