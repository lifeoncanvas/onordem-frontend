import {
  WallFilterTab,
  WallItem,
  WallMentorProfile,
} from "@/types/memoryWall";
import type { JourneyNode } from "@/components/MemoryWall/JourneyTogether";

// ─── Mentor Profiles ─────────────────────────────────────────────────────────

export const WALL_MENTOR_PROFILES: WallMentorProfile[] = [];

// ─── Wall Items ──────────────────────────────────────────────────────────────

export const WALL_ITEMS: WallItem[] = [];

// ─── Journey Together Nodes ──────────────────────────────────────────────────

export const JOURNEY_NODES: JourneyNode[] = [];

export function getJourneyNodes(items: WallItem[]): JourneyNode[] {
  return JOURNEY_NODES.flatMap((node) => {
    const item = items.find((candidate) => candidate.id === node.memoryId);
    if (!item) return [];

    const title =
      "title" in item && item.title
        ? item.title
        : "lessonTitle" in item
          ? item.lessonTitle
          : node.title;
    const snippet =
      ("story" in item && item.story) ||
      ("description" in item && item.description) ||
      ("excerpt" in item && item.excerpt) ||
      node.snippet;

    return [{
      ...node,
      year: "year" in item ? item.year : node.year,
      title,
      mentorName: item.mentorName,
      snippet,
      isMilestone: item.kind === "milestone",
    }];
  });
}

// ─── Filter Tabs ─────────────────────────────────────────────────────────────

export const WALL_FILTER_TABS: WallFilterTab[] = [
  { key: "all", label: "All", icon: "apps", count: 0 },
  { key: "tributes", label: "Appreciation", icon: "heart", count: 0 },
  { key: "memories", label: "Memories", icon: "images", count: 0 },
  { key: "letters", label: "Letters", icon: "mail", count: 0 },
  { key: "lessons", label: "Lessons", icon: "bulb", count: 0 },
  { key: "milestones", label: "Milestones", icon: "flag", count: 0 },
];
