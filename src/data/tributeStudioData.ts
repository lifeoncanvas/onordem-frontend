import {
  TemplateOption,
  TributeDecorationId,
  TributeFrameStyle,
  TributeTypographyStyle,
} from "@/types/create";
import { AppFonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export const STUDIO_TEMPLATES: TemplateOption[] = [
  {
    id: "editorial",
    name: "Editorial Portrait",
    subtitle: "Magazine cover with bold typography",
    thumbnail:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80",
    icon: "newspaper-outline",
  },
  {
    id: "instant",
    name: "Instant Photo",
    subtitle: "Classic Polaroid with handwritten flair",
    thumbnail:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&auto=format&fit=crop&q=80",
    icon: "camera-outline",
  },
  {
    id: "layered",
    name: "Layered Memories",
    subtitle: "Warm scrapbook with overlapping papers",
    thumbnail:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=80",
    icon: "layers-outline",
  },
  {
    id: "minimal",
    name: "Minimal Keepsake",
    subtitle: "Museum matte with delicate quotes",
    thumbnail:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&auto=format&fit=crop&q=80",
    icon: "square-outline",
  },
  {
    id: "journal",
    name: "Scrapbook Journal",
    subtitle: "Lined parchment & ribbon bookmark",
    thumbnail:
      "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=400&auto=format&fit=crop&q=80",
    icon: "journal-outline",
  },
  {
    id: "collage",
    name: "Photo Collage",
    subtitle: "Dual moment story presentation",
    thumbnail:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    icon: "images-outline",
  },
];

export interface FrameOption {
  id: TributeFrameStyle;
  name: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const STUDIO_FRAMES: FrameOption[] = [
  { id: "clean", name: "Clean Border", badge: "MINIMAL", icon: "square-outline" },
  { id: "instant", name: "Instant Polaroid", badge: "KEEPSAKE", icon: "camera-outline" },
  { id: "layered-deckle", name: "Deckle Paper", badge: "VINTAGE", icon: "document-text-outline" },
  { id: "gold-leaf", name: "Gold Foil", badge: "ROYAL", icon: "sparkles-outline" },
  { id: "oval-vignette", name: "Cameo Oval", badge: "CLASSIC", icon: "ellipse-outline" },
];

export const CURATED_QUOTES = [
  "Thank you for believing in me before I believed in myself.",
  "Some lessons stay with us for a lifetime.",
  "Your guidance became part of who I am.",
  "The best part of your teaching is what I carry forward.",
  "Because of you, I learned to see what was possible.",
];

export interface TypographyOption {
  id: TributeTypographyStyle;
  name: string;
  description: string;
  fontFamily: string;
}

export const TYPOGRAPHY_OPTIONS: TypographyOption[] = [
  { id: "serif", name: "Literary", description: "Timeless & thoughtful", fontFamily: AppFonts.body },
  { id: "display", name: "Bold Display", description: "Prominent & majestic", fontFamily: AppFonts.body },
  { id: "handwritten", name: "Intimate", description: "Warm & personal", fontFamily: AppFonts.handwritten },
  { id: "modern", name: "Clean Modern", description: "Crisp & contemporary", fontFamily: AppFonts.body },
];

export interface DecorationOption {
  id: TributeDecorationId;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: string;
}

export const DECORATION_OPTIONS: DecorationOption[] = [
  { id: "wax-seal", name: "Wax Seal", icon: "heart", category: "Emblem" },
  { id: "gold-ribbon", name: "Gold Ribbon", icon: "bookmark", category: "Accent" },
  { id: "photo-corners", name: "Brass Corners", icon: "scan-outline", category: "Mount" },
  { id: "washi-tape", name: "Washi Tape", icon: "cut-outline", category: "Scrapbook" },
  { id: "botanical-branch", name: "Laurel Branch", icon: "leaf-outline", category: "Botanical" },
  { id: "sparkle-star", name: "Star Sparkle", icon: "sparkles", category: "Celestial" },
];
