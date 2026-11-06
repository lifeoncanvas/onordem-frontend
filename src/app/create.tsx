import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

// Design System
import { Palette } from "@/constants/theme";

// Create Screen Editorial Components
import {
  CreateHeader,
  CreationCardsSection,
  DraftsSection,
  InspirationJournal,
} from "@/components/Create";
import BottomNavigation from "@/components/home/BottomNavigation";

// Types & Data
import {
  CreationDraft,
  CreationType,
  InspirationPrompt,
} from "@/types/create";
import { CREATION_OPTIONS, INSPIRATION_PROMPTS } from "@/data/createStudioData";
import { creationDraftService } from "@/services/creationDraftService";
import { tributeDraftService } from "@/services/tributeDraftService";
import VideoUploadModal from "@/components/Create/VideoUploadModal";

function isCreationType(value: string | undefined): value is CreationType {
  return (
    value === "tribute" ||
    value === "appreciation" ||
    value === "note" ||
    value === "letter" ||
    value === "memo" ||
    value === "memory" ||
    value === "lesson"
  );
}

type CreationRouteParams = {
  mentorName?: string | string[];
  relationship?: string | string[];
  prompt?: string;
  promptQuestion?: string;
  draftId?: string;
};

function navigateToCreation(
  type: CreationType,
  params: CreationRouteParams,
  replace = false
) {
  if (type === "tribute" || type === "appreciation") {
    const href = { pathname: "/create-tribute" as const, params };
    if (replace) router.replace(href);
    else router.push(href);
    return;
  }

  if (type === "memo" || type === "memory") {
    const href = { pathname: "/memo" as const, params };
    if (replace) router.replace(href);
    else router.push(href);
  } else if (type === "note" || type === "lesson") {
    const href = { pathname: "/note" as const, params };
    if (replace) router.replace(href);
    else router.push(href);
  } else {
    const href = { pathname: "/open-letter" as const, params };
    if (replace) router.replace(href);
    else router.push(href);
  }
}

export default function CreateScreen() {
  const params = useLocalSearchParams<{
    type?: string;
    mentorName?: string;
    relationship?: string;
  }>();

  // Video Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Studio selection
  const [selectedCreationType, setSelectedCreationType] = useState<CreationType>(
    () => (isCreationType(params.type) ? params.type : "tribute")
  );
  const [drafts, setDrafts] = useState<CreationDraft[]>(() => creationDraftService.getDrafts());
  const [tributeDrafts, setTributeDrafts] = useState(() => tributeDraftService.getDrafts());
  const allDrafts = useMemo(
    () => [
      ...drafts,
      ...tributeDrafts.map((draft): CreationDraft => ({
        id: draft.id,
        type: "tribute",
        title: `Appreciation for ${draft.payload.mentorName}`,
        mentorName: draft.payload.mentorName,
        previewText: draft.payload.story,
        lastEdited: new Date(draft.updatedAt).toLocaleDateString(),
      })),
    ],
    [drafts, tributeDrafts]
  );

  React.useEffect(() => {
    creationDraftService.initialize().catch((error: unknown) => {
      console.error("Unable to load creation drafts:", error);
      Alert.alert("Drafts unavailable", "Saved drafts could not be loaded from this device.");
    });
    const unsubscribeCreation = creationDraftService.subscribe(() => {
      setDrafts(creationDraftService.getDrafts());
    });
    const unsubscribeTribute = tributeDraftService.subscribe(() => {
      setTributeDrafts(tributeDraftService.getDrafts());
    });
    return () => {
      unsubscribeCreation();
      unsubscribeTribute();
    };
  }, []);

  React.useEffect(() => {
    if (!isCreationType(params.type)) return;
    navigateToCreation(params.type, {
      mentorName: params.mentorName,
      relationship: params.relationship,
    }, true);
  }, [params.type, params.mentorName, params.relationship]);

  // Feedback toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastFade = useMemo(() => new Animated.Value(0), []);

  // Smooth entrance animation
  const entranceFade = useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    Animated.timing(entranceFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [entranceFade]);

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastFade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(toastFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastMessage(null);
    });
  };

  // Handle card selection: opens the respective creation flow
  const handleSelectOption = (type: CreationType) => {
    setSelectedCreationType(type);
    navigateToCreation(type, {
      mentorName: params.mentorName,
      relationship: params.relationship,
    });
  };

  // Handle Inspiration "Start Creating" button
  const handleStartFromInspiration = (prompt: InspirationPrompt) => {
    setSelectedCreationType(prompt.suggestedType);
    navigateToCreation(prompt.suggestedType, {
      prompt: prompt.question,
      promptQuestion: prompt.question,
    });
  };

  // Handle resuming a draft
  const handleResumeDraft = (draft: CreationDraft) => {
    setSelectedCreationType(draft.type);
    navigateToCreation(draft.type, { draftId: draft.id });
  };

  // Discard draft
  const handleDeleteDraft = (draftId: string) => {
    Alert.alert(
      "Discard Draft?",
      "Are you sure you want to remove this memory draft?",
      [
        { text: "Keep Draft", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: async () => {
            try {
              const isTribute = tributeDrafts.some((draft) => draft.id === draftId);
              if (isTribute) await tributeDraftService.removeDraft(draftId);
              else await creationDraftService.removeDraft(draftId);
              showToast("Draft removed from studio");
            } catch (error) {
              console.error("Unable to remove creation draft:", error);
              Alert.alert("Could not remove draft", "Please try again.");
            }
          },
        },
      ]
    );
  };

  const scrollViewRef = useRef<ScrollView>(null);

  const handlePressDrafts = () => {
    if (allDrafts.length === 0) {
      showToast("No unfinished drafts right now");
      scrollViewRef.current?.scrollToEnd({ animated: true });
      return;
    }
    if (allDrafts.length === 1) {
      handleResumeDraft(allDrafts[0]);
      return;
    }
    Alert.alert(
      "Resume Draft",
      `You have ${allDrafts.length} unfinished drafts. Choose one to open:`,
      [
        ...allDrafts.slice(0, 3).map((d) => ({
          text: d.title || d.mentorName || "Draft",
          onPress: () => handleResumeDraft(d),
        })),
        {
          text: "View All Drafts",
          onPress: () => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />

      {/* Warm Background Parchment Canvas */}
      <View style={styles.paperCanvas} />

      {/* Main Studio Viewport */}
      <Animated.View style={[styles.mainContainer, { opacity: entranceFade }]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ======================================================== */}
          {/* 1. DISTINCTIVE HEADER: Let's celebrate someone           */}
          {/* ======================================================== */}
          <CreateHeader
            draftCount={allDrafts.length}
            onPressDrafts={handlePressDrafts}
          />

          {/* Toast Notification Banner */}
          {toastMessage && (
            <Animated.View style={[styles.toastBanner, { opacity: toastFade }]}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={Palette.pureWhite}
              />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>
          )}

          {/* ======================================================== */}
          {/* 2. MAIN SECTION: What Would You Like to Create? (5 Options)*/}
          {/* ======================================================== */}
          <CreationCardsSection
            options={CREATION_OPTIONS}
            selectedType={selectedCreationType}
            onSelectOption={handleSelectOption}
          />

          {/* Quick Action: Video Keepsake Upload / Record */}
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.push("/upload-memory")}
              activeOpacity={0.85}
              style={styles.videoUploadBanner}
              accessibilityRole="button"
              accessibilityLabel="Upload photos, videos and audio"
            >
              <View style={styles.videoBannerLeft}>
                <View style={styles.videoIconCircle}>
                  <Ionicons name="images" size={20} color={Palette.accentSky} />
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.videoBannerTitle}>Photos, Videos &amp; Audio</Text>
                  <Text style={styles.videoBannerSub}>Upload from your library or record a voice note</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={16} color={Palette.accentSky} />
            </TouchableOpacity>
          </View>

          {/* ======================================================== */}
          {/* 3. INSPIRATION SECTION: A Thought Worth Keeping          */}
          {/* ======================================================== */}
          <InspirationJournal
            prompts={INSPIRATION_PROMPTS}
            onStartCreating={handleStartFromInspiration}
          />

          {/* ======================================================== */}
          {/* 4. RECENT CREATIONS: Pick Up Where You Left Off          */}
          {/* ======================================================== */}
          <DraftsSection
            drafts={allDrafts}
            onResumeDraft={handleResumeDraft}
            onDeleteDraft={handleDeleteDraft}
            onStartFirstMemory={() => handleSelectOption("tribute")}
          />

          {/* Bottom Spacing to ensure bottom navigation does not obscure content */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>

      {/* Floating Bottom Navigation Bar (Active: Create) */}
      <BottomNavigation activeTab="create" />

      {/* Video Upload Modal */}
      <VideoUploadModal
        visible={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  videoUploadBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#161616",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  videoBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  videoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(143, 211, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  videoBannerSub: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  paperCanvas: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Palette.iceWhite,
  },
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  bottomSpacer: {
    height: 115,
  },
  toastBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Palette.pureWhite,
  },
});
