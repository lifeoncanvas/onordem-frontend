/**
 * Minimal i18n: English (default) and Hindi.
 *
 *   const t = useT();
 *   t("profile.followers")                → "Followers" / "फ़ॉलोअर्स"
 *   t("settings.blocked.sub", { count: 2 }) → "2 blocked"
 *
 * Components using useT() re-render when the language changes.
 */
import { useMemo, useSyncExternalStore } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { en, hi, type StringKey } from "./strings";

export type Language = "en" | "hi";

export const LANGUAGES: { id: Language; nativeName: string; englishName: string }[] = [
  { id: "en", nativeName: "English", englishName: "English" },
  { id: "hi", nativeName: "हिन्दी", englishName: "Hindi" },
];

export const LANGUAGE_STORAGE_KEY = "@honour-your-mentor/language";
const DICTIONARIES: Record<Language, Record<StringKey, string>> = { en, hi };

function readInitialLanguage(): Language {
  // Web: read synchronously so the first render is already in the right language.
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    try {
      return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "hi" ? "hi" : "en";
    } catch {
      return "en";
    }
  }
  return "en";
}

let language: Language = readInitialLanguage();
let initialized = false;
const listeners = new Set<() => void>();

function applyToDocument() {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", language);
  }
}

export const languageService = {
  async initialize(): Promise<void> {
    if (initialized) return;
    initialized = true;
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === "en" || stored === "hi") language = stored;
    } catch {
      // keep default
    }
    applyToDocument();
    listeners.forEach((l) => l());
  },
  get(): Language {
    return language;
  },
  async set(next: Language): Promise<void> {
    language = next;
    applyToDocument();
    listeners.forEach((l) => l());
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // non-fatal
    }
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export type TFunction = (key: StringKey, vars?: Record<string, string | number>) => string;

export function makeT(lang: Language): TFunction {
  const dict = DICTIONARIES[lang];
  return (key, vars) => {
    let text = dict[key] ?? en[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replace(`{${name}}`, String(value));
      }
    }
    return text;
  };
}

export function useLanguage(): Language {
  return useSyncExternalStore(languageService.subscribe, languageService.get, languageService.get);
}

/** Translation function for the current language; re-renders on change. */
export function useT(): TFunction {
  const lang = useLanguage();
  return useMemo(() => makeT(lang), [lang]);
}

export type { StringKey };
