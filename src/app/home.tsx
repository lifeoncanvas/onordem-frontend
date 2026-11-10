import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Design System Tokens
import { AppFonts, Layout, Palette, SystemColors, TextStyles } from "@/constants/theme";

// Modular Reusable Components
import SectionHeader from "../components/home/SectionHeader";
import MentorCard, { MentorData } from "../components/home/MentorCard";
import type { MemoryData } from "../components/home/MemoryCard";
import MemoryCollage from "../components/home/MemoryCollage";
import PeopleSuggestions from "../components/home/PeopleSuggestions";
import FollowingFeed from "../components/home/FollowingFeed";
import { useT, type StringKey } from "@/i18n";
import VoiceNoteCard, { VoiceNoteData } from "../components/home/VoiceNoteCard";
import GratitudeCard, { GratitudePostData } from "../components/home/GratitudeCard";
import AchievementCard, { AchievementData } from "../components/home/AchievementCard";
import AchievementDetailModal from "../components/home/AchievementDetailModal";
import TimelinePreview, { TimelineNode } from "../components/home/TimelinePreview";
import QuickAction from "../components/home/QuickAction";
import BottomNavigation, { NavTab } from "../components/home/BottomNavigation";
import AddMemoryModal from "../components/home/AddMemoryModal";
import VoiceRecorderModal, {
  RecordedVoiceNote,
} from "../components/home/VoiceRecorderModal";
import { memoryService } from "@/services/memoryService";
import { userProfileService } from "@/services/userProfileService";
import type { UserProfile } from "@/services/userProfileService";
import { getAuthToken } from "@/services/api";
import type { WallItem, WallMemory } from "@/types/memoryWall";
import { useIsBrowser } from "@/hooks/useIsBrowser";
import { useQrModal } from "@/context/QrModalContext";

// Mentors & Feed Data (Populated dynamically from user data & backend)
const MENTORS_DATA: MentorData[] = [];
const MEMORIES_DATA: MemoryData[] = [];
const VOICE_NOTES: VoiceNoteData[] = [];

const MEMORY_WALL_FILTERS = [
  { id: "all", label: "All Memories", icon: "sparkles-outline", color: Palette.accentSky },
  { id: "photo", label: "Photos", icon: "camera-outline", color: Palette.accentLavender },
  { id: "gratitude", label: "Gratitude", icon: "chatbubble-ellipses-outline", color: Palette.accentPink },
  { id: "voice", label: "Audio", icon: "mic-outline", color: Palette.accentPeach },
  { id: "achievement", label: "Milestones", icon: "trophy-outline", color: Palette.accentMint },
  { id: "lesson", label: "Lessons", icon: "book-outline", color: Palette.accentAmber },
] as const;

interface MemoryFilterPillProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isActive: boolean;
  onPress: () => void;
}

function MemoryFilterPill({
  label,
  icon,
  color,
  isActive,
  onPress,
}: MemoryFilterPillProps) {
  const scale = React.useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.04 : 1,
      speed: 24,
      bounciness: 5,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [isActive, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[styles.filterPill, isActive && styles.filterPillActive]}
        accessibilityRole="button"
        accessibilityLabel={`${label} filter`}
        accessibilityState={{ selected: isActive }}
      >
        <Ionicons
          name={icon}
          size={14}
          color={isActive ? SystemColors.inverseLabel : color}
        />
        <Text
          style={[
            styles.filterText,
            { color: isActive ? SystemColors.inverseLabel : color },
            isActive && styles.filterTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function getGreetingKey(date = new Date()): StringKey {
  const hour = date.getHours();
  if (hour < 12) return "home.greeting.morning";
  if (hour < 18) return "home.greeting.afternoon";
  return "home.greeting.evening";
}

function formatAudioDuration(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

// Mock Data: Global Gratitude Feed
const GRATITUDE_POSTS: GratitudePostData[] = [
  {
    id: "gp1",
    authorName: "Rohan Varma",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    mentorName: "Coach Armstrong",
    location: "Bangalore, India",
    message: "10 years ago today, you paid for my running shoes when my family could not. Today I finished my first ultra-marathon.",
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600&auto=format&fit=crop&q=80",
    likes: 248,
    commentsCount: 34,
    timeAgo: "2h ago",
  },
  {
    id: "gp2",
    authorName: "Maya Lin",
    authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    mentorName: "Prof. Kenneth Clark",
    location: "London, UK",
    message: "Thank you for teaching me that architecture isn't about stone, but about how humans breathe inside space.",
    likes: 182,
    commentsCount: 19,
    timeAgo: "5h ago",
  },
];

// Mock Data: Achievements Inspired
const ACHIEVEMENTS_DATA: AchievementData[] = [
  {
    id: "ach1",
    badgeType: "graduation",
    title: "Master of Science in AI",
    mentorName: "Dr. David Mitchell",
    mentorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    mentorRole: "Research Advisor",
    date: "June 2024",
    location: "Stanford Memorial Auditorium",
    category: "Academic Milestone",
    highlightStat: "Honors with Distinction",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
    story: "Wrote the dedication page to you, who spent Sunday mornings showing me how to write clear equations and never let me settle for half-baked thinking.",
    variant: "cinematic",
  },
  {
    id: "ach2",
    badgeType: "award",
    title: "Best Debut Author Award",
    mentorName: "Mrs. Anita Sharma",
    mentorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    mentorRole: "Literature Teacher",
    date: "March 2024",
    location: "National Book Guild Gala",
    category: "Literary Honor",
    highlightStat: "1st Place Gold Medal",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80",
    story: "Every word in that novel passed through the standards you taught in room 204. You made me believe my voice was worth preserving.",
    variant: "editorial",
  },
  {
    id: "ach3",
    badgeType: "job",
    title: "Promoted to Principal Engineer",
    mentorName: "Vikram Rao",
    mentorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    mentorRole: "Engineering Director",
    date: "January 2024",
    location: "Cloud Systems Summit",
    category: "Leadership Breakthrough",
    highlightStat: "Tech Lead & Architect",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    story: "Remembering how you told me leadership is not a podium, but a shield for your team. This milestone belongs to your patient mentorship.",
    variant: "luxe",
  },
  {
    id: "ach4",
    badgeType: "certificate",
    title: "Design Fellowship Grant",
    mentorName: "Elena Rostova",
    mentorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    mentorRole: "Art & Design Coach",
    date: "November 2023",
    location: "Metropolitan Design Institute",
    category: "Creative Grant",
    highlightStat: "Fellowship Winner",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    story: "When I was terrified of blank canvases, you placed the brush in my hand. Today our exhibition opened to hundreds of young artists.",
    variant: "polaroid",
  },
  {
    id: "ach5",
    badgeType: "competition",
    title: "Global AI Hackathon Champion",
    mentorName: "Dr. David Mitchell",
    mentorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    mentorRole: "Research Advisor",
    date: "August 2023",
    location: "TechHub International, SF",
    category: "Innovation Victory",
    highlightStat: "Grand Prize Winner",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    story: "We stayed up until dawn debugging the model. Your quiet reassurance that resilience beats talent carried our team to victory.",
    variant: "showcase",
  },
];

// Mock Data: Timeline Nodes
const TIMELINE_NODES: TimelineNode[] = [
  {
    year: "2016",
    title: "First Meeting",
    subtitle: "Walked into honors literature hesitant to speak",
    mentorName: "Mrs. Anita Sharma",
  },
  {
    year: "2019",
    title: "College Recommendation",
    subtitle: "A letter that opened doors across the country",
    mentorName: "Mrs. Anita Sharma",
    isMilestone: true,
  },
  {
    year: "2021",
    title: "Lab Fellowship",
    subtitle: "First research grant together under Dr. Mitchell",
    mentorName: "Dr. David Mitchell",
  },
  {
    year: "2023",
    title: "First Leadership Role",
    subtitle: "Promoted to tech lead under Vikram's guidance",
    mentorName: "Vikram Rao",
    isMilestone: true,
  },
  {
    year: "2026",
    title: "Mentoring the Next Gen",
    subtitle: "Passing on the fire to two high school interns",
    mentorName: "All Mentors",
    isMilestone: true,
  },
];

function toWallItem(memory: MemoryData): WallItem {
  const mentor = memoryService
    .getAllMentorProfiles()
    .find((profile) => profile.name.toLowerCase() === memory.mentorName.toLowerCase());
  const parsedDate = Date.parse(memory.date);
  const createdAt = Number.isNaN(parsedDate)
    ? new Date().toISOString()
    : new Date(parsedDate).toISOString();
  const base = {
    id: `home-${memory.id}`,
    mentorName: memory.mentorName,
    mentorId: mentor?.id,
    relationship: mentor?.relationship || "Mentor",
    createdAt,
    isPinned: false,
  };

  if (memory.type === "achievement") {
    return {
      ...base,
      kind: "milestone",
      title: memory.title,
      description: memory.content,
      year: memory.date.match(/\d{4}/)?.[0] || new Date().getFullYear().toString(),
      type: "breakthrough",
      accentColor: Palette.oceanTeal,
    };
  }
  if (memory.type === "lesson") {
    return {
      ...base,
      kind: "lesson",
      lessonTitle: memory.title,
      quote: memory.content,
      story: memory.content,
      category: "Reflection",
    };
  }
  if (memory.type === "tribute") {
    return {
      ...base,
      kind: "tribute",
      title: memory.title,
      photoUri: memory.image || "",
      quote: memory.content,
      story: memory.content,
      templateId: "editorial",
    };
  }

  return {
    ...base,
    kind: "memory",
    title: memory.title,
    excerpt: memory.content,
    story: memory.content,
    imageUri: memory.image,
    year: memory.date.match(/\d{4}/)?.[0] || new Date().getFullYear().toString(),
    emotion: memory.type === "gratitude" ? "Gratitude" : "Remembered",
    emotionColor: Palette.turquoise,
    quote: memory.type === "gratitude" ? memory.content : undefined,
  };
}

export default function HomeScreen() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [mentorsList, setMentorsList] = useState<MentorData[]>(MENTORS_DATA);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [selectedAchievementModal, setSelectedAchievementModal] = useState<AchievementData | null>(null);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [wallItems, setWallItems] = useState<WallItem[]>(() =>
    memoryService.getAllMemories()
  );
  const [profile, setProfile] = useState<UserProfile>(() => userProfileService.getProfile());
  const [homeSearch, setHomeSearch] = useState("");
  const { width: windowWidth } = useWindowDimensions();
  const isBrowser = useIsBrowser();
  const { openQrModal } = useQrModal();
  const [reflectionInput, setReflectionInput] = useState("");
  const [hasSubmittedReflection, setHasSubmittedReflection] = useState(false);

  // Auth guard: If user has no active token, redirect to /login
  React.useEffect(() => {
    getAuthToken()
      .then((token) => {
        if (!token) {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, []);

  React.useEffect(
    () => userProfileService.subscribe((nextProfile) => setProfile(nextProfile)),
    []
  );

  React.useEffect(
    () =>
      memoryService.subscribe(() => {
        setWallItems(memoryService.getAllMemories());
        const realMentors = memoryService.getAllMentorProfiles().map((m) => ({
          id: m.id,
          name: m.name,
          role: m.relationship || "Mentor",
          avatar: m.avatarUri || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
          quote: m.meaningfulQuote || m.description || "",
          memoriesCount: m.itemCount || 0,
          yearsKnown: m.duration || "Honoured",
          isBookmarked: false,
          trait: m.trait || "Guide",
          traitIcon: (m.traitIcon || "heart-outline") as any,
          lessonCarried: m.meaningfulQuote || "",
          coverColor: m.coverColor || Palette.accentSky,
        }));
        setMentorsList(realMentors);
      }),
    []
  );

  const recordedVoiceNotes = useMemo<VoiceNoteData[]>(
    () =>
      wallItems
        .filter(
          (item): item is WallMemory & { audioUri: string } =>
            item.kind === "memory" && typeof item.audioUri === "string"
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          mentorName: item.mentorName,
          duration: formatAudioDuration(item.audioDuration ?? 0),
          date: new Date(item.createdAt).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          category: "Voice Memory",
          audioUri: item.audioUri,
          durationSeconds: item.audioDuration,
        })),
    [wallItems]
  );

  const voiceNotes = useMemo(
    () => [...recordedVoiceNotes, ...VOICE_NOTES],
    [recordedVoiceNotes]
  );

  // Smooth entrance fade
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 650,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [fadeAnim]);

  const handleBookmarkToggle = (id: string) => {
    setMentorsList((prev) =>
      prev.map((mentor) =>
        mentor.id === id
          ? { ...mentor, isBookmarked: !mentor.isBookmarked }
          : mentor
      )
    );
  };

  const handleOpenMentor = (mentor: MentorData) => {
    const profile =
      memoryService
        .getAllMentorProfiles()
        .find((item) => item.name.toLowerCase() === mentor.name.toLowerCase()) ??
      memoryService.addMentor({
        name: mentor.name,
        relationship: mentor.role,
      });
    router.push({
      pathname: "/mentor-profile/[id]",
      params: { id: profile.id },
    });
  };

  const handleOpenHomeMemory = (memory: MemoryData) => {
    const fallbackItem = toWallItem(memory);
    const itemId = memoryService.getMemoryById(fallbackItem.id)
      ? fallbackItem.id
      : memoryService.addMemory(fallbackItem);
    router.push({
      pathname: "/memory-detail/[id]",
      params: { id: itemId },
    });
  };

  const handleCreateFromModal = (option: string) => {
    if (option === "tribute") {
      router.push("/create-tribute");
      return;
    }
    if (option === "media") {
      router.push("/upload-memory");
      return;
    }
    if (option === "memory" || option === "letter" || option === "lesson") {
      router.push({ pathname: "/create", params: { type: option } });
    }
  };

  const handleSaveVoiceRecording = (recording: RecordedVoiceNote) => {
    const now = new Date();
    const itemId = memoryService.addMemory({
      kind: "memory",
      id: `voice-${Date.now()}`,
      mentorName: recording.mentorName,
      relationship: "Mentor",
      title: recording.title,
      excerpt: `Voice memory recorded on ${now.toLocaleDateString()}.`,
      story: `A voice memory recorded on ${now.toLocaleDateString()}.`,
      audioUri: recording.uri,
      audioDuration: recording.durationSeconds,
      year: String(now.getFullYear()),
      emotion: "Gratitude",
      emotionColor: Palette.oceanTeal,
      createdAt: now.toISOString(),
      isPinned: false,
    });
    setIsVoiceRecorderOpen(false);
    router.push({ pathname: "/memory-detail/[id]", params: { id: itemId } });
  };

  const handleSaveReflection = () => {
    const text = reflectionInput.trim();
    if (!text) {
      Alert.alert("Reflection required", "Write a few words before saving your reflection.");
      return;
    }
    memoryService.addMemory({
      kind: "lesson",
      id: `reflection-${Date.now()}`,
      mentorName: "My Mentor",
      relationship: "Mentor",
      lessonTitle: "Today's Reflection",
      quote: text,
      story: text,
      category: "Daily Reflection",
      createdAt: new Date().toISOString(),
      isPinned: false,
    });
    setHasSubmittedReflection(true);
  };

  const filteredMemories = useMemo(() => {
    if (selectedTag === "all") return MEMORIES_DATA;
    return MEMORIES_DATA.filter((m) => m.type === selectedTag);
  }, [selectedTag]);

  const filteredMentors = useMemo(() => {
    const query = homeSearch.trim().toLowerCase();
    if (!query) return mentorsList;
    return mentorsList.filter((mentor) =>
      [mentor.name, mentor.role, mentor.quote]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [homeSearch, mentorsList]);

  const featuredMentor = mentorsList[0];
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Pure Cloud Canvas */}
      <View style={styles.paperCanvas} />

      <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeCopy}>
              <Text style={styles.welcomeTitle} accessibilityRole="header">
                {t(getGreetingKey())}{"\n"}
                {profile.name.split(" ")[0]}
              </Text>
              <Text style={styles.welcomeSubtitle}>{t("home.tagline")}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.notificationButton}
                activeOpacity={0.75}
                onPress={() =>
                  Alert.alert(
                    "Notifications",
                    "You’re all caught up on your memories."
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={SystemColors.blue}
                />
              </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileAvatarBtn}
              activeOpacity={0.8}
              onPress={() => router.push("/profile")}
              accessibilityRole="button"
              accessibilityLabel="Open your profile"
            >
              <Image
                source={{ uri: profile.avatarUri }}
                style={styles.profileAvatar}
              />
            </TouchableOpacity>
            </View>
          </View>

          <View style={styles.homeSearch}>
            <Ionicons
              name="search-outline"
              size={17}
              color={SystemColors.secondaryLabel}
            />
            <TextInput
              value={homeSearch}
              onChangeText={setHomeSearch}
              placeholder={t("home.search")}
              placeholderTextColor={SystemColors.secondaryLabel}
              selectionColor={SystemColors.blue}
              style={styles.homeSearchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityRole="search"
              accessibilityLabel={t("home.search")}
            />
            {homeSearch.length > 0 && (
              <TouchableOpacity
                onPress={() => setHomeSearch("")}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Palette.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          
          <View style={styles.quickActionsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsScroll}
            >
              <QuickAction
                icon="person-add"
                label={t("home.action.addMentor")}
                color={Palette.accentSky}
                onPress={() => router.push("/create-mentor")}
              />
              <QuickAction
                icon="add-circle"
                label={t("home.action.addMemory")}
                color={Palette.accentMint}
                badge="+"
                onPress={() => setIsAddModalOpen(true)}
              />
              <QuickAction
                icon="heart"
                label={t("home.action.appreciation")}
                color={Palette.accentCoral}
                onPress={() => router.push("/create-tribute")}
              />
              <QuickAction
                icon="mic"
                label={t("home.action.voiceNote")}
                color={Palette.accentAmber}
                onPress={() => setIsVoiceRecorderOpen(true)}
              />
              <QuickAction
                icon="time"
                label={t("home.action.timeline")}
                color={Palette.accentSky}
                onPress={() => router.push("/memory-wall")}
              />
            </ScrollView>
          </View>

          {/* Open the app install popup from this compact home banner (browser only, never inside the installed app). */}
          {isBrowser && (
            <View
              style={[
                styles.webQrPrompt,
                windowWidth < 480 && styles.webQrPromptNarrow,
              ]}
            >
              <View
                style={[
                  styles.webQrPromptIcon,
                  windowWidth < 480 && styles.webQrPromptIconNarrow,
                ]}
              >
                <Ionicons name="phone-portrait-outline" size={26} color={SystemColors.label} />
              </View>
              <View style={styles.webQrPromptCopy}>
                <Text style={styles.webQrPromptTitle}>Take your memories with you</Text>
                <Text style={styles.webQrPromptSubtitle}>Birthday reminders and tributes, wherever you are.</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.webQrPromptButton,
                  windowWidth < 480 && styles.webQrPromptButtonNarrow,
                ]}
                onPress={() => openQrModal("https://onodem.com", "show")}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Get the app"
              >
                <Text style={styles.webQrPromptButtonText}>Get the App</Text>
              </TouchableOpacity>
            </View>
          )}

          {featuredMentor && (
            <View style={styles.featuredStory}>
              <Image
                source={{ uri: featuredMentor.avatar }}
                style={styles.featuredStoryImage}
                resizeMode="cover"
                accessibilityLabel={`Portrait of ${featuredMentor.name}`}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.28)", "rgba(0,0,0,0.96)"]}
                locations={[0, 0.38, 1]}
                style={styles.featuredStoryOverlay}
              />
              <View style={styles.featuredStoryContent}>
                <View style={styles.featuredStoryBadge}>
                  <Text style={styles.featuredStoryBadgeText}>Featured Story</Text>
                </View>
                <Text style={styles.featuredStoryQuote} numberOfLines={3}>
                  &ldquo;{featuredMentor.quote}&rdquo;
                </Text>
                <Text style={styles.featuredStoryMentor} numberOfLines={1}>
                  {featuredMentor.name} · {featuredMentor.role}
                </Text>
                <TouchableOpacity
                  style={styles.watchStoryButton}
                  activeOpacity={0.85}
                  onPress={() => handleOpenMentor(featuredMentor)}
                  accessibilityRole="button"
                  accessibilityLabel={`Watch ${featuredMentor.name}'s story`}
                >
                  <Text style={styles.watchStoryText}>Watch Story</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Feed: your posts + people you follow (compact collage) */}
          <FollowingFeed />

          {/* ======================================================== */}
          {/* PEOPLE WHO SHAPED YOU                                   */}
          {/* ======================================================== */}
          <View style={styles.mentorsDarkSection}>
            <View style={styles.mentorSectionHeader}>
              <Text style={styles.mentorSectionTitle} accessibilityRole="header">People Who Made a Difference</Text>
              <TouchableOpacity
                onPress={() => router.push("/memory-wall")}
                activeOpacity={0.6}
                style={styles.mentorSectionActionTouch}
                accessibilityRole="button"
                accessibilityLabel="See all mentors"
              >
                <Text style={styles.mentorSectionAction}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mentorsScroll}
              decelerationRate="fast"
              snapToInterval={244}
              snapToAlignment="start"
            >
              {filteredMentors.map((mentor, idx) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  index={idx}
                  cardWidth={230}
                  onBookmarkToggle={handleBookmarkToggle}
                  onPress={() => handleOpenMentor(mentor)}
                />
              ))}
              {filteredMentors.length === 0 && (
                <Text style={styles.noMentorsText}>
                  No mentors match “{homeSearch.trim()}”.
                </Text>
              )}
            </ScrollView>
          </View>

          {/* ======================================================== */}
          {/* 6. A LESSON I CARRY                                      */}
          {/* ======================================================== */}
          <View style={styles.lessonSection}>
            <View style={styles.lessonCard}>
              <View style={styles.lessonWaxSeal}>
                <Ionicons name="bookmark" size={16} color={SystemColors.yellow} />
              </View>

              <Text style={styles.lessonHeaderLabel}>A Lesson I Carry</Text>

              <Text style={styles.lessonQuoteText}>
                &ldquo;Your mentor may leave the room, but their lessons never have to.&rdquo;
              </Text>

              <View style={styles.lessonAuthorRow}>
                <View style={styles.tealDividerLine} />
                <Text style={styles.lessonAuthor}>
                  — From Mr. Daniel, Professor of Philosophy
                </Text>
              </View>
            </View>
          </View>

          {/* ======================================================== */}
          {/* 4. MEMORY WALL                                           */}
          {/* ======================================================== */}
          <SectionHeader
            title="Your Memory Wall"
            subtitle="Little moments. Lifelong impact."
            isDark
          />

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {MEMORY_WALL_FILTERS.map((filter) => (
              <MemoryFilterPill
                key={filter.id}
                label={filter.label}
                icon={filter.icon}
                color={filter.color}
                isActive={selectedTag === filter.id}
                onPress={() => setSelectedTag(filter.id)}
              />
            ))}
          </ScrollView>

          {/* Memory collage: hero photo + masonry tiles */}
          <MemoryCollage memories={filteredMemories} onOpen={handleOpenHomeMemory} />

          {/* People to follow */}
          <PeopleSuggestions />

          {/* ======================================================== */}
          {/* 5. ADD A MEMORY FEATURED CALLOUT                         */}
          {/* ======================================================== */}
          <View style={styles.addCalloutWrapper}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsAddModalOpen(true)}
              style={styles.addCalloutBtn}
              accessibilityRole="button"
              accessibilityLabel="Add to your memory wall"
            >
              <LinearGradient
                colors={["transparent", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addCalloutGradient}
              >
                <View style={styles.addCalloutIconWrap}>
                  <Ionicons name="sparkles" size={20} color={Palette.accentAmber} />
                </View>
                <View style={styles.addCalloutTextWrap}>
                  <Text style={styles.addCalloutTitle}>Add to Your Memory Wall</Text>
                  <Text style={styles.addCalloutSub}>
                    Record a voice note, photo, or handwritten lesson
                  </Text>
                </View>
                <Ionicons name="add-circle" size={30} color={SystemColors.blue} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ======================================================== */}
          {/* 7. MENTOR TIMELINE PREVIEW                               */}
          {/* ======================================================== */}
          <TimelinePreview
            nodes={TIMELINE_NODES}
            onViewFullPress={() => router.push("/memory-wall")}
          />

          {/* ======================================================== */}
          {/* 11. DAILY GRATITUDE PROMPT                               */}
          {/* ======================================================== */}
          <View style={styles.promptSection}>
            <View style={styles.promptCard}>
              <View style={styles.promptHeader}>
                <Ionicons name="bulb-outline" size={18} color={Palette.accentAmber} />
                <Text style={styles.promptTag}>Today&apos;s Reflection</Text>
              </View>

              <Text style={styles.promptQuestion}>
                &ldquo;What is one lesson from your mentor that you still use today?&rdquo;
              </Text>

              {hasSubmittedReflection ? (
                <View style={styles.promptSuccessBox}>
                  <Ionicons name="checkmark-circle" size={18} color={Palette.accentMint} />
                  <Text style={styles.promptSuccessText}>
                    Reflection saved to your memory album!
                  </Text>
                </View>
              ) : (
                <View style={styles.promptInputRow}>
                  <TextInput
                    value={reflectionInput}
                    onChangeText={setReflectionInput}
                    placeholder="Write your answer…"
                    placeholderTextColor={Palette.textMuted}
                    style={styles.promptInput}
                    selectionColor={SystemColors.blue}
                    returnKeyType="done"
                    onSubmitEditing={handleSaveReflection}
                    accessibilityLabel="Your reflection"
                  />
                  <TouchableOpacity
                    onPress={handleSaveReflection}
                    activeOpacity={0.6}
                    style={styles.promptSubmitBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Save reflection"
                  >
                    <Ionicons name="arrow-up-circle" size={30} color={reflectionInput.trim() ? SystemColors.blue : SystemColors.tertiaryLabel} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* ======================================================== */}
          {/* 9. VOICE OF GRATITUDE                                    */}
          {/* ======================================================== */}
          <SectionHeader
            title="Words They Should Hear"
            subtitle="Spoken gratitude and audio keepsakes"
            isDark
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.voiceScroll}
          >
            {voiceNotes.map((vn) => (
              <VoiceNoteCard key={vn.id} voiceNote={vn} />
            ))}
          </ScrollView>

          {/* ======================================================== */}
          {/* 10. ACHIEVEMENTS INSPIRED BY THEM                        */}
          {/* ======================================================== */}
          <SectionHeader
            title="Achievements Inspired By Them"
            subtitle="Milestones made possible by their faith in you"
            isDark
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {ACHIEVEMENTS_DATA.map((ach, idx) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  index={idx}
                  onPress={() => {
                    setSelectedAchievementModal(ach);
                    setIsAchievementModalOpen(true);

                    // Sync to memoryService so memory details are ready
                    const id = `home-${ach.id}`;
                    const existing = memoryService.getMemoryById(id);
                    const mentor = memoryService
                      .getAllMentorProfiles()
                      .find(
                        (item) => item.name.toLowerCase() === ach.mentorName.toLowerCase()
                      );
                    if (!existing) {
                      memoryService.addMemory({
                        kind: "milestone",
                        id,
                        mentorName: ach.mentorName,
                        mentorId: mentor?.id,
                        relationship: mentor?.relationship || "Mentor",
                        title: ach.title,
                        description: ach.story,
                        year: ach.date.match(/\d{4}/)?.[0] || new Date().getFullYear().toString(),
                        type: "breakthrough",
                        accentColor: Palette.oceanTeal,
                        imageUri: ach.image,
                        createdAt: new Date().toISOString(),
                        isPinned: false,
                      });
                    }
                  }}
                />
            ))}
          </ScrollView>

          {/* ======================================================== */}
          {/* 8. GRATITUDE FROM AROUND THE WORLD                       */}
          {/* ======================================================== */}
          <SectionHeader
            title="Gratitude From Around the World"
            subtitle="Heartfelt stories shared by the global community"
            isDark
          />

          {GRATITUDE_POSTS.map((post) => (
            <GratitudeCard
              key={post.id}
              post={post}
              onPress={() =>
                Alert.alert(
                  `Honouring ${post.mentorName}`,
                  `${post.authorName} · ${post.location}\n\n${post.message}`
                )
              }
            />
          ))}

          {/* Extra Bottom Padding for floating nav */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </Animated.View>

      {/* Floating Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        onCreatePress={() => setIsAddModalOpen(true)}
      />

      {/* Add Memory Modal Action Sheet */}
      <AddMemoryModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectOption={(optionKey) => {
          handleCreateFromModal(optionKey);
        }}
      />
      <VoiceRecorderModal
        visible={isVoiceRecorderOpen}
        onClose={() => setIsVoiceRecorderOpen(false)}
        onSave={handleSaveVoiceRecording}
      />
      <AchievementDetailModal
        visible={isAchievementModalOpen}
        achievement={selectedAchievementModal}
        onClose={() => setIsAchievementModalOpen(false)}
        onViewMentor={(mentorName) => {
          setIsAchievementModalOpen(false);
          const found = mentorsList.find(
            (m) => m.name.toLowerCase() === mentorName.toLowerCase()
          );
          if (found) {
            handleOpenMentor(found);
          } else {
            router.push("/memory-wall");
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SystemColors.systemBackground,
  },
  paperCanvas: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SystemColors.systemBackground,
  },
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },

  welcomeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Layout.margin,
    marginBottom: 16,
  },
  welcomeCopy: {
    flex: 1,
    paddingRight: 10,
  },
  welcomeTitle: {
    ...TextStyles.largeTitle,
    color: SystemColors.label,
  },
  welcomeSubtitle: {
    ...TextStyles.subheadline,
    color: SystemColors.secondaryLabel,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  notificationButton: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Palette.accentSky,
  },
  profileAvatarBtn: {
    width: 36,
    height: 36,
    margin: 4,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: SystemColors.tertiarySystemBackground,
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
  },
  homeSearch: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: Layout.margin,
    paddingHorizontal: 8,
    backgroundColor: SystemColors.tertiarySystemFill,
    borderRadius: Layout.radiusSmall,
    marginBottom: 20,
  },
  homeSearchInput: {
    flex: 1,
    paddingVertical: 0,
    ...TextStyles.body,
    color: SystemColors.label,
  },
  featuredStory: {
    height: 360,
    marginHorizontal: Layout.margin,
    marginBottom: 8,
    borderRadius: Layout.radiusXL,
    overflow: "hidden",
    backgroundColor: SystemColors.secondarySystemBackground,
  },
  featuredStoryImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredStoryOverlay: {
    ...StyleSheet.absoluteFill,
  },
  featuredStoryContent: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    alignItems: "flex-start",
  },
  featuredStoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  featuredStoryBadgeText: {
    ...TextStyles.caption1,
    fontWeight: "600",
    color: "#FFFFFF", // on a photo: stays white in both appearances
  },
  featuredStoryQuote: {
    ...TextStyles.title2,
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
    marginBottom: 6,
  },
  featuredStoryMentor: {
    ...TextStyles.subheadline,
    color: "rgba(235, 235, 245, 0.8)",
  },
  watchStoryButton: {
    minHeight: Layout.minTouch,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 18,
    marginTop: 14,
    borderRadius: Layout.minTouch / 2,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  watchStoryText: {
    ...TextStyles.subheadline,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  mentorSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.margin,
    marginTop: 24,
    marginBottom: 8,
  },
  mentorSectionTitle: {
    ...TextStyles.title2,
    color: SystemColors.label,
    flexShrink: 1,
  },
  mentorSectionActionTouch: {
    minHeight: Layout.minTouch,
    justifyContent: "center",
    paddingLeft: 8,
  },
  mentorSectionAction: {
    ...TextStyles.body,
    color: SystemColors.blue,
  },
  noMentorsText: {
    ...TextStyles.subheadline,
    color: SystemColors.secondaryLabel,
    paddingHorizontal: Layout.margin,
  },

  /* Quick Actions Bar */
  quickActionsContainer: {
    marginBottom: 10,
  },
  quickActionsScroll: {
    paddingHorizontal: Layout.margin,
  },

  mentorsDarkSection: {
    marginBottom: 8,
  },
  mentorsScroll: {
    paddingLeft: Layout.margin,
    paddingRight: 4,
    marginBottom: 4,
  },

  /* 6. A Lesson I Carry (Mint Mist) */
  lessonSection: {
    marginHorizontal: Layout.margin,
    marginTop: 24,
    marginBottom: 8,
  },
  lessonCard: {
    borderRadius: Layout.radiusLarge,
    padding: 20,
    backgroundColor: SystemColors.secondarySystemBackground,
    position: "relative",
  },
  lessonWaxSeal: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(255, 214, 10, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  lessonHeaderLabel: {
    ...TextStyles.footnote,
    fontWeight: "600",
    color: SystemColors.secondaryLabel,
    marginBottom: 10,
  },
  lessonQuoteText: {
    ...TextStyles.title3,
    fontWeight: "400",
    lineHeight: 27,
    color: SystemColors.label,
    fontFamily: AppFonts.body,
  },
  lessonAuthorRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tealDividerLine: {
    width: 16,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: SystemColors.secondaryLabel,
  },
  lessonAuthor: {
    ...TextStyles.subheadline,
    color: SystemColors.secondaryLabel,
    flexShrink: 1,
  },

  /* Filter Row */
  filterRow: {
    paddingHorizontal: Layout.margin,
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 36,
    borderRadius: 999,
    backgroundColor: SystemColors.tertiarySystemFill,
  },
  filterPillActive: {
    backgroundColor: SystemColors.label,
  },
  filterText: {
    ...TextStyles.subheadline,
    fontWeight: "500",
    color: SystemColors.label,
  },
  filterTextActive: {
    color: SystemColors.inverseLabel,
    fontWeight: "600",
  },

  /* Memory Wall Cards */
  memoryWallContainer: {
    paddingHorizontal: Layout.margin,
  },

  /* 5. Add Memory Callout (Ocean Teal Button) */
  addCalloutWrapper: {
    marginHorizontal: Layout.margin,
    marginTop: 12,
    marginBottom: 24,
  },
  addCalloutBtn: {
    borderRadius: Layout.radiusLarge,
    overflow: "hidden",
  },
  addCalloutGradient: {
    backgroundColor: SystemColors.secondarySystemBackground,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    minHeight: 72,
    gap: 12,
  },
  addCalloutIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(255, 214, 10, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  addCalloutTextWrap: {
    flex: 1,
  },
  addCalloutTitle: {
    ...TextStyles.headline,
    color: SystemColors.label,
  },
  addCalloutSub: {
    ...TextStyles.footnote,
    color: SystemColors.secondaryLabel,
    marginTop: 2,
  },

  /* 11. Daily Prompt (Mint Mist Surface) */
  promptSection: {
    marginHorizontal: Layout.margin,
    marginBottom: 24,
  },
  promptCard: {
    padding: 20,
    borderRadius: Layout.radiusLarge,
    backgroundColor: SystemColors.secondarySystemBackground,
  },
  promptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  promptTag: {
    ...TextStyles.footnote,
    fontWeight: "600",
    color: SystemColors.secondaryLabel,
  },
  promptQuestion: {
    ...TextStyles.body,
    color: SystemColors.label,
    marginBottom: 14,
  },
  promptInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SystemColors.tertiarySystemFill,
    borderRadius: Layout.radiusMedium,
    paddingLeft: 14,
    minHeight: Layout.controlHeight,
  },
  promptInput: {
    flex: 1,
    ...TextStyles.body,
    color: SystemColors.label,
    paddingVertical: 10,
  },
  promptSubmitBtn: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    justifyContent: "center",
    alignItems: "center",
  },
  promptSuccessBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(48, 209, 88, 0.15)",
    padding: 12,
    borderRadius: Layout.radiusSmall,
  },
  promptSuccessText: {
    ...TextStyles.subheadline,
    color: SystemColors.label,
    flexShrink: 1,
  },

  /* Voice & Achievements Scroll */
  voiceScroll: {
    paddingLeft: Layout.margin,
    paddingRight: 4,
  },
  webQrPrompt: {
    marginHorizontal: Layout.margin,
    marginBottom: 20,
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusLarge,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  webQrPromptIcon: {
    width: 56,
    height: 56,
    borderRadius: 13,
    backgroundColor: SystemColors.tertiarySystemBackground,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  webQrPromptNarrow: {
    flexWrap: "wrap",
    padding: 14,
    gap: 10,
  },
  webQrPromptIconNarrow: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  webQrPromptCopy: {
    flex: 1,
    minWidth: 140,
    gap: 4,
  },
  webQrPromptTitle: {
    ...TextStyles.headline,
    color: SystemColors.label,
  },
  webQrPromptSubtitle: {
    ...TextStyles.footnote,
    color: SystemColors.secondaryLabel,
  },
  webQrPromptButton: {
    marginLeft: "auto",
    minHeight: Layout.minTouch,
    paddingHorizontal: 18,
    borderRadius: Layout.minTouch / 2,
    backgroundColor: SystemColors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  webQrPromptButtonNarrow: {
    minHeight: Layout.minTouch,
  },
  webQrPromptButtonText: {
    ...TextStyles.subheadline,
    fontWeight: "600",
    color: SystemColors.label,
  },

  achievementsScroll: {
    paddingLeft: Layout.margin,
    paddingRight: 4,
  },
});