export type RelationshipType =
  | "all"
  | "Teachers"
  | "Parents"
  | "Coaches"
  | "Friends"
  | "Leaders"
  | "Others";

export type FeelingThemeId =
  | "believed"
  | "advice"
  | "second_chance"
  | "kindness";

export interface Story {
  id: string;
  title: string;
  relationship: "Teacher" | "Parent" | "Coach" | "Friend" | "Leader" | "Mentor" | "Other";
  relationshipCategory: RelationshipType;
  feelingThemeId?: FeelingThemeId;
  excerpt: string;
  fullStory: string;
  paragraphs?: string[];
  author: string;
  authorRole?: string;
  readTime: string;
  publishedDate?: string;
  imageUrl: string;
  isFeatured?: boolean;
  isBookmarked?: boolean;
  keyLesson?: string;
  reflectionQuestion?: string;
  reflectionContext?: string;
  keywords: string[];
  relatedStoryIds?: string[];
}

export interface FeelingPromptItem {
  id: FeelingThemeId;
  title: string;
  subtitle: string;
  iconName: string;
}

export interface CategoryItem {
  key: RelationshipType;
  label: string;
  iconName: string;
}

export interface LessonQuote {
  id: string;
  quote: string;
  attribution: string;
  storyTitle: string;
  storyId: string;
  isSaved?: boolean;
}
