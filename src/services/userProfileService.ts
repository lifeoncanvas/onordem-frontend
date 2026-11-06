import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, getAuthToken } from "./api";
import { ensureRemoteMedia } from "./mediaUpload";

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  phone?: string;
  bio: string;
  avatarUri: string;
  /** ISO date "YYYY-MM-DD". Private: never shown on the public profile. */
  birthday?: string;
  /** "woman" | "man" | "non-binary" | "prefer-not-to-say", or free text when self-described. */
  gender?: string;
  /** Kinds of people this user wants to honour, e.g. ["teacher", "parent"]. */
  honouring?: string[];
  /** True once the post-signup profile setup has been completed or skipped. */
  setupComplete?: boolean;
}

const PROFILE_STORAGE_KEY = "@honour-your-mentor/profile";

const DEFAULT_PROFILE: UserProfile = {
  name: "Mentee",
  username: "mentee",
  email: "",
  phone: "",
  bio: "Remembering the mentors and guides who shaped my life.",
  avatarUri:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
};

let profile: UserProfile = { ...DEFAULT_PROFILE };
let initializePromise: Promise<UserProfile> | null = null;
const listeners = new Set<(nextProfile: UserProfile) => void>();

export const userProfileService = {
  getProfile(): UserProfile {
    return { ...profile, honouring: profile.honouring ? [...profile.honouring] : undefined };
  },

  async initialize(): Promise<UserProfile> {
    if (!initializePromise) {
      initializePromise = (async () => {
        try {
          const token = await getAuthToken().catch(() => null);
          if (!token) {
            // If user is not authenticated, never retain an old session from a previous user
            profile = { ...DEFAULT_PROFILE };
            await AsyncStorage.removeItem(PROFILE_STORAGE_KEY).catch(() => {});
          } else {
            const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
            if (stored) {
              const parsed: unknown = JSON.parse(stored);
              if (isUserProfile(parsed)) {
                // Discard old hardcoded "Sarita Baiga" placeholder if present
                if (parsed.name === "Sarita Baiga" || parsed.email === "sarita@example.com") {
                  await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
                } else {
                  profile = { ...parsed, phone: parsed.phone ?? "" };
                }
              }
            }
            await this.syncWithBackend().catch(() => {});
          }
        } catch (error) {
          console.warn("Failed reading local profile cache:", error);
        }

        const nextProfile = this.getProfile();
        listeners.forEach((listener) => listener(nextProfile));
        return nextProfile;
      })();
    }
    return initializePromise;
  },

  async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {}
    profile = { ...DEFAULT_PROFILE };
    const cleared = this.getProfile();
    listeners.forEach((listener) => listener(cleared));
  },

  async syncWithBackend(): Promise<UserProfile | null> {
    try {
      const res = await api.auth.me();
      if (res?.data) {
        const u = res.data;
        const synced: UserProfile = {
          name: u.name || profile.name || "Mentee",
          username: u.username || u.email?.split("@")[0] || profile.username || "mentee",
          email: u.email || profile.email || "",
          phone: u.phone || profile.phone || "",
          bio: u.bio || profile.bio || "Remembering the mentors and guides who shaped my life.",
          avatarUri: u.avatarUri || profile.avatarUri || DEFAULT_PROFILE.avatarUri,
          birthday: u.birthday || profile.birthday,
          gender: u.gender || profile.gender,
          honouring: Array.isArray(u.honouring) && u.honouring.length ? u.honouring : profile.honouring,
          setupComplete: u.setupComplete === true || profile.setupComplete === true,
        };
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(synced));
        profile = synced;
        const publishedProfile = this.getProfile();
        listeners.forEach((listener) => listener(publishedProfile));
        return publishedProfile;
      }
    } catch {
      // Offline or unauthenticated
    }
    return null;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const nextProfile: UserProfile = {
      name: (updates.name !== undefined ? updates.name : profile.name).trim() || "Mentee",
      username: (updates.username !== undefined ? updates.username : profile.username).trim().replace(/^@/, ""),
      email: (updates.email !== undefined ? updates.email : profile.email).trim(),
      phone: (updates.phone !== undefined ? updates.phone : profile.phone || "").trim(),
      bio: (updates.bio !== undefined ? updates.bio : profile.bio).trim(),
      avatarUri: (updates.avatarUri !== undefined ? updates.avatarUri : profile.avatarUri).trim(),
      birthday: updates.birthday !== undefined ? updates.birthday : profile.birthday,
      gender: updates.gender !== undefined ? updates.gender.trim() : profile.gender,
      honouring: updates.honouring !== undefined ? [...updates.honouring] : profile.honouring,
      setupComplete: updates.setupComplete !== undefined ? updates.setupComplete : profile.setupComplete,
    };
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    profile = nextProfile;
    const publishedProfile = this.getProfile();
    listeners.forEach((listener) => listener(publishedProfile));
    return publishedProfile;
  },

  /**
   * Saves the whole profile to the backend (uploading a local photo first).
   * Throws if the server rejects it, so callers can show the reason.
   * Does nothing when signed out.
   */
  async pushToBackend(): Promise<void> {
    const token = await getAuthToken().catch(() => null);
    if (!token) return;
    let avatarUri = profile.avatarUri;
    if (avatarUri && !/^https?:\/\//i.test(avatarUri)) {
      const uploaded = await ensureRemoteMedia(avatarUri, "photo");
      if (uploaded) {
        avatarUri = uploaded;
        await this.updateProfile({ avatarUri: uploaded });
      } else {
        avatarUri = "";
      }
    }
    await api.users.updateMe({
      name: profile.name,
      username: profile.username,
      email: profile.email,
      bio: profile.bio,
      avatarUri,
      phone: profile.phone || undefined,
      birthday: profile.birthday,
      gender: profile.gender,
      honouring: profile.honouring,
      setupComplete: profile.setupComplete,
    });
  },

  subscribe(listener: (nextProfile: UserProfile) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.username === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.bio === "string" &&
    typeof candidate.avatarUri === "string"
  );
}
