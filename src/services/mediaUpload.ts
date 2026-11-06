/**
 * Upload local media (device file paths, browser blob:/data: URLs) to the backend
 * and return a permanent https URL. Remote URLs are returned unchanged.
 */
import { api } from "./api";

export type MediaKind = "photo" | "video" | "audio";

const DEFAULT_TYPE: Record<MediaKind, { mime: string; ext: string }> = {
  photo: { mime: "image/jpeg", ext: "jpg" },
  video: { mime: "video/mp4", ext: "mp4" },
  audio: { mime: "audio/m4a", ext: "m4a" },
};

const EXT_FROM_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "audio/webm": "webm",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/m4a": "m4a",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/aac": "aac",
};

function guessType(uri: string, kind: MediaKind): { mime: string; ext: string } {
  const dataMime = /^data:([^;,]+)/.exec(uri)?.[1];
  if (dataMime && EXT_FROM_MIME[dataMime]) return { mime: dataMime, ext: EXT_FROM_MIME[dataMime] };
  const ext = /\.([a-z0-9]{2,5})(?:\?|#|$)/i.exec(uri)?.[1]?.toLowerCase();
  if (ext) {
    const mime = Object.entries(EXT_FROM_MIME).find(([m, e]) => e === ext && m.startsWith(kind === "photo" ? "image" : kind))?.[0];
    if (mime) return { mime, ext };
  }
  return DEFAULT_TYPE[kind];
}

/**
 * Returns a remote URL for `uri`, uploading it first if it only exists on this
 * device. Returns undefined if there is nothing to upload or the upload fails
 * (e.g. an expired browser blob: link), so callers can skip that file.
 */
export async function ensureRemoteMedia(uri: string | undefined | null, kind: MediaKind): Promise<string | undefined> {
  if (!uri) return undefined;
  if (/^https?:\/\//i.test(uri)) return uri;
  try {
    const { mime, ext } = guessType(uri, kind);
    const res = await api.media.upload(uri, `${kind}-${Date.now()}.${ext}`, mime, kind);
    const url: unknown = res?.data?.url;
    return typeof url === "string" ? url : undefined;
  } catch (error) {
    console.debug(`Could not upload ${kind}:`, error);
    return undefined;
  }
}
