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

const STORAGE_KEY_FOLLOWING = "@hym_following_ids";
const STORAGE_KEY_DISMISSED = "@hym_dismissed_suggestions";
const STORAGE_KEY_EXTRA_PROFILES = "@hym_followed_profiles";

const DEFAULT_FOLLOWERS: UserConnection[] = [
  {
    id: "f1",
    name: "Aarav Patel",
    username: "aarav_p",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    role: "Computer Science Graduate",
    bio: "Honouring professors who inspired my journey in engineering.",
    isFollowing: true,
  },
  {
    id: "f2",
    name: "Elena Rostova",
    username: "elena_r",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    role: "Visual Artist & Designer",
    bio: "Documenting timeless advice from art directors and teachers.",
    isFollowing: false,
  },
  {
    id: "f3",
    name: "Kavita Rao",
    username: "kavita_r",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    role: "Literature Fellow",
    bio: "Stories of kindness and patience that outlived school halls.",
    isFollowing: true,
  },
  {
    id: "f4",
    name: "David Kim",
    username: "david_k",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    role: "Biotech Researcher",
    bio: "Honouring Dr. Mitchell and the lab family.",
    isFollowing: true,
  },
];

const DEFAULT_FOLLOWING: UserConnection[] = [
  {
    id: "m1",
    name: "Mrs. Anita Sharma",
    username: "anita_sharma",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    role: "Literature Teacher",
    bio: "Believe in your voice before asking the world to listen.",
    isFollowing: true,
  },
  {
    id: "m2",
    name: "Dr. David Mitchell",
    username: "david_mitchell",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    role: "Research Advisor",
    bio: "True mastery is quiet patience with difficult problems.",
    isFollowing: true,
  },
  {
    id: "m3",
    name: "Vikram Rao",
    username: "vikram_rao",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    role: "Engineering Director",
    bio: "Build things that outlive your tenure and elevate people.",
    isFollowing: true,
  },
  {
    id: "f1",
    name: "Aarav Patel",
    username: "aarav_p",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    role: "Computer Science Graduate",
    bio: "Honouring professors who inspired my journey in engineering.",
    isFollowing: true,
  },
  {
    id: "f3",
    name: "Kavita Rao",
    username: "kavita_r",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    role: "Literature Fellow",
    bio: "Stories of kindness and patience that outlived school halls.",
    isFollowing: true,
  },
];

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
      const stored = await AsyncStorage.getItem(STORAGE_KEY_FOLLOWING);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        this.followingMap = new Map(ids.map((id) => [id, true]));
      } else {
        DEFAULT_FOLLOWING.forEach((item) => this.followingMap.set(item.id, true));
        await this.persist();
      }
    } catch {
      DEFAULT_FOLLOWING.forEach((item) => this.followingMap.set(item.id, true));
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
    for (const [id, isFollowing] of this.followingMap) {
      if (!isFollowing) continue;
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
    return PEOPLE.filter((p) => !this.isFollowing(p.id) && !this.dismissed.has(p.id)).slice(0, limit);
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
