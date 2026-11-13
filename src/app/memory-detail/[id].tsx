import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Design System Tokens
import { AppFonts, BottomTabInset, Palette } from "@/constants/theme";

// Shared Navigation
import BottomNavigation from "@/components/home/BottomNavigation";
import AudioPlaybackControls from "@/components/home/AudioPlaybackControls";
import MemoryVideo from "@/components/MemoryVideo";
import DemoWaveformPlayer from "@/components/DemoWaveformPlayer";


// Types & Services
import { memoryService } from "@/services/memoryService";
import { WallItem } from "@/types/memoryWall";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** A built-in sample memory that describes a voice recording but has no audio file. */
function isSampleVoiceMemory(item: WallItem): boolean {
  if (item.kind !== "memory" || item.audioUri) return false;
  if (item.audioDuration) return true;
  return /voice|voicemail|recording|audio|spoken/i.test(`${item.title} ${item.excerpt}`);
}

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<WallItem | undefined>(() =>
    id ? memoryService.getMemoryById(id) : undefined
  );
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editQuote, setEditQuote] = useState("");
  const [editStory, setEditStory] = useState("");
  const [editLesson, setEditLesson] = useState("");

  // Subscribe to service updates
  React.useEffect(() => {
    if (!id) return;
    const sync = () => {
      setItem(memoryService.getMemoryById(id));
    };
    sync();
    const unsubscribe = memoryService.subscribe(sync);
    return () => {
      unsubscribe();
    };
  }, [id]);

  // Derive title, story, and image unconditionally
  const displayTitle = useMemo(() => {
    if (!item) return "";
    if ("title" in item && item.title) return item.title;
    if ("lessonTitle" in item && item.lessonTitle) return item.lessonTitle;
    return `In Honour of ${item.mentorName}`;
  }, [item]);

  const displayStory = useMemo(() => {
    if (!item) return "";
    if (item.kind === "letter") {
      return item.letterBody || item.preview || "";
    }
    if ("story" in item && item.story) return item.story;
    if ("description" in item && item.description) return item.description;
    if ("excerpt" in item && item.excerpt) return item.excerpt;
    return "";
  }, [item]);

  const displayQuote = useMemo(() => {
    if (item && "quote" in item && item.quote) return item.quote;
    return null;
  }, [item]);

  const primaryPhoto = useMemo(() => {
    if (!item) return null;
    if ("photoUri" in item && item.photoUri) return item.photoUri;
    if ("imageUri" in item && item.imageUri) return item.imageUri;
    return null;
  }, [item]);

  const additionalPhotos = useMemo(() => {
    if (item && item.additionalImages && item.additionalImages.length > 0) {
      return item.additionalImages;
    }
    return [];
  }, [item]);

  const lessonCarried = useMemo(() => {
    if (!item) return null;
    if (item.lessonCarried) return item.lessonCarried;
    if (item.kind === "lesson" && item.story) return item.story;
    return null;
  }, [item]);

  const momentToRemember = useMemo(() => {
    if (item && item.momentToRemember) return item.momentToRemember;
    return null;
  }, [item]);

  const achievements = useMemo(() => {
    if (item && item.achievements && item.achievements.length > 0) {
      return item.achievements;
    }
    return null;
  }, [item]);

  const badgeConfig = useMemo(() => {
    if (!item) {
      return { label: "Memory", icon: "document-text", color: Palette.oceanTeal };
    }
    switch (item.kind) {
      case "tribute":
        return { label: "Appreciation Card", icon: "heart", color: Palette.accentCoral };
      case "memory":
        return { label: "Cherished Memory", icon: "images", color: Palette.accentLavender };
      case "letter":
        return { label: "Personal Letter", icon: "mail", color: Palette.accentPeach };
      case "lesson":
        return {
          label: item.category === "Note" ? "Personal Note" : "Life Lesson",
          icon: item.category === "Note" ? "create" : "bulb",
          color: Palette.accentSky,
        };
      case "milestone":
        return { label: "Milestone", icon: "flag", color: Palette.accentAmber };
    }
  }, [item]);

  // Split story into clean paragraphs
  const paragraphs = useMemo(() => {
    return displayStory
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [displayStory]);

  // Handle Missing or Deleted Memory
  if (!item) {
    return (
      <SafeAreaView style={styles.safeMissing} edges={["top", "bottom"]}>
        <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />
        <View style={styles.missingContainer}>
          <View style={styles.missingIconCircle}>
            <Ionicons name="document-text-outline" size={42} color={Palette.textSecondary} />
          </View>
          <Text style={styles.missingTitle}>Memory Not Found</Text>
          <Text style={styles.missingSubtitle}>
            This memory may have been removed or is no longer available in your keepsake collection.
          </Text>
          <TouchableOpacity
            style={styles.missingReturnBtn}
            onPress={() => router.replace("/memory-wall")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Return to Memory Wall"
          >
            <Ionicons name="arrow-back" size={18} color={Palette.pureWhite} />
            <Text style={styles.missingReturnText}>Return to Memory Wall</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Handlers
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/memory-wall");
    }
  };

  const handleOpenMentorProfile = () => {
    if (item.mentorId) {
      router.push({
        pathname: "/mentor-profile/[id]",
        params: { id: item.mentorId },
      });
    } else {
      // Find mentor profile by name
      const mentors = memoryService.getAllMentorProfiles();
      const match = mentors.find(
        (m) => m.name.toLowerCase() === item.mentorName.toLowerCase()
      );
      if (match) {
        router.push({
          pathname: "/mentor-profile/[id]",
          params: { id: match.id },
        });
      } else {
        router.push({
          pathname: "/mentor-profile/[id]",
          params: { id: item.mentorName },
        });
      }
    }
  };

  const handleShare = async () => {
    try {
      let shareMsg = `"${displayTitle}" — In Honour of ${item.mentorName} (${item.relationship || "Mentor"})\n\n`;
      if (displayQuote) {
        shareMsg += `“${displayQuote}”\n\n`;
      }
      if (displayStory) {
        shareMsg += `${displayStory}\n\n`;
      }
      shareMsg += `Preserved with Honour Your Mentor.`;

      await Share.share({
        title: displayTitle,
        message: shareMsg,
      });
    } catch {
      Alert.alert("Share", "Unable to share memory at this time.");
    }
  };

  const handleTogglePin = () => {
    memoryService.togglePin(item.id);
    setIsMenuVisible(false);
  };

  const handleDelete = () => {
    setIsMenuVisible(false);
    const executeDelete = () => {
      memoryService.deleteMemory(item.id);
      handleBack();
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm) {
        if (window.confirm(`Are you sure you want to delete this memory for ${item.mentorName}? This cannot be undone.`)) {
          executeDelete();
        }
      } else {
        executeDelete();
      }
    } else {
      Alert.alert(
        "Delete Memory",
        `Are you sure you want to delete this memory for ${item.mentorName}? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: executeDelete,
          },
        ]
      );
    }
  };

  const handleOpenEdit = () => {
    setIsMenuVisible(false);
    setEditTitle(displayTitle);
    setEditQuote(displayQuote || "");
    setEditStory(displayStory);
    setEditLesson(lessonCarried || "");
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editStory.trim() && !editTitle.trim()) {
      Alert.alert("Incomplete Memory", "Please provide a title or story.");
      return;
    }

    const updated = { ...item };
    if (updated.kind === "lesson") {
      updated.lessonTitle = editTitle.trim();
    } else {
      updated.title = editTitle.trim();
    }

    if ("quote" in updated) {
      updated.quote = editQuote.trim();
    }

    if (updated.kind === "letter") {
      updated.letterBody = editStory.trim();
    } else {
      updated.story = editStory.trim();
    }

    if (editLesson.trim()) {
      updated.lessonCarried = editLesson.trim();
    }

    memoryService.updateMemory(updated as WallItem);
    setIsEditModalVisible(false);
    Alert.alert("Saved", "Your edits have been preserved.");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />

      {/* Floating Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={styles.navIconBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to Memory Wall"
        >
          <Ionicons name="chevron-back" size={22} color={Palette.pureWhite} />
        </TouchableOpacity>

        <View style={styles.navTitleContainer}>
          <Text style={styles.navMentorName} numberOfLines={1}>
            {item.mentorName}
          </Text>
          <Text style={styles.navRelationship} numberOfLines={1}>
            {item.relationship || badgeConfig.label}
          </Text>
        </View>

        <View style={styles.navActionsRow}>
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.7}
            style={styles.navIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Share this memory"
          >
            <Ionicons name="share-outline" size={20} color={Palette.pureWhite} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsMenuVisible((prev) => !prev)}
            activeOpacity={0.7}
            style={styles.navIconBtn}
            accessibilityRole="button"
            accessibilityLabel="More actions"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={Palette.pureWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Context Menu Dropdown */}
      {isMenuVisible && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleOpenEdit}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color={Palette.textPrimary} />
            <Text style={styles.menuItemText}>Edit Memory</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleTogglePin}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.isPinned ? "bookmark" : "bookmark-outline"}
              size={18}
              color={Palette.textPrimary}
            />
            <Text style={styles.menuItemText}>
              {item.isPinned ? "Unpin Memory" : "Pin to Top"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleOpenMentorProfile}
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={18} color={Palette.textPrimary} />
            <Text style={styles.menuItemText}>View Mentor Profile</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#D32F2F" />
            <Text style={[styles.menuItemText, { color: "#D32F2F" }]}>Delete Memory</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Memory Cover (Editorial Framing) ── */}
        <View style={styles.coverWrapper}>
          {primaryPhoto ? (
            <View style={styles.photoFrame}>
              <Image source={{ uri: primaryPhoto }} style={styles.coverImage} resizeMode="cover" />
              <View style={styles.photoOverlayGradient} />
            </View>
          ) : (
            <View style={styles.textCoverPlaceholder}>
              <View style={styles.waxSeal}>
                <Ionicons name={badgeConfig.icon as any} size={28} color={Palette.pureWhite} />
              </View>
            </View>
          )}

          {/* Cover Details Card */}
          <View style={styles.coverCard}>
            <View style={styles.badgeRow}>
              <View style={[styles.typeBadge, { backgroundColor: badgeConfig.color }]}>
                <Ionicons name={badgeConfig.icon as any} size={12} color={Palette.pureWhite} />
                <Text style={styles.typeBadgeText}>{badgeConfig.label}</Text>
              </View>

              {item.isPinned && (
                <View style={styles.pinnedBadge}>
                  <Ionicons name="bookmark" size={12} color={Palette.turquoise} />
                  <Text style={styles.pinnedBadgeText}>Pinned</Text>
                </View>
              )}

              {item.createdAt && (
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              )}
            </View>

            <Text style={styles.memoryTitle}>{displayTitle}</Text>

            {/* Mentor Badge (Clickable to Mentor Profile) */}
            <TouchableOpacity
              onPress={handleOpenMentorProfile}
              activeOpacity={0.75}
              style={styles.mentorLinkBadge}
              accessibilityRole="button"
              accessibilityLabel={`View profile of mentor ${item.mentorName}`}
            >
              <View style={styles.mentorAvatarCircle}>
                <Text style={styles.mentorAvatarInitial}>
                  {item.mentorName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.mentorLinkInfo}>
                <Text style={styles.mentorLinkLabel}>Mentor</Text>
                <Text style={styles.mentorLinkName}>{item.mentorName}</Text>
              </View>
              <View style={styles.viewProfileChevron}>
                <Text style={styles.viewProfileText}>Timeline</Text>
                <Ionicons name="chevron-forward" size={14} color={Palette.turquoise} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 2. Distinct Saved Quote ── */}
        {displayQuote && (
          <View style={styles.quoteBox}>
            <View style={styles.quoteAccentBar} />
            <View style={styles.quoteBody}>
              <Text style={styles.quoteMark}>“</Text>
              <Text style={styles.quoteText}>{displayQuote}</Text>
              <Text style={styles.quoteAttribution}>— {item.mentorName}</Text>
            </View>
          </View>
        )}

        {/* ── 3. The Story / Letter Section ── */}
        <View style={styles.storyContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionHeading}>
              {item.kind === "letter"
                ? "The Letter"
                : item.kind === "lesson"
                ? item.category === "Note" ? "The Note" : "The Reflection"
                : "The Story"}
            </Text>
            <View style={styles.sectionLine} />
          </View>

          {item.kind === "letter" && item.salutation && (
            <Text style={styles.letterSalutation}>{item.salutation}</Text>
          )}

          <View style={styles.storyParagraphs}>
            {paragraphs.map((para, index) => (
              <Text key={`para-${index}`} style={styles.storyParagraph}>
                {para}
              </Text>
            ))}
          </View>

          {item.kind === "letter" && item.signoff && (
            <View style={styles.letterSignoffContainer}>
              <Text style={styles.letterSignoff}>{item.signoff}</Text>
              {item.signature ? <Text style={styles.letterSignoff}>{item.signature}</Text> : null}
            </View>
          )}
          {item.kind === "letter" && item.date ? (
            <Text style={styles.letterDate}>{item.date}</Text>
          ) : null}
        </View>

        {item.kind === "memory" && (item.audioUri || isSampleVoiceMemory(item)) && (
          <View style={styles.supportingCard}>
            <View style={styles.supportingCardHeader}>
              <View style={styles.supportingIconWrap}>
                <Ionicons name="mic-outline" size={18} color={Palette.turquoise} />
              </View>
              <Text style={styles.supportingCardTitle}>Voice memory</Text>
            </View>
            {item.audioUri ? (
              <AudioPlaybackControls
                uri={item.audioUri}
                title={displayTitle}
                durationSeconds={item.audioDuration}
              />
            ) : (
              // Sample voice memories have no recording: play the demo tribute.
              <DemoWaveformPlayer ownerId={`detail-${item.id}`} title={displayTitle} />
            )}
          </View>
        )}

        {/* ── 4. Supporting Content (Only when present) ── */}
        {/* A Lesson I Carry */}
        {lessonCarried && (
          <View style={styles.supportingCard}>
            <View style={styles.supportingCardHeader}>
              <View style={styles.supportingIconWrap}>
                <Ionicons name="bulb-outline" size={18} color={Palette.turquoise} />
              </View>
              <Text style={styles.supportingCardTitle}>A Lesson I Carry</Text>
            </View>
            <Text style={styles.supportingCardBody}>{lessonCarried}</Text>
          </View>
        )}

        {/* A Moment to Remember */}
        {momentToRemember && (
          <View style={styles.supportingCard}>
            <View style={styles.supportingCardHeader}>
              <View style={styles.supportingIconWrap}>
                <Ionicons name="sparkles-outline" size={18} color={Palette.turquoise} />
              </View>
              <Text style={styles.supportingCardTitle}>A Moment to Remember</Text>
            </View>
            <Text style={styles.supportingCardBody}>{momentToRemember}</Text>
          </View>
        )}

        {/* Achievements Along the Way */}
        {achievements && (
          <View style={styles.supportingCard}>
            <View style={styles.supportingCardHeader}>
              <View style={styles.supportingIconWrap}>
                <Ionicons name="trophy-outline" size={18} color={Palette.turquoise} />
              </View>
              <Text style={styles.supportingCardTitle}>Achievements Along the Way</Text>
            </View>
            <View style={styles.achievementsList}>
              {achievements.map((itemAchievement: string, idx: number) => (
                <View key={`ach-${idx}`} style={styles.achievementRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Palette.turquoise} />
                  <Text style={styles.achievementText}>{itemAchievement}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Photographs Collection */}
        {additionalPhotos.length > 0 && (
          <View style={styles.gallerySection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionHeading}>Keepsake Photographs</Text>
              <View style={styles.sectionLine} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryScroll}
            >
              {additionalPhotos.map((photoUri, index) => (
                <TouchableOpacity
                  key={`photo-${index}`}
                  activeOpacity={0.85}
                  style={styles.galleryThumbFrame}
                  onPress={() => setSelectedPhoto(photoUri)}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`Enlarge photo ${index + 1}`}
                >
                  <Image source={{ uri: photoUri }} style={styles.galleryThumb} resizeMode="cover" />
                  <View style={styles.galleryZoomIcon}>
                    <Ionicons name="expand" size={14} color={Palette.pureWhite} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Keepsake Videos */}
        {item.kind === "memory" && item.videoUris && item.videoUris.length > 0 && (
          <View style={styles.gallerySection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionHeading}>Keepsake Videos</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.videoList}>
              {item.videoUris.map((uri, index) => (
                <MemoryVideo
                  key={`video-${index}`}
                  uri={uri}
                  accessibilityLabel={`Video ${index + 1} of ${item.videoUris!.length}`}
                />
              ))}
            </View>
          </View>
        )}

        {/* Return Button at End of Keepsake */}
        <View style={styles.bottomActionsArea}>
          <TouchableOpacity
            style={styles.returnWallBtn}
            onPress={handleBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Return to Memory Wall"
          >
            <Ionicons name="arrow-back" size={18} color={Palette.deepTeal} />
            <Text style={styles.returnWallText}>Return to Memory Wall</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBottomBtn}
            onPress={handleShare}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Share this appreciation card"
          >
            <Ionicons name="share-social-outline" size={18} color={Palette.pureWhite} />
            <Text style={styles.shareBottomText}>Share Memory</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Photo Preview Modal ── */}
      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setSelectedPhoto(null)}
            accessibilityRole="button"
            accessibilityLabel="Close enlarged photo"
          >
            <Ionicons name="close" size={26} color={Palette.pureWhite} />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto }}
              style={styles.enlargedImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* ── In-Place Edit Modal ── */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.editModalContainer} edges={["top", "bottom"]}>
          <View style={styles.editModalHeader}>
            <TouchableOpacity
              onPress={() => setIsEditModalVisible(false)}
              style={styles.editModalCancel}
            >
              <Text style={styles.editModalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.editModalTitle}>Edit Memory</Text>
            <TouchableOpacity onPress={handleSaveEdit} style={styles.editModalSave}>
              <Text style={styles.editModalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editModalScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.editLabel}>Title</Text>
            <TextInput
              style={styles.editInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Memory Title"
              placeholderTextColor={Palette.textMuted}
            />

            <Text style={styles.editLabel}>Quote or Words of Wisdom</Text>
            <TextInput
              style={[styles.editInput, styles.editTextAreaShort]}
              value={editQuote}
              onChangeText={setEditQuote}
              placeholder="Quote from mentor"
              placeholderTextColor={Palette.textMuted}
              multiline
            />

            <Text style={styles.editLabel}>The Full Story / Reflection</Text>
            <TextInput
              style={[styles.editInput, styles.editTextAreaLarge]}
              value={editStory}
              onChangeText={setEditStory}
              placeholder="Write the full memory story..."
              placeholderTextColor={Palette.textMuted}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.editLabel}>A Lesson I Carry (Optional)</Text>
            <TextInput
              style={[styles.editInput, styles.editTextAreaShort]}
              value={editLesson}
              onChangeText={setEditLesson}
              placeholder="The lesson learned..."
              placeholderTextColor={Palette.textMuted}
              multiline
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Persistent Bottom Navigation */}
      <BottomNavigation activeTab="saved" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.deepTeal,
  },
  safeMissing: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  missingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  missingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  missingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginBottom: 10,
    textAlign: "center",
  },
  missingSubtitle: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  missingReturnBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
  },
  missingReturnText: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.pureWhite,
  },

  // Navigation Bar
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Palette.deepTeal,
  },
  navIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  navTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: "center",
  },
  navMentorName: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
  navRelationship: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    marginTop: 1,
  },
  navActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Context Menu Dropdown
  menuDropdown: {
    position: "absolute",
    top: 54,
    right: 16,
    zIndex: 999,
    width: 200,
    backgroundColor: Palette.pureWhite,
    borderRadius: 14,
    paddingVertical: 6,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.18)",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: Palette.textPrimary,
    fontWeight: "600",
  },
  menuDivider: {
    height: 1,
    backgroundColor: Palette.borderSubtle,
    marginVertical: 4,
  },

  // Scroll View
  scroll: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // 1. Cover
  coverWrapper: {
    backgroundColor: Palette.iceWhite,
  },
  photoFrame: {
    width: "100%",
    height: SCREEN_WIDTH * 0.72,
    position: "relative",
    backgroundColor: Palette.iceWhite,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  photoOverlayGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  textCoverPlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
  },
  waxSeal: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Palette.oceanTeal,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.25)",
  },
  coverCard: {
    backgroundColor: Palette.pureWhite,
    marginHorizontal: 16,
    marginTop: -28,
    borderRadius: 18,
    padding: 20,
    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.08)",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.pureWhite,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 184, 153, 0.14)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pinnedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.turquoise,
  },
  dateText: {
    fontSize: 12,
    color: Palette.textMuted,
    fontWeight: "500",
    marginLeft: "auto",
  },
  memoryTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Palette.deepTeal,
    lineHeight: 28,
    marginBottom: 16,
  },
  mentorLinkBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 10,
  },
  mentorAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.deepTeal,
    justifyContent: "center",
    alignItems: "center",
  },
  mentorAvatarInitial: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
  mentorLinkInfo: {
    flex: 1,
  },
  mentorLinkLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Palette.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mentorLinkName: {
    fontSize: 14,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  viewProfileChevron: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.turquoise,
  },

  // 2. Quote
  quoteBox: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: Palette.pureWhite,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
  },
  quoteAccentBar: {
    width: 5,
    backgroundColor: Palette.turquoise,
  },
  quoteBody: {
    flex: 1,
    padding: 16,
  },
  quoteMark: {
    fontSize: 32,
    lineHeight: 28,
    fontWeight: "900",
    color: Palette.turquoise,
    fontFamily: AppFonts.body,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    color: Palette.deepTeal,
    fontFamily: AppFonts.body,
  },
  quoteAttribution: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.textSecondary,
    marginTop: 8,
    textAlign: "right",
  },

  // 3. Story Section
  storyContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: Palette.pureWhite,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.04)",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.borderSubtle,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: Palette.deepTeal,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  letterSalutation: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.deepTeal,
    marginBottom: 14,
    fontFamily: AppFonts.body,
  },
  storyParagraphs: {
    gap: 14,
  },
  storyParagraph: {
    fontSize: 16,
    lineHeight: 26,
    color: Palette.textPrimary,
    fontFamily: AppFonts.body,
  },
  letterSignoffContainer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
  },
  letterSignoff: {
    fontSize: 15,
    fontStyle: "italic",
    color: Palette.textSecondary,
    fontFamily: AppFonts.body,
    lineHeight: 22,
  },
  letterDate: {
    fontSize: 11,
    color: Palette.textMuted,
    textAlign: "right",
    marginTop: 10,
  },

  // 4. Supporting Cards
  supportingCard: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: Palette.pureWhite,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.04)",
  },
  supportingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  supportingIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(143, 211, 255, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  supportingCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  supportingCardBody: {
    fontSize: 15,
    lineHeight: 23,
    color: Palette.textPrimary,
  },
  achievementsList: {
    gap: 8,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  achievementText: {
    fontSize: 14,
    color: Palette.textPrimary,
    fontWeight: "600",
  },

  // 5. Gallery
  gallerySection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  galleryScroll: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
  },
  galleryThumbFrame: {
    width: 130,
    height: 130,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  galleryThumb: {
    width: "100%",
    height: "100%",
  },
  videoList: {
    gap: 12,
    marginTop: 12,
  },
  galleryZoomIcon: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Bottom Area
  bottomActionsArea: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 20,
  },
  returnWallBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1.5,
    borderColor: Palette.deepTeal,
  },
  returnWallText: {
    fontSize: 14,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  shareBottomBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Palette.oceanTeal,
  },
  shareBottomText: {
    fontSize: 14,
    fontWeight: "700",
    color: Palette.pureWhite,
  },

  // Photo Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  enlargedImage: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_WIDTH * 0.95 * 1.3,
  },

  // Edit Modal
  editModalContainer: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
  },
  editModalCancel: {
    padding: 6,
  },
  editModalCancelText: {
    fontSize: 15,
    color: Palette.textSecondary,
    fontWeight: "600",
  },
  editModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  editModalSave: {
    padding: 6,
  },
  editModalSaveText: {
    fontSize: 15,
    color: Palette.turquoise,
    fontWeight: "800",
  },
  editModalScroll: {
    flex: 1,
    padding: 20,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.deepTeal,
    marginBottom: 6,
    marginTop: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editInput: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  editTextAreaShort: {
    minHeight: 70,
  },
  editTextAreaLarge: {
    minHeight: 180,
  },
});
