/** Parse a video URL and return an embeddable iframe src, or null if not embeddable. */
export function getVideoEmbed(url: string | null | undefined): {
  kind: "youtube" | "vimeo" | "video";
  src: string;
} | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return { kind: "youtube", src: `https://www.youtube.com/embed/${id}` };
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return { kind: "youtube", src: `https://www.youtube.com/embed/${id}` };
    }
    if (host === "youtube.com" && u.pathname.startsWith("/embed/")) {
      return { kind: "youtube", src: trimmed };
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return { kind: "vimeo", src: `https://player.vimeo.com/video/${id}` };
    }
    if (host === "player.vimeo.com") return { kind: "vimeo", src: trimmed };
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u.pathname)) {
      return { kind: "video", src: trimmed };
    }
    // Unknown URL — try iframe; consumer can fall back.
    return { kind: "youtube", src: trimmed };
  } catch {
    return null;
  }
}

export function formatBytes(bytes?: number): string {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}