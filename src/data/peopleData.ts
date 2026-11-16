/**
 * Community members and their public tributes.
 */
import type { MemoryData } from "@/components/home/MemoryCard";

export interface Person {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  bio: string;
  /** Follower count before the current user's own follow is counted. */
  followerCount: number;
  followingCount: number;
  /** Short reason shown on suggestion cards. */
  suggestionReason?: string;
}

export const PEOPLE: Person[] = [];

/** Public tributes written by each person, keyed by person id. */
export const PEOPLE_TRIBUTES: Record<string, MemoryData[]> = {};
