import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Design System Tokens
import { AppFonts, BottomTabInset, getCategoryAccent, Palette } from "@/constants/theme";

// Shared Navigation & Components
import BottomNavigation from "@/components/home/BottomNavigation";
import CreativeVoiceModal from "@/components/home/CreativeVoiceModal";
import MilestoneDedicationCard, {
  MilestoneDedicationData,
} from "@/components/home/MilestoneDedicationCard";
import VoiceLessonCard, { VoiceLessonItem } from "@/components/home/VoiceLessonCard";

// Types & Services
import { memoryService } from "@/services/memoryService";
import { WallItem, WallMentorProfile } from "@/types/memoryWall";

interface MentorMediaAsset {
  id: string;
  uri: string;
  title: string;
  caption: string;
}

export default function MentorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: screenWidth } = useWindowDimensions();

  // Robust mentor resolver ensuring any ID (m1, mp1, name) properly loads
  const resolveInitialMentor = (): WallMentorProfile | undefined => {
    if (!id) return undefined;
    const direct = memoryService.getMentorProfileById(id);
    if (direct) return direct;
    const all = memoryService.getAllMentorProfiles();
    if (id === "m1") return all.find((m) => m.name.includes("Anita")) || all[0];
    if (id === "m2") return all.find((m) => m.name.includes("Mitchell")) || all[1];
    if (id === "m3") return all.find((m) => m.name.includes("Vikram")) || all[2];
    if (id === "m4") return all.find((m) => m.name.includes("Priya")) || all[3];
    if (id === "m5") return all.find((m) => m.name.includes("Elena")) || all[4];
    return (
      all.find(
        (m) =>
          m.name.toLowerCase().includes(decodeURIComponent(id).toLowerCase()) ||
          m.id.toLowerCase() === id.toLowerCase()
      ) || all[0]
    );
  };

  const [mentor, setMentor] = useState<WallMentorProfile | undefined>(resolveInitialMentor);
  const [memories, setMemories] = useState<WallItem[]>(() =>
    mentor ? memoryService.getMemoriesByMentor(mentor.id) : []
  );

  // Modal & Interactive States
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<MentorMediaAsset | null>(null);
  const [activeVoiceModal, setActiveVoiceModal] = useState<{
    title: string;
    mentorName: string;
    duration: string;
    description?: string;
    transcript?: string;
  } | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceModalMode, setVoiceModalMode] = useState<"listen" | "record">("listen");

  // Creative Action Pill State
  const [tributeStatus, setTributeStatus] = useState<"sent" | "voice" | "heart">("sent");

  // Edit Mentor Form State
  const [editName, setEditName] = useState("");
  const [editRelationship, setEditRelationship] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editQuote, setEditQuote] = useState("");

  // Real-time synchronization with memoryService
  useEffect(() => {
    if (!id) return;
    const sync = () => {
      const resolved = resolveInitialMentor();
      setMentor(resolved);
      if (resolved) {
        setMemories(memoryService.getMemoriesByMentor(resolved.id));
      }
    };
    sync();
    const unsubscribe = memoryService.subscribe(sync);
    return () => {
      unsubscribe();
    };
  }, [id]);

  // Meaningful quote
  const meaningfulQuote = useMemo(() => {
    if (!mentor) return null;
    if (mentor.meaningfulQuote?.trim()) return mentor.meaningfulQuote.trim();
    const itemWithQuote = memories.find((m) => "quote" in m && m.quote?.trim());
    if (itemWithQuote && "quote" in itemWithQuote && itemWithQuote.quote) {
      return itemWithQuote.quote.trim();
    }
    return "Believe in your voice before asking the world to listen.";
  }, [mentor, memories]);

  // Curated hero background photo matching mentor
  const heroCoverUri = useMemo(() => {
    if (!mentor) return "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80";
    const nameLower = mentor.name.toLowerCase();
    if (nameLower.includes("anita")) {
      return "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80";
    }
    if (nameLower.includes("mitchell") || nameLower.includes("david")) {
      return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80";
    }
    if (nameLower.includes("vikram")) {
      return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80";
    }
    if (nameLower.includes("elena")) {
      return "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&auto=format&fit=crop&q=80";
    }
    return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&auto=format&fit=crop&q=80";
  }, [mentor]);

  // Curated natural-color image gallery per mentor
  const mentorMediaAssets = useMemo<MentorMediaAsset[]>(() => {
    if (!mentor) return [];
    const nameLower = mentor.name.toLowerCase();
    if (nameLower.includes("anita")) {
      return [
        {
          id: "img-a1",
          uri: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80",
          title: "Annotated Anthology",
          caption: "Handwritten notes in the margins of Wordsworth poems after class.",
        },
        {
          id: "img-a2",
          uri: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
          title: "Classroom 204 Discussions",
          caption: "The autumn morning you challenged us to write our first honest essay.",
        },
        {
          id: "img-a3",
          uri: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80",
          title: "Sunlit Library Reading",
          caption: "Where you found me struggling and handed me a cup of warm tea.",
        },
        {
          id: "img-a4",
          uri: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80",
          title: "First Manuscript Draft",
          caption: "The ink was still wet when you said, 'This is ready for the world.'",
        },
        {
          id: "img-a5",
          uri: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
          title: "Graduation Day Gift",
          caption: "Presenting you with the debut edition dedicated in your name.",
        },
      ];
    }
    if (nameLower.includes("mitchell") || nameLower.includes("david")) {
      return [
        {
          id: "img-m1",
          uri: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
          title: "Sunday Morning Blackboard",
          caption: "Demolishing my clumsy derivations and rebuilding clear equations.",
        },
        {
          id: "img-m2",
          uri: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
          title: "Lab Coffee Talks",
          caption: "Two hours spent dissecting why our first neural network diverged.",
        },
        {
          id: "img-m3",
          uri: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
          title: "Campus Science Quad",
          caption: "Walking toward the symposium when you reminded me to ask deeper questions.",
        },
        {
          id: "img-m4",
          uri: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
          title: "Dissertation Defense Room",
          caption: "The sunlit table where my master's thesis was defended and approved.",
        },
        {
          id: "img-m5",
          uri: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
          title: "Late Night Compute Cluster",
          caption: "Running the final benchmarks before shipping the open-source release.",
        },
      ];
    }
    if (nameLower.includes("vikram")) {
      return [
        {
          id: "img-v1",
          uri: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
          title: "Architecture Whiteboard",
          caption: "Mapping the distributed pipeline on the glass board before launch.",
        },
        {
          id: "img-v2",
          uri: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80",
          title: "Midnight Release War Room",
          caption: "When the database locked up and your calm voice restored order in 5 minutes.",
        },
        {
          id: "img-v3",
          uri: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80",
          title: "Team Rooftop Dinner",
          caption: "Celebrating three years of building together under open evening skies.",
        },
        {
          id: "img-v4",
          uri: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
          title: "Engineering All-Hands",
          caption: "Where you said, 'Build things that outlive your tenure and elevate people.'",
        },
      ];
    }
    return [
      {
        id: "img-e1",
        uri: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
        title: "Watercolor Palette & Brushes",
        caption: "Learning to let water and pigment collide without frantic control.",
      },
      {
        id: "img-e2",
        uri: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
        title: "Studio Sketchbook Studies",
        caption: "Forgiving the first five ugly drafts to find the single true stroke.",
      },
      {
        id: "img-e3",
        uri: "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=800&auto=format&fit=crop&q=80",
        title: "Gallery Exhibition Opening",
        caption: "Standing beside the framed canvas while attendees gathered in wonder.",
      },
    ];
  }, [mentor]);

  // Curated Voice Notes for this mentor
  const mentorVoiceNotes = useMemo<VoiceLessonItem[]>(() => {
    if (!mentor) return [];
    const nameLower = mentor.name.toLowerCase();
    if (nameLower.includes("vikram")) {
      return [
        {
          id: "mvn-1",
          type: "voice",
          badgeLabel: "VOICE NOTE",
          badgeIcon: "mic",
          date: "May 2023",
          title: "Voice Memo Before Defense",
          description:
            "A 45-second voicemail recorded in the cab on the way to the thesis board. Still keeps me grounded.",
          audioDuration: "0:45",
          mentorName: mentor.name,
          likes: 29,
        },
        {
          id: "mvn-2",
          type: "voice",
          badgeLabel: "VOICE NOTE",
          badgeIcon: "mic",
          date: "Oct 2023",
          title: "When Production Goes Down",
          description:
            "Calm leadership memo: 'Systems break; character is what remains. Protect the team first.'",
          audioDuration: "1:22",
          mentorName: mentor.name,
          likes: 45,
        },
      ];
    }
    if (nameLower.includes("anita")) {
      return [
        {
          id: "mvn-a1",
          type: "voice",
          badgeLabel: "VOICE NOTE",
          badgeIcon: "mic",
          date: "Jan 2024",
          title: "When You Doubt Your Voice",
          description:
            "A 2-minute voice note sent after my draft was rejected. She reminded me why we write.",
          audioDuration: "2:08",
          mentorName: mentor.name,
          likes: 54,
        },
        {
          id: "mvn-a2",
          type: "voice",
          badgeLabel: "VOICE NOTE",
          badgeIcon: "mic",
          date: "Sep 2023",
          title: "The Music of Silence",
          description:
            "Leaving room for the reader's heart to catch up to the story's gravity.",
          audioDuration: "1:15",
          mentorName: mentor.name,
          likes: 38,
        },
      ];
    }
    if (nameLower.includes("mitchell") || nameLower.includes("david")) {
      return [
        {
          id: "mvn-d1",
          type: "voice",
          badgeLabel: "VOICE NOTE",
          badgeIcon: "mic",
          date: "Jun 2024",
          title: "Advice Before the Dissertation Board",
          description:
            "He called while I paced in hallway 302: 'You know these equations better than anyone in that room.'",
          audioDuration: "1:42",
          mentorName: mentor.name,
          likes: 62,
        },
        {
          id: "mvn-d2",
          type: "voice",
          badgeLabel: "VOICE NOTE",
          badgeIcon: "mic",
          date: "Nov 2023",
          title: "The Discipline of Clear Questions",
          description:
            "A voicemail on why good researchers celebrate disproved hypotheses.",
          audioDuration: "1:05",
          mentorName: mentor.name,
          likes: 31,
        },
      ];
    }
    return [
      {
        id: "mvn-e1",
        type: "voice",
        badgeLabel: "VOICE NOTE",
        badgeIcon: "mic",
        date: "Feb 2024",
        title: "The Courage of Imperfect Art",
        description:
          "Sent when I was repainting the canvas: 'Critique is not an attack; it is an invitation.'",
        audioDuration: "1:18",
        mentorName: mentor.name,
        likes: 88,
      },
    ];
  }, [mentor]);

  // Curated Milestones Dedicated to this mentor
  const mentorMilestones = useMemo<MilestoneDedicationData[]>(() => {
    if (!mentor) return [];
    const nameLower = mentor.name.toLowerCase();
    if (nameLower.includes("mitchell") || nameLower.includes("david")) {
      return [
        {
          id: "mms-1",
          badgeIcon: "school",
          title: "Master of Science in AI",
          mentorName: mentor.name,
          date: "June 2024",
          dedicationQuote:
            "Wrote the dedication page to you, who spent Sunday mornings showing me how to write clear equations.",
        },
        {
          id: "mms-2",
          badgeIcon: "trophy",
          title: "Best Research Paper Honor",
          mentorName: mentor.name,
          date: "Dec 2023",
          dedicationQuote:
            "Every theorem in this submission began on your sunlit chalkboard in Hall 4.",
        },
      ];
    }
    if (nameLower.includes("anita")) {
      return [
        {
          id: "mms-a1",
          badgeIcon: "trophy",
          title: "Best Debut Novelist Award",
          mentorName: mentor.name,
          date: "Aug 2023",
          dedicationQuote:
            "Every word in this manuscript passed through the quiet warmth of classroom 204.",
        },
        {
          id: "mms-a2",
          badgeIcon: "ribbon",
          title: "Published Literary Anthology",
          mentorName: mentor.name,
          date: "Nov 2022",
          dedicationQuote:
            "You taught me that honest vulnerability is the only true strength in writing.",
        },
      ];
    }
    if (nameLower.includes("vikram")) {
      return [
        {
          id: "mms-v1",
          badgeIcon: "briefcase",
          title: "Principal Architect Promotion",
          mentorName: mentor.name,
          date: "Jan 2024",
          dedicationQuote:
            "You taught me that leadership is not about having all the answers, but creating safety for others to find them.",
        },
      ];
    }
    return [
      {
        id: "mms-e1",
        badgeIcon: "color-palette",
        title: "Solo Gallery Exhibition Debut",
        mentorName: mentor.name,
        date: "May 2023",
        dedicationQuote:
          "You held my trembling hands when I was terrified to exhibit my inner world to strangers.",
      },
    ];
  }, [mentor]);

  // Safe navigation handlers
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const handleToggleBookmark = () => {
    setIsBookmarked((prev) => {
      const next = !prev;
      Alert.alert(
        next ? "Mentor Bookmarked" : "Bookmark Removed",
        next
          ? `${mentor?.name} has been added to your saved mentors list.`
          : `${mentor?.name} has been removed from your saved mentors.`
      );
      return next;
    });
  };

  const handleOpenMemory = (memoryId: string) => {
    router.push({
      pathname: "/memory-detail/[id]",
      params: { id: memoryId },
    });
  };

  const handleAddMemory = () => {
    setIsMenuVisible(false);
    if (!mentor) return;
    router.push({
      pathname: "/create",
      params: {
        type: "memory",
        mentorName: mentor.name,
        relationship: mentor.relationship,
      },
    });
  };

  const handleCreateTribute = () => {
    setIsMenuVisible(false);
    if (!mentor) return;
    router.push({
      pathname: "/create-tribute",
    });
  };

  const handleShareProfile = async () => {
    setIsMenuVisible(false);
    if (!mentor) return;
    try {
      let msg = `An appreciation for my mentor, ${mentor.name} (${mentor.relationship}).\n\n`;
      if (mentor.description) msg += `${mentor.description}\n\n`;
      if (meaningfulQuote) msg += `“${meaningfulQuote}”\n\n`;
      msg += `Preserving ${memories.length} meaningful memories on Honour Your Mentor.`;
      await Share.share({
        title: `In Honour of ${mentor.name}`,
        message: msg,
      });
    } catch {
      Alert.alert("Share", "Unable to share profile at this time.");
    }
  };

  const handleOpenEditModal = () => {
    setIsMenuVisible(false);
    if (!mentor) return;
    setEditName(mentor.name);
    setEditRelationship(mentor.relationship);
    setEditDescription(mentor.description || "");
    setEditQuote(mentor.meaningfulQuote || "");
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!mentor) return;
    if (!editName.trim()) {
      Alert.alert("Required", "Mentor name is required.");
      return;
    }
    memoryService.updateMentorProfile({
      id: mentor.id,
      name: editName.trim(),
      relationship: editRelationship.trim() || "Mentor",
      description: editDescription.trim(),
      meaningfulQuote: editQuote.trim(),
    });
    setIsEditModalVisible(false);
  };

  const handleOpenVoiceMemo = (item: VoiceLessonItem, mode: "listen" | "record" = "listen") => {
    setActiveVoiceModal({
      title: item.title,
      mentorName: item.mentorName,
      duration: item.audioDuration || "0:45",
      description: item.description,
      transcript:
        item.description ? `“${item.description}”` : undefined,
    });
    setVoiceModalMode(mode);
    setIsVoiceModalOpen(true);
  };

  if (!mentor) {
    return (
      <SafeAreaView style={styles.safeMissing} edges={["top", "bottom"]}>
        <StatusBar barStyle="light-content" backgroundColor="#050505" />
        <View style={styles.missingContainer}>
          <View style={styles.missingIconCircle}>
            <Ionicons name="person-circle-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.missingTitle}>Mentor Profile Not Found</Text>
          <Text style={styles.missingSubtitle}>
            We could not locate this mentor profile. Return home to view your mentors.
          </Text>
          <TouchableOpacity
            style={styles.missingReturnBtn}
            onPress={() => router.replace("/home")}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color="#000000" />
            <Text style={styles.missingReturnText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const galleryCardWidth = Math.min(Math.round(screenWidth * 0.72), 260);
  const voiceCardWidth = Math.min(Math.round(screenWidth * 0.78), 290);
  const milestoneCardWidth = Math.min(Math.round(screenWidth * 0.74), 270);

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BottomTabInset + 70 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* 1. CREATIVE HERO HEADER (Black & White Cover Photo)      */}
        {/* ======================================================== */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: heroCoverUri }}
            style={styles.heroBackgroundPhoto}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              "rgba(0, 0, 0, 0.45)",
              "rgba(10, 10, 10, 0.75)",
              "#050505",
            ]}
            style={styles.heroGradientOverlay}
          >
            {/* Top Bar Floating Over Hero */}
            <SafeAreaView edges={["top"]} style={styles.heroTopBar}>
              <TouchableOpacity
                onPress={handleBack}
                activeOpacity={0.8}
                style={styles.heroCircleBtn}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.heroTopActions}>
                {/* Colourful Bookmark Action */}
                <TouchableOpacity
                  onPress={handleToggleBookmark}
                  activeOpacity={0.8}
                  style={[
                    styles.heroCircleBtn,
                    isBookmarked && styles.heroCircleBtnBookmarked,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Bookmark mentor"
                >
                  <Ionicons
                    name={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={19}
                    color={isBookmarked ? Palette.accentMint : Palette.textPrimary}
                  />
                </TouchableOpacity>

                {/* Colourful Share Action */}
                <TouchableOpacity
                  onPress={handleShareProfile}
                  activeOpacity={0.8}
                  style={styles.heroCircleBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Share profile"
                >
                  <Ionicons name="share-outline" size={19} color={Palette.textPrimary} />
                </TouchableOpacity>

                {/* Options Menu Action */}
                <TouchableOpacity
                  onPress={() => setIsMenuVisible((prev) => !prev)}
                  activeOpacity={0.8}
                  style={styles.heroCircleBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Options"
                >
                  <Ionicons name="ellipsis-horizontal" size={19} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            {/* Hero Main Content Area */}
            <View style={styles.heroContent}>
              <View style={styles.heroBadgePill}>
                <Ionicons
                  name="sparkles"
                  size={12}
                  color={getCategoryAccent(mentor.relationship || "Mentor")}
                />
                <Text style={styles.heroBadgeText}>
                  {mentor.relationship || "Honoured Mentor"}
                </Text>
              </View>

              <Text style={styles.heroTitle}>{mentor.name}</Text>

              <Text style={styles.heroSubtitle}>
                {mentor.relationship || "Mentor & Guide"} • {mentor.duration || "Known for years"}
              </Text>

              <Text style={styles.heroLocation}>
                Classroom 204 • Life Journey
              </Text>

              {/* Action Response Selector Pills with Colourful Icons */}
              <View style={styles.pillSelectorRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setTributeStatus("sent")}
                  style={[
                    styles.selectorPill,
                    tributeStatus === "sent" && styles.selectorPillActive,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={tributeStatus === "sent" ? Palette.accentMint : Palette.textSecondary}
                  />
                  <Text
                    style={[
                      styles.selectorPillText,
                      tributeStatus === "sent" && styles.selectorPillTextActive,
                    ]}
                  >
                    Appreciation Sent
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setTributeStatus("voice");
                    if (mentorVoiceNotes[0]) {
                      handleOpenVoiceMemo(mentorVoiceNotes[0]);
                    }
                  }}
                  style={[
                    styles.selectorPill,
                    tributeStatus === "voice" && styles.selectorPillActive,
                  ]}
                >
                  <Ionicons
                    name="mic-circle"
                    size={16}
                    color={tributeStatus === "voice" ? Palette.accentPeach : Palette.textSecondary}
                  />
                  <Text
                    style={[
                      styles.selectorPillText,
                      tributeStatus === "voice" && styles.selectorPillTextActive,
                    ]}
                  >
                    Voice Memo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setTributeStatus("heart");
                    Alert.alert(
                      "Saved to Heart",
                      `${mentor.name} has been pinned to your core memories.`
                    );
                  }}
                  style={[
                    styles.selectorPill,
                    tributeStatus === "heart" && styles.selectorPillActive,
                  ]}
                >
                  <Ionicons
                    name="heart-circle"
                    size={16}
                    color={tributeStatus === "heart" ? Palette.accentCoral : Palette.textSecondary}
                  />
                  <Text
                    style={[
                      styles.selectorPillText,
                      tributeStatus === "heart" && styles.selectorPillTextActive,
                    ]}
                  >
                    In Heart
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ======================================================== */}
        {/* 2. HOST / GUIDED BY NARRATIVE CARD (Dark Monochrome)     */}
        {/* ======================================================== */}
        <View style={styles.hostCardContainer}>
          <View style={styles.hostCard}>
            <View style={styles.hostAvatarRow}>
              {/* Black & White Mentor Portrait */}
              <Image
                source={{ uri: mentor.avatarUri || heroCoverUri }}
                style={styles.hostAvatar}
                resizeMode="cover"
              />
              <View style={styles.hostTextWrap}>
                <Text style={styles.hostPreTitle}>GUIDED BY</Text>
                <Text style={styles.hostName}>{mentor.name}</Text>
              </View>
            </View>

            {/* Biography */}
            <Text style={styles.hostDescription}>
              {mentor.description ||
                "A teacher and quiet beacon who spent dedicated hours helping you discover your genuine intellectual voice and courage."}
            </Text>

            {/* Inspirational Quote in Elegant Typography */}
            {meaningfulQuote && (
              <View style={styles.quotePill}>
                <Ionicons name="chatbubble-ellipses" size={15} color={Palette.accentCoral} />
                <Text style={styles.quotePillText}>
                  &ldquo;{meaningfulQuote}&rdquo;
                </Text>
              </View>
            )}

            {/* Dedicated Colourful Action Row: Bookmark, Add Memory, Tribute, Share */}
            <View style={styles.actionGridRow}>
              <TouchableOpacity
                onPress={handleToggleBookmark}
                activeOpacity={0.8}
                style={styles.actionGridBtn}
              >
                <Ionicons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={16}
                  color={Palette.accentMint}
                />
                <Text style={styles.actionGridText}>Bookmark</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddMemory}
                activeOpacity={0.8}
                style={styles.actionGridBtn}
              >
                <Ionicons name="add-circle" size={16} color={Palette.accentMint} />
                <Text style={styles.actionGridText}>Add Memory</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateTribute}
                activeOpacity={0.8}
                style={styles.actionGridBtn}
              >
                <Ionicons name="ribbon" size={16} color={Palette.accentLavender} />
                <Text style={styles.actionGridText}>Appreciation</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShareProfile}
                activeOpacity={0.8}
                style={styles.actionGridBtn}
              >
                <Ionicons name="share-social" size={16} color={Palette.textPrimary} />
                <Text style={styles.actionGridText}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* Host Card Footer */}
            <View style={styles.hostFooterRow}>
              <View style={styles.memoryCountBadge}>
                <Ionicons name="heart" size={13} color={Palette.accentCoral} />
                <Text style={styles.memoryCountText}>
                  {memories.length + 5} Moments & Memories Preserved
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 3. RANDOM IMAGES GALLERY SECTION (Black & White Carousel) */}
        {/* ======================================================== */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Shared Moments & Photos</Text>
            <Text style={styles.sectionSub}>
              Visual snapshots from your journey together
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedImagePreview(mentorMediaAssets[0])}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={13} color={Palette.accentSky} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          decelerationRate="fast"
          snapToInterval={galleryCardWidth + 14}
          snapToAlignment="start"
        >
          {mentorMediaAssets.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              activeOpacity={0.9}
              onPress={() => setSelectedImagePreview(asset)}
              style={[styles.galleryCard, { width: galleryCardWidth }]}
            >
              {/* Grayscale treatment for photos */}
              <Image
                source={{ uri: asset.uri }}
                style={styles.galleryCardImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.92)"]}
                style={styles.galleryCardGradient}
              >
                <Text style={styles.galleryCardTitle}>{asset.title}</Text>
                <Text style={styles.galleryCardCaption} numberOfLines={2}>
                  {asset.caption}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ======================================================== */}
        {/* 4. VOICE NOTES SECTION                                   */}
        {/* ======================================================== */}
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.sectionTitle}>Voice Notes & Audio Memos</Text>
            <Text style={styles.sectionSub}>
              Listen to or record voice memories for {mentor.name}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setActiveVoiceModal({
                  title: `Voice Note for ${mentor.name}`,
                  mentorName: mentor.name,
                  duration: "00:45",
                  description: `Heartfelt voice note dedicated to ${mentor.name}`,
                });
                setVoiceModalMode("record");
                setIsVoiceModalOpen(true);
              }}
              style={[styles.viewAllBtn, { backgroundColor: "#20191D", borderColor: Palette.accentPink }]}
            >
              <Ionicons name="mic" size={13} color={Palette.accentPink} />
              <Text style={[styles.viewAllText, { color: Palette.accentPink }]}>Record</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (mentorVoiceNotes[0]) {
                  setVoiceModalMode("listen");
                  handleOpenVoiceMemo(mentorVoiceNotes[0]);
                }
              }}
              style={styles.viewAllBtn}
            >
              <Text style={styles.viewAllText}>Listen All</Text>
              <Ionicons name="chevron-forward" size={13} color={Palette.accentSky} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          decelerationRate="fast"
          snapToInterval={voiceCardWidth + 14}
          snapToAlignment="start"
        >
          {mentorVoiceNotes.map((vn) => (
            <VoiceLessonCard
              key={vn.id}
              item={vn}
              cardWidth={voiceCardWidth}
              onPress={() => handleOpenVoiceMemo(vn)}
              onPlayPress={() => handleOpenVoiceMemo(vn)}
            />
          ))}
        </ScrollView>

        {/* ======================================================== */}
        {/* 5. HONOURED MILESTONES DEDICATED                         */}
        {/* ======================================================== */}
        {mentorMilestones.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Milestones Dedicated to {mentor.name.split(" ")[0]}
                </Text>
                <Text style={styles.sectionSub}>
                  Achievements shaped by their guidance
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/memory-wall")}
                style={styles.viewAllBtn}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={13} color={Palette.accentSky} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              decelerationRate="fast"
              snapToInterval={milestoneCardWidth + 14}
              snapToAlignment="start"
            >
              {mentorMilestones.map((ms) => (
                <MilestoneDedicationCard
                  key={ms.id}
                  item={ms}
                  cardWidth={milestoneCardWidth}
                  onPress={() =>
                    Alert.alert(ms.title, `Dedicated to ${ms.mentorName}\n\n“${ms.dedicationQuote}”`)
                  }
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* ======================================================== */}
        {/* 6. OUR STORY & MEMORY TIMELINE                           */}
        {/* ======================================================== */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Living Memory Timeline</Text>
            <Text style={styles.sectionSub}>
              Moments and keepsakes saved with {mentor.name}
            </Text>
          </View>
        </View>

        <View style={styles.timelineListContainer}>
          {memories.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.timelineMemoryCard}
              activeOpacity={0.88}
              onPress={() => handleOpenMemory(entry.id)}
            >
              <View style={styles.memoryCardTop}>
                <View style={styles.memoryKindBadge}>
                  <View style={styles.kindDot} />
                  <Text style={styles.memoryKindText}>
                    {entry.kind.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.memoryDateText}>
                  {entry.createdAt ? entry.createdAt.split("T")[0] : "Saved"}
                </Text>
              </View>

              <Text style={styles.memoryTitleText}>
                {"title" in entry && entry.title
                  ? entry.title
                  : "lessonTitle" in entry && entry.lessonTitle
                  ? entry.lessonTitle
                  : "Memory Keepsake"}
              </Text>

              <Text style={styles.memoryStoryText} numberOfLines={3}>
                {"story" in entry && entry.story
                  ? entry.story
                  : "excerpt" in entry && entry.excerpt
                  ? entry.excerpt
                  : "quote" in entry && entry.quote
                  ? `“${entry.quote}”`
                  : "A special moment remembered with gratitude."}
              </Text>

              <View style={styles.memoryCardFooter}>
                <Text style={styles.memoryReadText}>Read Full Keepsake</Text>
                <Ionicons name="arrow-forward" size={13} color={Palette.accentSky} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      <BottomNavigation
        activeTab="mentors"
        onTabChange={(tab) => {
          if (tab === "home") router.push("/home");
          else if (tab === "discover") router.push("/discover");
          else if (tab === "saved") router.push("/saved-items");
          else if (tab === "profile") router.push("/profile");
        }}
        onCreatePress={handleAddMemory}
      />

      {/* Dropdown Options Menu */}
      {isMenuVisible && (
        <>
          <TouchableOpacity
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={() => setIsMenuVisible(false)}
          />
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleAddMemory}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={18} color={Palette.accentMint} />
              <Text style={styles.menuItemText}>Add Memory Note</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleOpenEditModal}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={18} color={Palette.accentAmber} />
              <Text style={styles.menuItemText}>Edit Mentor Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleCreateTribute}
              activeOpacity={0.7}
            >
              <Ionicons name="ribbon-outline" size={18} color={Palette.accentLavender} />
              <Text style={styles.menuItemText}>Create Appreciation Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleShareProfile}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social-outline" size={18} color={Palette.textPrimary} />
              <Text style={styles.menuItemText}>Share Profile</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Creative Voice Note Modal */}
      <CreativeVoiceModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voiceNote={activeVoiceModal}
        mode={voiceModalMode}
      />

      {/* Image Fullscreen Preview Modal */}
      <Modal
        visible={!!selectedImagePreview}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImagePreview(null)}
      >
        <View style={styles.imageModalBackdrop}>
          <SafeAreaView style={styles.imageModalSafeArea}>
            <View style={styles.imageModalHeader}>
              <TouchableOpacity
                onPress={() => setSelectedImagePreview(null)}
                style={styles.imageModalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {selectedImagePreview && (
              <View style={styles.imageModalBody}>
                <Image
                  source={{ uri: selectedImagePreview.uri }}
                  style={styles.imageModalFullImage}
                  resizeMode="contain"
                />
                <View style={styles.imageModalCaptionBox}>
                  <Text style={styles.imageModalTitle}>
                    {selectedImagePreview.title}
                  </Text>
                  <Text style={styles.imageModalCaption}>
                    {selectedImagePreview.caption}
                  </Text>
                </View>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <Text style={styles.editModalHeader}>Edit Mentor Details</Text>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Mentor Full Name"
              placeholderTextColor="#737373"
            />
            <TextInput
              style={styles.editInput}
              value={editRelationship}
              onChangeText={setEditRelationship}
              placeholder="Relationship (e.g. Literature Teacher)"
              placeholderTextColor="#737373"
            />
            <TextInput
              style={[styles.editInput, styles.editMultiline]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="How this mentor shaped your journey..."
              placeholderTextColor="#737373"
              multiline
            />
            <View style={styles.editButtonRow}>
              <TouchableOpacity
                style={styles.editCancelBtn}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.editCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editSaveBtn} onPress={handleSaveEdit}>
                <Text style={styles.editSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#050505", // Deep black background for main screen
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  /* 1. Creative Hero Section */
  heroContainer: {
    width: "100%",
    height: 380,
    position: "relative",
    backgroundColor: "#000000",
  },
  heroBackgroundPhoto: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingBottom: 22,
  },
  heroTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.select({ ios: 0, android: 16, default: 16 }),
  },
  heroTopActions: {
    flexDirection: "row",
    gap: 10,
  },
  heroCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  heroCircleBtnBookmarked: {
    backgroundColor: "rgba(255, 184, 0, 0.15)",
    borderColor: "rgba(255, 184, 0, 0.5)",
  },
  heroContent: {
    marginBottom: 4,
  },
  heroBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF", // Bright white mentor name
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#D1D5DB", // Soft grey
    fontWeight: "600",
    marginTop: 4,
  },
  heroLocation: {
    fontSize: 12.5,
    color: "#9CA3AF",
    marginTop: 2,
    marginBottom: 16,
  },

  /* Action Selector Pills */
  pillSelectorRow: {
    flexDirection: "row",
    backgroundColor: "rgba(18, 18, 18, 0.85)",
    borderRadius: 24,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  selectorPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectorPillActive: {
    backgroundColor: "#222222",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.65)",
  },
  selectorPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  /* 2. Host Narrative Card */
  hostCardContainer: {
    paddingHorizontal: 16,
    marginTop: -16,
    zIndex: 10,
  },
  hostCard: {
    backgroundColor: "#121212", // Subtle dark-grey layer creating depth
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  hostAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  hostAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  hostTextWrap: {
    flex: 1,
  },
  hostPreTitle: {
    fontSize: 10.5,
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  hostName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  hostDescription: {
    fontSize: 13.5,
    lineHeight: 21,
    color: "#D1D5DB", // Soft grey
    marginBottom: 14,
  },
  quotePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1A1A1A",
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  quotePillText: {
    flex: 1,
    fontSize: 12.5,
    fontStyle: "italic",
    color: "#F3F4F6",
    lineHeight: 18,
    fontFamily: AppFonts.body,
  },

  /* Action Grid Buttons (Bookmark, Add Memory, Tribute, Share) */
  actionGridRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  actionGridBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#1B1B1B",
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  actionGridText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E5E5E5",
  },

  hostFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  memoryCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memoryCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#A3A3A3",
  },

  /* Section Headers */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF", // Bright white
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12.5,
    color: "#9CA3AF", // Soft grey
    marginTop: 3,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: Palette.accentSky,
  },

  /* Horizontal Carousel container */
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 6,
    marginBottom: 8,
  },

  /* Shared Photos Gallery */
  galleryCard: {
    height: 190,
    borderRadius: 22,
    overflow: "hidden",
    marginRight: 14,
    position: "relative",
    backgroundColor: "#141414",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  galleryCardImage: {
    width: "100%",
    height: "100%",
  },
  galleryCardGradient: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
    padding: 12,
  },
  galleryCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 3,
  },
  galleryCardCaption: {
    fontSize: 11.5,
    color: "#D1D5DB",
    lineHeight: 16,
  },

  /* Timeline Memory Cards */
  timelineListContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  timelineMemoryCard: {
    backgroundColor: "#141414", // Subtle dark-grey layer
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  memoryCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  memoryKindBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  kindDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.accentMint,
  },
  memoryKindText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  memoryDateText: {
    fontSize: 11.5,
    color: "#737373",
  },
  memoryTitleText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  memoryStoryText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#D1D5DB",
    marginBottom: 12,
  },
  memoryCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  memoryReadText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: Palette.accentSky,
  },

  /* Missing State */
  safeMissing: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "center",
    alignItems: "center",
  },
  missingContainer: {
    padding: 30,
    alignItems: "center",
  },
  missingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#181818",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  missingSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  missingReturnBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  missingReturnText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },

  /* Dropdown Menu */
  menuBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 99,
  },
  menuDropdown: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#181818",
    borderRadius: 18,
    padding: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
    zIndex: 100,
    minWidth: 210,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  menuItemText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  /* Image Fullscreen Modal */
  imageModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.96)",
  },
  imageModalSafeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  imageModalHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "flex-end",
  },
  imageModalCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  imageModalFullImage: {
    width: "100%",
    height: "70%",
    borderRadius: 16,
  },
  imageModalCaptionBox: {
    marginTop: 20,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    textAlign: "center",
  },
  imageModalCaption: {
    fontSize: 14,
    color: "#D1D5DB",
    textAlign: "center",
    lineHeight: 20,
  },

  /* Edit Modal */
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  editModalContent: {
    backgroundColor: "#161616",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  editModalHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  editInput: {
    backgroundColor: "#222222",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  editMultiline: {
    height: 80,
    textAlignVertical: "top",
  },
  editButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  editCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  editCancelText: {
    color: "#9CA3AF",
    fontWeight: "700",
  },
  editSaveBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  editSaveText: {
    color: "#000000",
    fontWeight: "800",
  },
});
