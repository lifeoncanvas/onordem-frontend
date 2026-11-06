import { InspirationCardItem, TributeRelationship } from "@/types/create";

export const DEFAULT_SAMPLE_PORTRAIT =
  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80";

export const HERO_EDITORIAL_IMAGE =
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1000&auto=format&fit=crop&q=80";

export const TRIBUTE_RELATIONSHIPS: TributeRelationship[] = [
  "Teacher",
  "Parent",
  "Coach",
  "Friend",
  "Leader",
  "Other",
];

export const INSPIRATION_STORY_CARDS: InspirationCardItem[] = [
  {
    id: "lesson",
    title: "The Lesson That Stayed",
    subtitle: "A lesson that continues to guide you.",
    promptText:
      "What was the single piece of wisdom or tough love they gave you that you still live by today?",
    imageUrl:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80",
    tag: "GUIDING WISDOM",
  },
  {
    id: "moment",
    title: "A Moment to Remember",
    subtitle: "A moment you wish you could relive.",
    promptText:
      "Describe the quiet moment—where you were, their expression, and what made that ordinary hour unforgettable.",
    imageUrl:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80",
    tag: "LIVING KEEPSAKE",
  },
  {
    id: "growth",
    title: "The Person Behind My Growth",
    subtitle: "Someone who helped you become who you are.",
    promptText:
      "What did they see in you before you had the courage or confidence to see it in yourself?",
    imageUrl:
      "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&auto=format&fit=crop&q=80",
    tag: "QUIET BELIEF",
  },
];

export const STARTER_QUESTION_PROMPT =
  "What is one thing you learned from them that you will carry forever?";
