/**
 * Appearance preference: Dark (default), Light, or Automatic (follow the device).
 *
 * Web: applies instantly by setting `data-theme` on <html>; every color token is a
 * CSS variable (constants/theme.ts), so the whole app recolors without a reload.
 * The choice is saved and re-applied before first paint (see app/+html.tsx).
 *
 * Native: the choice is saved; native screens currently render the Dark palette.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, Platform } from "react-native";
import { themeCss, type ColorSchemeName } from "@/constants/theme";

export type AppearancePreference = "dark" | "light" | "system";

export const THEME_STORAGE_KEY = "@honour-your-mentor/appearance";
const DEFAULT_PREFERENCE: AppearancePreference = "dark";
const STYLE_ELEMENT_ID = "hym-theme-tokens";

let preference: AppearancePreference = DEFAULT_PREFERENCE;
let initialized = false;
const listeners = new Set<() => void>();

function systemScheme(): ColorSchemeName {
  if (Platform.OS === "web" && typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return Appearance.getColorScheme() === "light" ? "light" : "dark";
}

function resolve(pref: AppearancePreference): ColorSchemeName {
  return pref === "system" ? systemScheme() : pref;
}

function applyToDocument() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  // Token definitions (also injected by +html.tsx for static renders).
  if (!document.getElementById(STYLE_ELEMENT_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ELEMENT_ID;
    style.textContent = themeCss();
    document.head.appendChild(style);
  }
  const scheme = resolve(preference);
  document.documentElement.setAttribute("data-theme", scheme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    scheme === "light" ? "#F2F2F7" : "#000000"
  );
}

function isPreference(value: unknown): value is AppearancePreference {
  return value === "dark" || value === "light" || value === "system";
}

export const themeService = {
  async initialize(): Promise<void> {
    if (initialized) return;
    initialized = true;
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (isPreference(stored)) preference = stored;
    } catch {
      // keep default
    }
    applyToDocument();
    if (Platform.OS === "web" && typeof window !== "undefined" && window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
        if (preference === "system") {
          applyToDocument();
          listeners.forEach((l) => l());
        }
      });
    }
    listeners.forEach((l) => l());
  },

  getPreference(): AppearancePreference {
    return preference;
  },

  /** The appearance actually shown right now. */
  getScheme(): ColorSchemeName {
    return resolve(preference);
  },

  async setPreference(next: AppearancePreference): Promise<void> {
    preference = next;
    applyToDocument();
    listeners.forEach((l) => l());
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // non-fatal: the choice still applies for this session
    }
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Whether switching appearance takes effect on this platform today. */
  supportsLiveSwitching(): boolean {
    return Platform.OS === "web";
  },
};
