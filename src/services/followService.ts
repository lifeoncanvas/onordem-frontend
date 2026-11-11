import AsyncStorage from "@react-native-async-storage/async-storage";
import { PEOPLE, PEOPLE_TRIBUTES, type Person } from "@/data/peopleData";
import type { MemoryData } from "@/components/home/MemoryCard";

export interface UserConnection {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  bio?: string;
  isFollowing: boolean;
}

export type FollowUser = UserConnection;

const STORAGE_KEY_FOLLOWING = "@hym_following_ids_v2";
const STORAGE_KEY_DISMISSED = "@hym_dismissed_suggestions";
const STORAGE_KEY_EXTRA_PROFILES = "@hym_followed_profiles";

const DEFAULT_FOLLOWERS: UserConnection[] = [];

const DEFAULT_FOLLOWING: UserConnection[] = [];

class FollowService {
  private followingMap: Map<string, boolean> = new Map();
  private followers: UserConnection[] = [...DEFAULT_FOLLOWERS];
  private following: UserConnection[] = [...DEFAULT_FOLLOWING];
  private listeners: Array<() => void> = [];
  private dismissed: Set<string> = new Set();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /** Safe to call from many screens at once: storage is loaded only once. */
  initialize(): Promise<void> {
    if (!this.initPromise) this.initPromise = this.load();
    return this.initPromise;
  }

  isReady(): boolean {
    return this.initialized;
  }

  private async load() {
    try {
      const dismissedRaw = await AsyncStorage.getItem(STORAGE_KEY_DISMISSED);
      if (dismissedRaw) this.dismissed = new Set(JSON.parse(dismissedRaw) as string[]);
    } catch {
      // non-fatal
    }
    try {
      // Details of followed people who aren't in the built-in directory (e.g. story authors).
      const extraRaw = await AsyncStorage.getItem(STORAGE_KEY_EXTRA_PROFILES);
      if (extraRaw) {
        for (const user of JSON.parse(extraRaw) as UserConnection[]) {
          if (!this.following.some((f) => f.id === user.id)) this.following.push(user);
        }
      }
    } catch {
      // non-fatal
    }
    try {
      await AsyncStorage.removeItem("@hym_following_ids").catch(() => {});
      const stored = await AsyncStorage.getItem(STORAGE_KEY_FOLLOWING);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const DUMMY_IDS = new Set(["f1", "f2", "f3", "f4", "m1", "m2", "m3"]);
        const realIds = ids.filter((id) => !DUMMY_IDS.has(id));
        this.followingMap = new Map(realIds.map((id) => [id, true]));
      } else {
        this.followingMap = new Map();
        await this.persist();
      }
    } catch {
      this.followingMap = new Map();
    }
    this.initialized = true;
    this.notify();
  }

  private async persist() {
    try {
      const ids = Array.from(this.followingMap.entries())
        .filter(([_, isFollowing]) => isFollowing)
        .map(([id]) => id);
      await AsyncStorage.setItem(STORAGE_KEY_FOLLOWING, JSON.stringify(ids));
      const extras = this.following.filter(
        (f) =>
          this.isFollowing(f.id) &&
          !DEFAULT_FOLLOWING.some((d) => d.id === f.id) &&
          !PEOPLE.some((p) => p.id === f.id)
      );
      await AsyncStorage.setItem(STORAGE_KEY_EXTRA_PROFILES, JSON.stringify(extras));
    } catch {
      // non-fatal
    }
    this.notify();
  }

  isFollowing(id: string): boolean {
    return this.followingMap.get(id) ?? false;
  }

  toggleFollow(user: { id: string; name: string; username?: string; avatar?: string; role?: string }): boolean {
    const currentState = this.isFollowing(user.id);
    const newState = !currentState;
    this.followingMap.set(user.id, newState);

    if (newState) {
      if (!this.following.some((f) => f.id === user.id)) {
        this.following.push({
          id: user.id,
          name: user.name,
          username: user.username || user.name.toLowerCase().replace(/\s+/g, "_"),
          avatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          role: user.role || "Mentor",
          isFollowing: true,
        });
      }
    } else {
      this.following = this.following.filter((f) => f.id !== user.id);
    }

    this.persist();
    return newState;
  }

  getFollowersCount(): number {
    return this.followers.length;
  }

  getFollowingCount(): number {
    return this.getFollowing().length;
  }

  getFollowers(): UserConnection[] {
    return this.followers.map((f) => ({
      ...f,
      isFollowing: this.isFollowing(f.id),
    }));
  }

  /**
   * Everyone you follow, rebuilt from the saved ids so people followed in an
   * earlier session (not just the built-in defaults) still appear after a reload.
   */
  getFollowing(): UserConnection[] {
    const result: UserConnection[] = [];
    const seenIds = new Set<string>();
    for (const [id, isFollowing] of this.followingMap) {
      if (!isFollowing || seenIds.has(id)) continue;
      seenIds.add(id);
      const known = this.following.find((f) => f.id === id);
      if (known) {
        result.push({ ...known, isFollowing: true });
        continue;
      }
      const person = this.getPerson(id);
      if (person) {
        result.push({
          id: person.id,
          name: person.name,
          username: person.username,
          avatar: person.avatar,
          role: person.role,
          bio: person.bio,
          isFollowing: true,
        });
      }
    }
    return result;
  }

  // ── People directory ──────────────────────────────────────────────────────

  /** A community member, or anyone in your followers / following lists. */
  getPerson(id: string): Person | null {
    const person = PEOPLE.find((p) => p.id === id);
    if (person) return person;
    const known = [...this.following, ...this.followers].find((u) => u.id === id);
    if (!known) return null;
    return {
      id: known.id,
      name: known.name,
      username: known.username,
      avatar: known.avatar,
      role: known.role,
      bio: known.bio ?? "",
      followerCount: 0,
      followingCount: 0,
    };
  }

  getPersonTributes(id: string): MemoryData[] {
    return PEOPLE_TRIBUTES[id] ?? [];
  }

  /** People you don't follow yet and haven't dismissed. */
  getSuggestions(limit = 10): Person[] {
    const seen = new Set<string>();
    return PEOPLE.filter((p) => {
      if (this.isFollowing(p.id) || this.dismissed.has(p.id) || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    }).slice(0, limit);
  }

  async dismissSuggestion(id: string): Promise<void> {
    this.dismissed.add(id);
    this.notify();
    try {
      await AsyncStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify([...this.dismissed]));
    } catch {
      // non-fatal
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const followService = new FollowService();
