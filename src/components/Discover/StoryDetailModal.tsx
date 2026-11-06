import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Palette } from "@/constants/theme";
import { Story } from "@/types/story";
import FollowButton from "@/components/FollowButton";
import { storyAuthorTarget } from "@/utils/followTargets";

interface StoryDetailModalProps {
  visible: boolean;
  story: Story | null;
  onClose: () => void;
  onToggleBookmark: (storyId: string) => void;
}

export default function StoryDetailModal({
  visible,
  story,
  onClose,
  onToggleBookmark,
}: StoryDetailModalProps) {
  const insets = useSafeAreaInsets();

  if (!story) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Navigation Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close story details"
          >
            <Ionicons name="close" size={20} color={Palette.deepTeal} />
          </TouchableOpacity>

          <Text style={styles.topBarTitle} numberOfLines={1}>
            {story.relationship} Story
          </Text>

          <TouchableOpacity
            onPress={() => onToggleBookmark(story.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.bookmarkBtn}
            accessibilityRole="button"
            accessibilityLabel={
              story.isBookmarked
                ? "Remove story bookmark"
                : "Bookmark story"
            }
          >
            <Ionicons
              name={story.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={story.isBookmarked ? Palette.turquoise : Palette.deepTeal}
            />
          </TouchableOpacity>
        </View>

        {/* Scrollable Story Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 40 },
          ]}
        >
          {/* Hero Cover */}
          <View style={styles.heroWrapper}>
            <Image
              source={{ uri: story.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>

          {/* Editorial Metadata */}
          <View style={styles.metaRow}>
            <View style={styles.relationshipPill}>
              <Ionicons name="sparkles" size={12} color={Palette.turquoise} />
              <Text style={styles.relationshipText}>{story.relationship}</Text>
            </View>
            <Text style={styles.readTimeText}>{story.readTime}</Text>
          </View>

          {/* Story Title */}
          <Text style={styles.title}>{story.title}</Text>

          {/* Author Byline */}
          <View style={styles.bylineWrap}>
            <View style={styles.bylineNames}>
              <Text style={styles.bylineText}>{story.author}</Text>
              <Text style={styles.bylineDate}>• In Honour Your Mentor Journal</Text>
            </View>
            <FollowButton person={storyAuthorTarget(story)} size="small" />
          </View>

          {/* Pull Excerpt */}
          <View style={styles.excerptCard}>
            <Text style={styles.excerptText}>&ldquo;{story.excerpt}&rdquo;</Text>
          </View>

          {/* Full Narrative Text */}
          <Text style={styles.bodyParagraph}>{story.fullStory}</Text>

          {/* Key Lesson Card */}
          {story.keyLesson && (
            <View style={styles.lessonCard}>
              <View style={styles.lessonHeader}>
                <Ionicons name="bulb" size={16} color={Palette.turquoise} />
                <Text style={styles.lessonTag}>CORE LESSON</Text>
              </View>
              <Text style={styles.lessonQuote}>&ldquo;{story.keyLesson}&rdquo;</Text>
            </View>
          )}

          {/* Bottom Gratitude Callout */}
          <View style={styles.gratitudeCallout}>
            <Text style={styles.gratitudeHeading}>
              Did this story remind you of someone?
            </Text>
            <Text style={styles.gratitudeSub}>
              Take a moment to create an appreciation card for the person who shaped you.
            </Text>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={styles.gratitudeBtn}
            >
              <Ionicons name="heart" size={16} color={Palette.pureWhite} />
              <Text style={styles.gratitudeBtnText}>Honour Your Own Mentor</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(177, 167, 166, 0.2)",
    backgroundColor: Palette.pureWhite,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroWrapper: {
    height: 230,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 18,
    backgroundColor: Palette.mintMist,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  relationshipPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.3)",
  },
  relationshipText: {
    fontSize: 11,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  readTimeText: {
    fontSize: 12,
    color: Palette.textMuted,
    fontWeight: "600",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: Palette.deepTeal,
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  bylineWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  bylineNames: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  bylineText: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  bylineDate: {
    fontSize: 12,
    color: Palette.textMuted,
    marginLeft: 4,
  },
  excerptCard: {
    backgroundColor: Palette.pureWhite,
    borderLeftWidth: 4,
    borderLeftColor: Palette.turquoise,
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  excerptText: {
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22,
    color: Palette.deepTeal,
    fontWeight: "600",
  },
  bodyParagraph: {
    fontSize: 15.5,
    lineHeight: 26,
    color: Palette.textPrimary,
    marginBottom: 24,
    letterSpacing: 0.1,
  },
  lessonCard: {
    backgroundColor: Palette.mintMist,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "rgba(236, 143, 62, 0.3)",
    marginBottom: 28,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  lessonTag: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.turquoise,
    letterSpacing: 1.2,
  },
  lessonQuote: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.deepTeal,
    lineHeight: 22,
    fontStyle: "italic",
  },
  gratitudeCallout: {
    backgroundColor: Palette.pureWhite,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  gratitudeHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.deepTeal,
    textAlign: "center",
    marginBottom: 6,
  },
  gratitudeSub: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  gratitudeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  gratitudeBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
});
