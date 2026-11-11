/**
 * Feed: your own posts + public posts from people you follow, newest first.
 *
 * Today this is assembled on the device (your items from memoryService, other
 * people's from the mock directory). When the backend gains follow + feed
 * endpoints (GET /feed?following=true), swap getFeed() for that call: the
 * FeedPost shape is what the UI renders.
 */
import type { WallItem } from "@/types/memoryWall";
import type { MemoryData, MemoryType } from "@/components/home/MemoryCard";
import { memoryService } from "./memoryService";
import { followService } from "./followService";
import { PEOPLE, PEOPLE_TRIBUTES } from "@/data/peopleData";
import type { UserProfile } from "./userProfileService";

export interface FeedAuthor {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isMe: boolean;
}

export interface FeedPost {
  /** Unique across authors. */
  key: string;
  author: FeedAuthor;
  memory: MemoryData;
  /** Epoch ms used for ordering. */
  timestamp: number;
  /** Set for your own posts: opens /memory-detail/[id]. */
  wallItemId?: string;
}

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

function displayDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : MONTH_YEAR.format(d);
}

/** Converts anything you've created (memory, appreciation, letter, lesson, milestone) into a post. */
export function wallItemToMemory(item: WallItem): MemoryData {
  const base = {
    id: item.id,
    mentorName: item.mentorName,
    date: displayDate(item.createdAt),
    createdAt: item.createdAt,
    likes: 0,
  };

  switch (item.kind) {
    case "memory": {
      const video = item.videoUris?.[0];
      const type: MemoryType = item.imageUri ? "photo" : video ? "video" : item.audioUri ? "voice" : "gratitude";
      return {
        ...base,
        type,
        title: item.title,
        content: item.story || item.excerpt,
        image: item.imageUri,
        moreImages: item.additionalImages,
        videoUri: video,
        audioUri: item.audioUri,
        audioSeconds: item.audioDuration,
        audioDuration: item.audioDuration ? formatSeconds(item.audioDuration) : undefined,
      };
    }
    case "tribute":
      return {
        ...base,
        type: item.photoUri ? "photo" : "tribute",
        title: item.title || `Appreciation for ${item.mentorName}`,
        content: item.quote || item.story || "",
        image: item.photoUri || undefined,
        moreImages: item.additionalImages,
      };
    case "letter":
      return {
        ...base,
        type: item.imageUri ? "photo" : "gratitude",
        title: item.title,
        content: item.preview || item.letterBody || "",
        image: item.imageUri,
      };
    case "lesson":
      return {
        ...base,
        type: item.imageUri ? "photo" : "lesson",
        title: item.lessonTitle,
        content: item.quote,
        image: item.imageUri,
      };
    case "milestone":
      return {
        ...base,
        type: item.imageUri ? "photo" : "achievement",
        title: item.title,
        content: item.description,
        image: item.imageUri,
      };
  }
}

function formatSeconds(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "Mar 2022" → epoch ms (1st of that month). */
function parseMonthYear(date: string): number {
  const t = Date.parse(`1 ${date}`);
  return Number.isNaN(t) ? 0 : t;
}

/** Your own posts, newest first. */
export function getMyPosts(): MemoryData[] {
  return memoryService
    .getUserCreatedItems()
    .map(wallItemToMemory)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

export function getFeed(me: UserProfile): FeedPost[] {
  const myAuthor: FeedAuthor = {
    id: "me",
    name: me.name,
    username: me.username,
    avatar: me.avatarUri,
    isMe: true,
  };

  const mine: FeedPost[] = memoryService.getUserCreatedItems().map((item) => ({
    key: `me-${item.id}`,
    author: myAuthor,
    memory: wallItemToMemory(item),
    timestamp: Date.parse(item.createdAt) || 0,
    wallItemId: item.id,
  }));

  const followed: FeedPost[] = PEOPLE.filter((p) => followService.isFollowing(p.id)).flatMap((person) =>
    (PEOPLE_TRIBUTES[person.id] ?? []).map((memory) => ({
      key: `${person.id}-${memory.id}`,
      author: {
        id: person.id,
        name: person.name,
        username: person.username,
        avatar: person.avatar,
        isMe: false,
      },
      memory,
      timestamp: memory.createdAt ? Date.parse(memory.createdAt) : parseMonthYear(memory.date),
    }))
  );

  const allPosts = [...mine, ...followed];
  const uniquePosts = Array.from(new Map(allPosts.map((p) => [p.key, p])).values());
  return uniquePosts.sort((a, b) => b.timestamp - a.timestamp);
}
