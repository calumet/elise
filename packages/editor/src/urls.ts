const SAFE_SCHEME = /^(https?|mailto|tel):/i;

export const safeHref = (href: string | null | undefined): string | undefined => {
  const value = href?.trim();
  if (!value) return undefined;
  if (SAFE_SCHEME.test(value) || /^[/#?]/.test(value)) return value;
  return /^[a-z][a-z0-9+.-]*:/i.test(value) ? undefined : value;
};

export const safeSrc = (src: string | null | undefined): string | undefined => {
  const value = src?.trim();
  if (value && /^data:image\/(png|jpe?g|gif|webp|avif);/i.test(value)) return value;
  return safeHref(value);
};

export type VideoSource = { provider: "youtube" | "vimeo"; id: string; embed: string };

const YOUTUBE = /^(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be)$/i;
const VIMEO = /^(?:www\.|player\.)?vimeo\.com$/i;

const build = (provider: VideoSource["provider"], id: string): VideoSource => ({
  provider,
  id,
  embed:
    provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : `https://player.vimeo.com/video/${id}`,
});

export const parseVideo = (url: string | null | undefined): VideoSource | undefined => {
  let parsed: URL;
  try {
    parsed = new URL((url ?? "").trim());
  } catch {
    return undefined;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return undefined;
  const parts = parsed.pathname.split("/").filter(Boolean);
  if (YOUTUBE.test(parsed.hostname)) {
    const id =
      parsed.hostname.includes("youtu.be") || parts[0] === "embed" || parts[0] === "shorts"
        ? parts[parsed.hostname.includes("youtu.be") ? 0 : 1]
        : parsed.searchParams.get("v");
    return id && /^[\w-]{6,}$/.test(id) ? build("youtube", id) : undefined;
  }
  if (VIMEO.test(parsed.hostname)) {
    const id = parts.find((part) => /^\d+$/.test(part));
    return id ? build("vimeo", id) : undefined;
  }
  return undefined;
};
