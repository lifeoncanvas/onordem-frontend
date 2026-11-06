/**
 * Make picked media survive a page reload on web.
 *
 * On web, expo-image-picker / expo-document-picker return `blob:` URLs, which die
 * when the page reloads, so saved posts and profile photos went blank. Photos are
 * downscaled and turned into compact JPEG data URLs that can be stored. Native
 * file:// URIs are returned unchanged.
 *
 * Videos and audio are too large for browser storage, so on web they stay
 * session-only until media uploads go to the backend (POST /api/v1/media/upload).
 */
import { Platform } from "react-native";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = src;
  });
}

/** Returns a URI that is still valid after a reload. */
export async function persistImageUri(uri: string): Promise<string> {
  if (Platform.OS !== "web" || !uri.startsWith("blob:")) return uri;
  try {
    const img = await loadImage(uri);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return uri;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return uri;
  }
}

/** True when a URI only lives for this browser session. */
export function isSessionOnlyUri(uri: string): boolean {
  return Platform.OS === "web" && uri.startsWith("blob:");
}
