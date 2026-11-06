import { Ionicons } from "@expo/vector-icons";

export type CreationType =
  | "tribute"
  | "appreciation"
  | "note"
  | "letter"
  | "memo"
  | "memory"
  | "lesson";

export interface CreationOptionItem {
  id: CreationType;
  title: string;
  subtitle: string;
  purpose: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  secondaryColor: string;
  badgeLabel: string;
  vibe: string;
}

export interface InspirationPrompt {
  id: string;
  question: string;
  supportingText: string;
  categoryTag: string;
  suggestedType: CreationType;
  accentTone: string;
}

export interface CreationDraft {
  id: string;
  type: CreationType;
  title: string;
  mentorName: string;
  previewText: string;
  lastEdited: string;
  wordCount?: number;
  dateKey?: string;
  formData?: CreationFormState;
}

export interface CreationFormState {
  type: CreationType;
  mentorName: string;
  relationship: string;
  title: string;
  body: string;
  quote?: string;
  emotionalTag?: string;
  dateOrYear?: string;
  greeting?: string;
  closing?: string;
  signature?: string;
  photoUri?: string;
  layoutStyle?: string;
  decorations?: string[];
}

export type TributeRelationship =
  | "Teacher"
  | "Parent"
  | "Coach"
  | "Friend"
  | "Leader"
  | "Other"
  | "Grandparent"
  | "Professor"
  | "Colleague"
  | "Spiritual Guide"
  | "Other Mentor"
  | "Literature Teacher"
  | "Research Advisor"
  | "Engineering Director"
  | "Art & Design Coach"
  | "Friend & Mentor";

export interface InspirationCardItem {
  id: string;
  title: string;
  subtitle: string;
  promptText: string;
  imageUrl: string;
  tag: string;
}

export interface TributePayload {
  id: string;
  mentorName: string;
  relationship: TributeRelationship;
  photoUri: string | null;
  isCustomPhoto: boolean;
  story: string;
  inspirationPrompt?: string;
  createdAt: string;
}

export interface TributeDraft {
  id: string;
  payload: TributePayload;
  designState: TributeDesignState | null;
  updatedAt: string;
}

export type TributeTemplateId =
  | "editorial"
  | "instant"
  | "layered"
  | "minimal"
  | "journal"
  | "collage";

export type TributeFrameStyle =
  | "clean"
  | "instant"
  | "layered-deckle"
  | "gold-leaf"
  | "oval-vignette";

export type TributeTypographyStyle =
  | "serif"
  | "display"
  | "handwritten"
  | "modern";

export type TributeDecorationId =
  | "wax-seal"
  | "gold-ribbon"
  | "photo-corners"
  | "washi-tape"
  | "botanical-branch"
  | "sparkle-star";

export interface TributeDesignState {
  id: string;
  mentorName: string;
  relationship: TributeRelationship;
  photoUri: string;
  isCustomPhoto: boolean;
  story: string;
  quote: string;
  customTitle: string;
  templateId: TributeTemplateId;
  frameStyle: TributeFrameStyle;
  typographyStyle: TributeTypographyStyle;
  textAlign: "left" | "center";
  decorations: TributeDecorationId[];
  createdAt: string;
}

export interface TemplateOption {
  id: TributeTemplateId;
  name: string;
  subtitle: string;
  thumbnail: string;
  icon: keyof typeof Ionicons.glyphMap;
}
