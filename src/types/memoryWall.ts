

export type WallCategory =
  | "all"
  | "school"
  | "study"
  | "work"
  | "life"
  | "tributes"
  | "memories"
  | "letters"
  | "lessons"
  | "milestones";

export type WallItemType = "tribute" | "memory" | "letter" | "lesson" | "milestone";

export type MilestoneType =
  | "first-meeting"
  | "graduation"
  | "breakthrough"
  | "farewell"
  | "reunion"
  | "life-change";

// ───────────────────────────────────────────────────────────────
// Wall Items
// ───────────────────────────────────────────────────────────────

export interface WallTribute {
  kind: "tribute";
  id: string;
  mentorName: string;
  mentorId?: string;
  relationship: string;
  photoUri: string;
  additionalImages?: string[];
  quote: string;
  title?: string;
  story?: string;
  lessonCarried?: string;
  momentToRemember?: string;
  achievements?: string[];
  createdAt: string;
  templateId: string;
  frameStyle?: string;
  typographyStyle?: string;
  isPinned?: boolean;
  isShared?: boolean;
}

export interface WallMemory {
  kind: "memory";
  id: string;
  title: string;
  mentorName: string;
  mentorId?: string;
  relationship?: string;
  excerpt: string;
  story?: string;
  imageUri?: string;
  additionalImages?: string[];
  /** Videos attached from the photo library or camera. */
  videoUris?: string[];
  audioUri?: string;
  audioDuration?: number;
  year: string;
  emotion: string;
  emotionColor: string;
  quote?: string;
  layoutStyle?: string;
  lessonCarried?: string;
  momentToRemember?: string;
  achievements?: string[];
  createdAt: string;
  isPinned?: boolean;
}

export interface WallLetter {
  kind: "letter";
  id: string;
  title: string;
  mentorName: string;
  mentorId?: string;
  relationship?: string;
  preview: string;
  letterBody?: string;
  salutation?: string;
  signoff?: string;
  signature?: string;
  paperStyle?: string;
  envelopeStyle?: string;
  date?: string;
  wordCount: number;
  mood: string;
  quote?: string;
  imageUri?: string;
  additionalImages?: string[];
  lessonCarried?: string;
  momentToRemember?: string;
  achievements?: string[];
  createdAt: string;
  isPinned?: boolean;
}

export interface WallLesson {
  kind: "lesson";
  id: string;
  lessonTitle: string;
  quote: string;
  mentorName: string;
  mentorId?: string;
  relationship?: string;
  category: string;
  story?: string;
  imageUri?: string;
  layoutStyle?: string;
  decorations?: string[];
  lessonCarried?: string;
  momentToRemember?: string;
  achievements?: string[];
  additionalImages?: string[];
  createdAt: string;
  isPinned?: boolean;
}

export interface WallMilestone {
  kind: "milestone";
  id: string;
  title: string;
  description: string;
  story?: string;
  mentorName: string;
  mentorId?: string;
  relationship?: string;
  year: string;
  type: MilestoneType;
  accentColor: string;
  quote?: string;
  lessonCarried?: string;
  momentToRemember?: string;
  achievements?: string[];
  imageUri?: string;
  additionalImages?: string[];
  createdAt: string;
  isPinned?: boolean;
}

export type WallItem =
  | WallTribute
  | WallMemory
  | WallLetter
  | WallLesson
  | WallMilestone;

// ───────────────────────────────────────────────────────────────
// Mentor Profile (grouped view)
// ───────────────────────────────────────────────────────────────

export interface WallMentorProfile {
  id: string;
  name: string;
  relationship: string;
  avatarUri: string;
  description?: string;
  meaningfulQuote?: string;
  itemCount: number;
  latestActivity: string;
  coverColor: string;
  category?: "school" | "study" | "work" | "life";
  duration?: string;
  trait?: string;
  traitIcon?: any;
  lessonLabel?: string;
  lastThanked?: string;
}

// ───────────────────────────────────────────────────────────────
// Filter Tabs
// ───────────────────────────────────────────────────────────────

export interface WallFilterTab {
  key: WallCategory;
  label: string;
  icon?: string;
  color?: string;
  count?: number;
}
