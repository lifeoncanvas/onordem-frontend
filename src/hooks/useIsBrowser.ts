import { useEffect, useState } from "react";
import { Platform } from "react-native";

const INSTALLED_DISPLAY_MODES = ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"];

/** True when the web build is running as an installed app (home-screen / desktop PWA, Android TWA). */
export function isInstalledWebApp(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  if ((window.navigator as any).standalone === true) return true; // iOS Safari home-screen app
  if (typeof document !== "undefined" && document.referrer.startsWith("android-app://")) return true; // TWA
  return INSTALLED_DISPLAY_MODES.some(
    (mode) => typeof window.matchMedia === "function" && window.matchMedia(`(display-mode: ${mode})`).matches,
  );
}

/**
 * True only when the app is open in a regular web browser tab.
 * False in the native iOS/Android app, in an installed PWA, and during static rendering
 * (so the server HTML never contains browser-only UI and hydration stays consistent).
 */
export function useIsBrowser(): boolean {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const update = () => setIsBrowser(!isInstalledWebApp());
    update();

    // The display mode can change, e.g. right after the user installs the PWA.
    const queries =
      typeof window.matchMedia === "function"
        ? INSTALLED_DISPLAY_MODES.map((mode) => window.matchMedia(`(display-mode: ${mode})`))
        : [];
    queries.forEach((q) => q.addEventListener?.("change", update));
    window.addEventListener("appinstalled", update);
    return () => {
      queries.forEach((q) => q.removeEventListener?.("change", update));
      window.removeEventListener("appinstalled", update);
    };
  }, []);

  return isBrowser;
}
