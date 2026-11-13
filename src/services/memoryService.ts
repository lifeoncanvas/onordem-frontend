import AsyncStorage from "@react-native-async-storage/async-storage";
import { WALL_ITEMS, WALL_MENTOR_PROFILES } from "@/data/memoryWallData";
import { tributeDraftService } from "./tributeDraftService";
import { WallItem, WallMentorProfile, WallTribute } from "@/types/memoryWall";
import type { TributeRelationship } from "@/types/create";
import { api, getAuthToken } from "./api";
import { ensureRemoteMedia } from "./mediaUpload";

type Listener = () => void;

function isTributeRelationship(value: string): value is TributeRelationship {
  return [
    "Teacher",
    "Parent",
    "Coach",
    "Friend",
    "Leader",
    "Other",
    "Grandparent",
    "Professor",
    "Colleague",
    "Spiritual Guide",
    "Other Mentor",
    "Literature Teacher",
    "Research Advisor",
    "Engineering Director",
    "Art & Design Coach",
    "Friend & Mentor",
  ].includes(value);
}

function getItemContent(item: any): string {
  if (!item) return "";
  return String(item.quote || item.story || item.excerpt || item.title || item.lessonTitle || item.letterBody || "").trim();
}

function isStringMap(value: unknown): value is Record<string, string> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => typeof v === "string")
  );
}

/** Converts a backend TributeDto into a wall item. */
function dtoToWallItem(dto: any): WallItem {
  const storyText = dto.story || dto.excerpt || dto.quote || "";
  return {
    kind: (dto.kind as any) || "tribute",
    id: dto.id,
    mentorId: dto.mentorId,
    mentorName: dto.mentorName,
    relationship: dto.relationship || "Mentor",
    title: dto.title || `Tribute to ${dto.mentorName}`,
    photoUri: dto.photoUri || "",
    imageUri: dto.photoUri || "",
    additionalImages: Array.isArray(dto.additionalImages) ? dto.additionalImages : [],
    videoUris: Array.isArray(dto.videoUris) && dto.videoUris.length ? dto.videoUris : undefined,
    audioUri: dto.audioUri || undefined,
    quote: dto.quote || storyText,
    story: storyText,
    excerpt: dto.excerpt || storyText.slice(0, 180),
    preview: dto.excerpt || storyText.slice(0, 180) || "A heartfelt tribute dedicated to guidance and wisdom.",
    letterBody: storyText,
    salutation: dto.salutation || `Dear ${dto.mentorName},`,
    signoff: dto.signoff || "With gratitude,",
    signature: dto.signature || "A Mentee",
    wordCount: storyText ? storyText.split(/\s+/).filter(Boolean).length : 40,
    mood: dto.mood || "Grateful",
    lessonTitle: dto.title || `Lesson from ${dto.mentorName}`,
    lessonCarried: dto.lessonCarried || "",
    momentToRemember: dto.momentToRemember || "",
    year: dto.year || String(new Date(dto.createdAt || Date.now()).getFullYear()),
    emotion: dto.emotion || "Gratitude",
    emotionColor: dto.emotionColor || "#FF9ECF",
    createdAt: dto.createdAt || new Date().toISOString(),
    isPinned: dto.isPinned || dto.pinned || false,
    isShared: dto.isShared || dto.shared || false,
  } as any;
}

function isPinOverrideMap(value: unknown): value is Record<string, boolean> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every((isPinned) => typeof isPinned === "boolean")
  );
}

class MemoryService {
  private items: WallItem[] = [];
  private mentors: WallMentorProfile[] = [];
  private userItemIds = new Set<string>();
  private pinOverrides = new Map<string, boolean>();
  /** Local item id → backend tribute id, for items created on this device. */
  private serverIds = new Map<string, string>();
  /** Items the author marked private (kept so an offline retry stays private). */
  private privateIds = new Set<string>();
  /** Items currently being uploaded, so a retry doesn't post them twice. */
  private pushing = new Set<string>();
  private listeners: Set<Listener> = new Set();
  private initializePromise: Promise<void> | null = null;
  private persistenceQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.syncKeepsakes();
    tributeDraftService.subscribe(() => {
      this.syncKeepsakes();
      this.notify();
    });
  }

  public initialize(): Promise<void> {
    if (!this.initializePromise) {
      this.initializePromise = AsyncStorage.getItem("@honour-your-mentor/memories")
        .then((stored) => {
          if (!stored) return;
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            if (!parsed.every(isStoredWallItem)) {
              throw new Error("The saved memory collection is invalid.");
            }
            this.loadUserItems(parsed);
          } else if (parsed && typeof parsed === "object") {
            const data = parsed as {
              items?: unknown;
              pinOverrides?: unknown;
              serverIds?: unknown;
              privateIds?: unknown;
            };
            if (
              !Array.isArray(data.items) ||
              !data.items.every(isStoredWallItem) ||
              (data.pinOverrides !== undefined &&
                !isPinOverrideMap(data.pinOverrides))
            ) {
              throw new Error("The saved memory collection is invalid.");
            }
            this.loadUserItems(data.items);
            Object.entries(data.pinOverrides ?? {}).forEach(([id, isPinned]) => {
              this.pinOverrides.set(id, isPinned);
            });
            if (isStringMap(data.serverIds)) {
              this.serverIds = new Map(Object.entries(data.serverIds));
            }
            if (Array.isArray(data.privateIds)) {
              this.privateIds = new Set(data.privateIds.filter((v): v is string => typeof v === "string"));
            }
          } else {
            throw new Error("The saved memory collection is invalid.");
          }
          for (const item of this.items) {
            const isPinned = this.pinOverrides.get(item.id);
            if (isPinned !== undefined) item.isPinned = isPinned;
          }
          this.updateMentorCounts();
          this.notify();
        })
        .then(() => {
          // Always sync, including on a fresh device with nothing stored yet.
          this.syncWithBackend().catch(() => {});
        })
        .catch((error: unknown) => {
          this.initializePromise = null;
          throw error;
        });
    }
    return this.initializePromise;
  }

  /**
   * Synchronizes public tributes and mentor profiles with the Spring Boot + Neon DB backend
   */
  public async syncWithBackend(): Promise<void> {
    try {
      // 1. Fetch public feed tributes from Neon PostgreSQL
      const feedRes = await api.tributes.publicFeed(0, 50);
      if (feedRes?.data?.content && Array.isArray(feedRes.data.content)) {
        for (const dto of feedRes.data.content) {
          const dtoText = getItemContent(dto);
          const existingIndex = this.items.findIndex(
            (i) =>
              i.id === dto.id ||
              (i.mentorName?.trim().toLowerCase() === dto.mentorName?.trim().toLowerCase() &&
               getItemContent(i) === dtoText)
          );
          if (existingIndex >= 0) {
            this.serverIds.set(this.items[existingIndex].id, dto.id);
            this.items[existingIndex] = dtoToWallItem(dto);
          } else {
            this.items.unshift(dtoToWallItem(dto));
          }
        }
      }

      // 2. Your own posts: upload anything not yet on the server, then load them all back.
      await this.syncMyTributes();

      // 3. Fetch mentors list from Backend
      const mentorsRes = await api.mentors.list();
      if (mentorsRes?.data && Array.isArray(mentorsRes.data)) {
        for (const m of mentorsRes.data) {
          const idx = this.mentors.findIndex(
            (p) => p.id === m.id || p.name.toLowerCase() === m.name.toLowerCase()
          );
          const mentorProfile: WallMentorProfile = {
            id: m.id,
            name: m.name,
            relationship: m.relationship || "Mentor",
            avatarUri: m.avatarUri || "",
            description: m.quote || "",
            meaningfulQuote: m.quote || "",
            coverColor: m.coverColor || "#54000E",
            itemCount: m.itemCount || 0,
            latestActivity: m.latestActivity || "Active",
            category: (m.category as any) || "school",
          };
          if (idx >= 0) {
            this.mentors[idx] = mentorProfile;
          } else {
            this.mentors.push(mentorProfile);
          }
        }
      }

      this.updateMentorCounts();
      this.notify();
    } catch {
      // Offline fallback: graceful degradation if server is momentarily unreachable
    }
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("Error in MemoryService listener:", err);
      }
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Merge any keepsakes created in the Tribute Studio / Preview flow
  public syncKeepsakes(): void {
    const keepsakes = tributeDraftService.getSavedKeepsakes();
    for (const keepsake of keepsakes) {
      let matchingMentor = this.mentors.find(
        (m) => m.name.toLowerCase() === keepsake.mentorName.toLowerCase()
      );
      if (!matchingMentor && keepsake.mentorName.trim()) {
        matchingMentor = {
          id: `mp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: keepsake.mentorName.trim(),
          relationship: keepsake.relationship || "Mentor",
          avatarUri: keepsake.photoUri || "",
          description: "",
          meaningfulQuote: keepsake.quote || undefined,
          itemCount: 0,
          latestActivity: "Just now",
          coverColor: "#54000E",
        };
        this.mentors.push(matchingMentor);
      }

      const keepsakeText = getItemContent(keepsake);
      const existingIndex = this.items.findIndex(
        (item) =>
          item.id === keepsake.id ||
          (this.serverIds.has(keepsake.id) && item.id === this.serverIds.get(keepsake.id)) ||
          (item.mentorName?.trim().toLowerCase() === keepsake.mentorName?.trim().toLowerCase() &&
           getItemContent(item) === keepsakeText)
      );
      const existing = existingIndex >= 0 ? this.items[existingIndex] : undefined;
      const tribute: WallTribute = {
        kind: "tribute",
        id: existing?.id || keepsake.id,
        mentorId: matchingMentor?.id,
        mentorName: keepsake.mentorName,
        relationship: keepsake.relationship,
        title: keepsake.customTitle || `A Tribute to ${keepsake.mentorName}`,
        photoUri: keepsake.photoUri,
        quote: keepsake.quote,
        story: keepsake.story,
        templateId: keepsake.templateId,
        frameStyle: keepsake.frameStyle,
        typographyStyle: keepsake.typographyStyle,
        createdAt: keepsake.createdAt || new Date().toISOString().split("T")[0],
        isPinned:
          this.pinOverrides.get(keepsake.id) ?? existing?.isPinned ?? false,
        isShared: (existing as WallTribute | undefined)?.isShared ?? false,
      };

      if (existingIndex >= 0) {
        this.items[existingIndex] = tribute;
      } else {
        this.items.unshift(tribute);
      }
    }
    this.updateMentorCounts();
  }

  private updateMentorCounts(): void {
    this.mentors = this.mentors.map((mentor) => {
      const count = this.items.filter(
        (i) =>
          i.mentorId === mentor.id ||
          i.mentorName.trim().toLowerCase() === mentor.name.trim().toLowerCase()
      ).length;
      return {
        ...mentor,
        itemCount: count,
      };
    });
  }

  public getAllMemories(): WallItem[] {
    this.syncKeepsakes();
    // Return unique items only (deduplicate by id and by mentorName + content)
    const seen = new Set<string>();
    const unique: WallItem[] = [];
    for (const item of this.items) {
      if (!item) continue;
      const text = getItemContent(item);
      const contentKey = `${item.mentorName?.trim().toLowerCase()}::${text.slice(0, 40)}`;
      if (seen.has(item.id) || (contentKey.length > 5 && seen.has(contentKey))) {
        continue;
      }
      seen.add(item.id);
      if (contentKey.length > 5) seen.add(contentKey);
      unique.push(item);
    }
    return unique;
  }

  public getUserCreatedItems(): WallItem[] {
    return this.items.filter((item) => this.userItemIds.has(item.id));
  }

  public getUserSavedItems(): WallItem[] {
    return this.items.filter(
      (item) =>
        item.isPinned &&
        (this.userItemIds.has(item.id) || this.pinOverrides.get(item.id) === true)
    );
  }

  public getMemoryById(id: string): WallItem | undefined {
    this.syncKeepsakes();
    return this.items.find((i) => i.id === id);
  }

  public getMemoriesByMentor(mentorIdOrName: string): WallItem[] {
    this.syncKeepsakes();
    const target = decodeURIComponent(mentorIdOrName).trim().toLowerCase();
    return this.items.filter(
      (i) =>
        (i.mentorId && i.mentorId.toLowerCase() === target) ||
        i.mentorName.trim().toLowerCase() === target
    );
  }

  public getAllMentorProfiles(): WallMentorProfile[] {
    this.syncKeepsakes();
    return [...this.mentors];
  }

  public getMentorProfileById(id: string): WallMentorProfile | undefined {
    this.syncKeepsakes();
    if (!id) return undefined;
    const cleanId = decodeURIComponent(id).trim().toLowerCase();
    const found =
      this.mentors.find((m) => m.id.toLowerCase() === cleanId) ||
      this.mentors.find((m) => m.name.trim().toLowerCase() === cleanId);

    if (found) return found;

    // If not found by ID or name directly, check if memories exist with this mentorName
    const matchingMemories = this.items.filter(
      (i) => i.mentorName.trim().toLowerCase() === cleanId
    );
    if (matchingMemories.length > 0) {
      const first = matchingMemories[0];
      let photo = "";
      if ("photoUri" in first && first.photoUri) photo = first.photoUri;
      else if ("imageUri" in first && first.imageUri) photo = first.imageUri;

      const dynamicProfile: WallMentorProfile = {
        id: `mp_${cleanId.replace(/\s+/g, "_")}`,
        name: first.mentorName,
        relationship: first.relationship || "Mentor",
        avatarUri: photo,
        description: "",
        meaningfulQuote: "quote" in first && first.quote ? first.quote : undefined,
        itemCount: matchingMemories.length,
        latestActivity: "Recently",
        coverColor: "#54000E",
      };
      this.mentors.push(dynamicProfile);
      matchingMemories.forEach((m) => {
        m.mentorId = dynamicProfile.id;
      });
      return dynamicProfile;
    }

    return undefined;
  }

  public updateMemory(updatedItem: WallItem): void {
    if (
      updatedItem.kind === "tribute" &&
      tributeDraftService.updateSavedKeepsake(updatedItem.id, {
        customTitle: updatedItem.title,
        story: updatedItem.story || "",
        quote: updatedItem.quote,
      })
    ) {
      return;
    }
    const idx = this.items.findIndex((i) => i.id === updatedItem.id);
    if (idx >= 0) {
      this.items[idx] = updatedItem;
      this.updateMentorCounts();
      this.notify();
      if (this.userItemIds.has(updatedItem.id)) this.persistUserItems();
    }
  }

  public deleteMemory(id: string): boolean {
    const existing = this.items.find((item) => item.id === id);
    if (existing?.kind === "tribute") {
      tributeDraftService.removeSavedKeepsake(id);
    }
    const initialLen = this.items.length;
    this.items = this.items.filter((i) => i.id !== id);
    this.userItemIds.delete(id);
    this.pinOverrides.delete(id);
    if (this.items.length !== initialLen) {
      this.updateMentorCounts();
      this.notify();
      this.persistUserItems();
      const serverId = this.serverIdFor(id) || id;
      if (serverId) api.tributes.delete(serverId).catch(() => {});
      this.serverIds.delete(id);
      return true;
    }
    return false;
  }

  public togglePin(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.isPinned = !item.isPinned;
      this.pinOverrides.set(id, item.isPinned);
      this.notify();
      this.persistUserItems();
      const serverId = this.serverIdFor(id);
      if (serverId) api.tributes.togglePin(serverId).catch(() => {});
    }
  }

  public addMemory(
    item: WallItem,
    meta?: {
      recipientEmail?: string;
      sendDedicationEmail?: boolean;
      signature?: string;
      salutation?: string;
      signoff?: string;
      privacy?: "PUBLIC" | "PRIVATE";
    }
  ): string {
    const existingIndex = this.items.findIndex((saved) => saved.id === item.id);
    const mentor =
      this.mentors.find((profile) => profile.name.toLowerCase() === item.mentorName.toLowerCase()) ??
      (item.mentorName.trim()
        ? {
            id: `mp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: item.mentorName.trim(),
            relationship: item.relationship || "Mentor",
            avatarUri:
              ("photoUri" in item && item.photoUri) ||
              ("imageUri" in item && item.imageUri) ||
              "",
            description: "",
            itemCount: 0,
            latestActivity: "Just now",
            coverColor: "#54000E",
          }
        : undefined);
    if (mentor && !this.mentors.some((profile) => profile.id === mentor.id)) {
      this.mentors.push(mentor);
    }
    const newItem = { ...item, mentorId: item.mentorId || mentor?.id } as WallItem;
    if (existingIndex >= 0) {
      this.items[existingIndex] = newItem;
    } else {
      this.items.unshift(newItem);
    }
    this.userItemIds.add(newItem.id);
    this.updateMentorCounts();
    this.notify();
    this.persistUserItems();

    if (meta?.privacy === "PRIVATE") this.privateIds.add(newItem.id);
    else this.privateIds.delete(newItem.id);
    this.persistUserItems();
    // Upload media, then save to the backend (retried later if offline or signed out).
    void this.pushToBackend(newItem.id, meta);

    return newItem.id;
  }

  public addMentor(input: {
    name: string;
    relationship: string;
    description?: string;
    meaningfulQuote?: string;
  }): WallMentorProfile {
    const name = input.name.trim();
    const existing = this.mentors.find(
      (mentor) => mentor.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing;

    const mentor: WallMentorProfile = {
      id: `mp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      relationship: input.relationship.trim() || "Mentor",
      avatarUri: "",
      description: input.description?.trim() || "",
      meaningfulQuote: input.meaningfulQuote?.trim() || undefined,
      itemCount: 0,
      latestActivity: "Just added",
      coverColor: "#54000E",
    };
    this.mentors.unshift(mentor);
    this.notify();

    // Asynchronously synchronize to Spring Boot backend + Neon DB
    api.mentors
      .create({
        name: mentor.name,
        relationship: mentor.relationship,
        quote: mentor.meaningfulQuote,
        category: "school",
      })
      .then((res) => {
        if (res?.data?.id) {
          mentor.id = res.data.id;
        }
      })
      .catch((err) => {
        console.debug("Backend mentor sync error:", err);
      });

    return { ...mentor };
  }

  public updateMentorProfile(
    updated: Partial<WallMentorProfile> & { id: string }
  ): void {
    const idx = this.mentors.findIndex((m) => m.id === updated.id);
    if (idx >= 0) {
      const oldName = this.mentors[idx].name;
      this.mentors[idx] = { ...this.mentors[idx], ...updated };
      // Sync mentorName and relationship across all associated memories
      if (updated.name && updated.name !== oldName) {
        this.items.forEach((item) => {
          if (
            item.mentorId === updated.id ||
            item.mentorName.trim().toLowerCase() === oldName.trim().toLowerCase()
          ) {
            item.mentorName = updated.name!;
            if (updated.relationship) {
              item.relationship = updated.relationship;
            }
          }
        });
      }
      if (updated.name || updated.relationship) {
        tributeDraftService.updateMentorReferences(
          oldName,
          updated.name || oldName,
          updated.relationship && isTributeRelationship(updated.relationship)
            ? updated.relationship
            : undefined
        );
      }
      this.updateMentorCounts();
      this.notify();
    }
  }

  /** Backend id for an item, or null for local-only items not yet uploaded. */
  private serverIdFor(id: string): string | null {
    const mapped = this.serverIds.get(id);
    if (mapped) return mapped;
    // Items loaded from the server already use the server id.
    return id.startsWith("trib_") ? id : null;
  }

  /**
   * Uploads an item's photos/videos/voice note, then creates it on the backend.
   * On success the local item keeps its id but switches to the server's media URLs.
   */
  private async pushToBackend(
    id: string,
    meta?: { recipientEmail?: string; sendDedicationEmail?: boolean; signature?: string; salutation?: string; signoff?: string; privacy?: "PUBLIC" | "PRIVATE" }
  ): Promise<void> {
    if (this.pushing.has(id) || this.serverIdFor(id)) return;
    const token = await getAuthToken().catch(() => null);
    if (!token) return; // retried by syncMyTributes() after login
    const item = this.items.find((i) => i.id === id);
    if (!item) return;
    this.pushing.add(id);
    try {
      const anyItem = item as any;
      const cover = anyItem.photoUri || anyItem.imageUri || "";
      const photo = await ensureRemoteMedia(cover, "photo");
      const extraImages = (
        await Promise.all(((anyItem.additionalImages as string[]) || []).map((u) => ensureRemoteMedia(u, "photo")))
      ).filter((u): u is string => !!u);
      const videos = (
        await Promise.all(((anyItem.videoUris as string[]) || []).map((u) => ensureRemoteMedia(u, "video")))
      ).filter((u): u is string => !!u);
      const audio = await ensureRemoteMedia(anyItem.audioUri, "audio");

      const storyText = anyItem.story || anyItem.letterBody || anyItem.excerpt || anyItem.preview || "";
      const res = await api.tributes.create({
        mentorName: item.mentorName,
        kind: item.kind,
        title: anyItem.title || anyItem.lessonTitle || item.mentorName,
        relationship: item.relationship || "Mentor",
        photoUri: photo || "",
        additionalImages: extraImages,
        videoUris: videos,
        audioUri: audio,
        quote: anyItem.quote || "",
        story: storyText,
        excerpt: anyItem.excerpt || anyItem.preview || storyText.slice(0, 200),
        salutation: anyItem.salutation || meta?.salutation,
        signoff: anyItem.signoff || meta?.signoff,
        signature: anyItem.signature || meta?.signature,
        recipientEmail: meta?.recipientEmail,
        sendDedicationEmail: meta?.sendDedicationEmail,
        lessonCarried: anyItem.lessonCarried || "",
        momentToRemember: anyItem.momentToRemember || "",
        year: anyItem.year,
        emotion: anyItem.emotion,
        emotionColor: anyItem.emotionColor,
        mood: anyItem.mood,
        templateId: anyItem.templateId,
        frameStyle: anyItem.frameStyle,
        typographyStyle: anyItem.typographyStyle,
        layoutStyle: anyItem.layoutStyle || anyItem.paperStyle,
        privacy: this.privateIds.has(id) ? "PRIVATE" : "PUBLIC",
        isShared: !this.privateIds.has(id),
        isPinned: item.isPinned || false,
      });
      const serverId: string | undefined = res?.data?.id;
      if (!serverId) return;
      this.serverIds.set(id, serverId);

      // Swap local file paths for the uploaded URLs so the post works everywhere.
      const current = this.items.find((i) => i.id === id) as any;
      if (current) {
        if (photo) {
          if ("photoUri" in current || item.kind === "tribute") current.photoUri = photo;
          if ("imageUri" in current || item.kind !== "tribute") current.imageUri = photo;
        }
        if (extraImages.length) current.additionalImages = extraImages;
        if (videos.length) current.videoUris = videos;
        if (audio) current.audioUri = audio;
      }
      this.persistUserItems();
      this.notify();
    } catch (error) {
      console.debug("Post not synced yet; will retry:", error);
    } finally {
      this.pushing.delete(id);
    }
  }

  /** Pushes unsynced posts, then merges the user's posts from the server. */
  private async syncMyTributes(): Promise<void> {
    const token = await getAuthToken().catch(() => null);
    if (!token) return;

    for (const id of [...this.userItemIds]) {
      if (!this.serverIdFor(id)) await this.pushToBackend(id);
    }

    const res = await api.tributes.myTributes();
    if (!Array.isArray(res?.data)) return;
    const mapped = new Set(this.serverIds.values());
    let changed = false;
    for (const dto of res.data) {
      if (mapped.has(dto.id)) continue; // already here under its local id
      const index = this.items.findIndex((i) => i.id === dto.id);
      const item = dtoToWallItem(dto);
      if (index >= 0) this.items[index] = item;
      else this.items.unshift(item);
      this.userItemIds.add(dto.id);
      changed = true;
    }
    if (changed) {
      this.updateMentorCounts();
      this.persistUserItems();
    }
  }

  /** Called on sign-out: forget this user's posts so the next account starts clean. */
  public async clearUserData(): Promise<void> {
    this.items = this.items.filter((item) => !this.userItemIds.has(item.id));
    this.userItemIds.clear();
    this.serverIds.clear();
    this.privateIds.clear();
    this.pinOverrides.clear();
    this.updateMentorCounts();
    this.notify();
    await AsyncStorage.removeItem("@honour-your-mentor/memories").catch(() => {});
  }

  private persistUserItems(): void {
    const userItems = this.items.filter((item) => this.userItemIds.has(item.id));
    const serialized = JSON.stringify({
      items: userItems,
      pinOverrides: Object.fromEntries(this.pinOverrides),
      serverIds: Object.fromEntries(this.serverIds),
      privateIds: [...this.privateIds],
    });
    this.persistenceQueue = this.persistenceQueue
      .catch(() => undefined)
      .then(() =>
        AsyncStorage.setItem("@honour-your-mentor/memories", serialized)
      )
      .catch((error: unknown) => {
        console.error("Unable to persist memories:", error);
      });
  }

  private loadUserItems(userItems: WallItem[]): void {
    const DUMMY_IDS = new Set(["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "mem1", "mem2", "mem3", "mem4", "mp1", "mp2", "mp3", "mp4", "mp5"]);
    const cleaned = userItems.filter(
      (item) =>
        !DUMMY_IDS.has(item.id) &&
        !(item.mentorName === "Mrs. Anita Sharma" && item.id.startsWith("t")) &&
        !(item.mentorName === "Dr. David Mitchell" && item.id.startsWith("t")) &&
        !(item.mentorName === "Vikram Rao" && item.id.startsWith("t"))
    );
    this.userItemIds = new Set(cleaned.map((item) => item.id));
    for (const item of cleaned) {
      const itemText = getItemContent(item);
      const index = this.items.findIndex(
        (saved) =>
          saved.id === item.id ||
          (saved.mentorName?.trim().toLowerCase() === item.mentorName?.trim().toLowerCase() &&
           getItemContent(saved) === itemText)
      );
      if (index >= 0) this.items[index] = item;
      else this.items.unshift(item);
    }
  }
}

function isStoredWallItem(value: unknown): value is WallItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<WallItem>;
  return (
    typeof item.id === "string" &&
    typeof item.mentorName === "string" &&
    typeof item.createdAt === "string" &&
    ["tribute", "memory", "letter", "lesson", "milestone"].includes(
      String(item.kind)
    )
  );
}

export const memoryService = new MemoryService();
