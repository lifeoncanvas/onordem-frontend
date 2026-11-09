import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { Story } from "@/types/story";

interface StoryCardProps {
  story: Story;
  index: number;
  onReadStory: (story: Story) => void;
  onToggleBookmark: (storyId: string) => void;
}

export default function StoryCard({
  story,
  index,
  onReadStory,
  onToggleBookmark,
}: StoryCardProps) {
  // Editorial visual rhythm: every 3rd card has a featured landscape card layout
  const isWide = index % 3 === 0;

  if (isWide) {
    return (
      <View style={styles.wideCard}>
        <View style={styles.wideImageWrapper}>
          <Image
            source={{ uri: story.imageUrl }}
            style={styles.wideImage}
            resizeMode="cover"
          />
          <View style={styles.wideTagRow}>
            <View style={styles.relationshipBadge}>
              <Text style={styles.relationshipBadgeText}>{story.relationship}</Text>
            </View>
            <TouchableOpacity
              onPress={() => onToggleBookmark(story.id)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.bookmarkRoundBtn}
              accessibilityRole="button"
              accessibilityLabel={
                story.isBookmarked
                  ? `Remove bookmark from ${story.title}`
                  : `Bookmark ${story.title}`
              }
            >
              <Ionicons
                name={story.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={16}
                color={story.isBookmarked ? Palette.turquoise : Palette.pureWhite}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.wideBody}>
          <Text style={styles.wideTitle} numberOfLines={2}>
            {story.title}
          </Text>
          <Text style={styles.wideExcerpt} numberOfLines={3}>
            {story.excerpt}
          </Text>

          <View style={styles.wideFooter}>
            <View style={styles.metaCol}>
              <Text style={styles.authorText}>{story.author}</Text>
              <Text style={styles.readTimeText}>{story.readTime}</Text>
            </View>

            <TouchableOpacity
              onPress={() => onReadStory(story)}
              activeOpacity={0.85}
              style={styles.readStoryBtn}
              accessibilityRole="button"
              accessibilityLabel={`Read story: ${story.title}`}
            >
              <Text style={styles.readStoryText}>Read Story</Text>
              <Ionicons name="arrow-forward" size={13} color={Palette.pureWhite} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Standard Magazine Card with Horizontal Split
  return (
    <View style={styles.compactCard}>
      <View style={styles.compactContentRow}>
        <Image
          source={{ uri: story.imageUrl }}
          style={styles.compactImage}
          resizeMode="cover"
        />

        <View style={styles.compactBody}>
          <View style={styles.compactHeaderRow}>
            <View style={styles.relationshipBadge}>
              <Text style={styles.relationshipBadgeText}>{story.relationship}</Text>
            </View>

            <TouchableOpacity
              onPress={() => onToggleBookmark(story.id)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.bookmarkSmallBtn}
              accessibilityRole="button"
              accessibilityLabel={
                story.isBookmarked
                  ? `Remove bookmark from ${story.title}`
                  : `Bookmark ${story.title}`
              }
            >
              <Ionicons
                name={story.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={16}
                color={story.isBookmarked ? Palette.turquoise : Palette.textMuted}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.compactTitle} numberOfLines={2}>
            {story.title}
          </Text>

          <Text style={styles.compactExcerpt} numberOfLines={2}>
            {story.excerpt}
          </Text>

          <View style={styles.compactFooter}>
            <Text style={styles.compactAuthor} numberOfLines={1}>
              {story.author}
            </Text>

            <TouchableOpacity
              onPress={() => onReadStory(story)}
              activeOpacity={0.8}
              style={styles.compactReadBtn}
              accessibilityRole="button"
              accessibilityLabel={`Read story: ${story.title}`}
            >
              <Text style={styles.compactReadText}>Read</Text>
              <Ionicons name="chevron-forward" size={13} color={Palette.oceanTeal} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Wide Magazine Card */
  wideCard: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
  },
  wideImageWrapper: {
    height: 170,
    width: "100%",
    position: "relative",
  },
  wideImage: {
    width: "100%",
    height: "100%",
  },
  wideTagRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  relationshipBadge: {
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.25)",
  },
  relationshipBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: 0.4,
  },
  bookmarkRoundBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  wideBody: {
    padding: 16,
  },
  wideTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  wideExcerpt: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  wideFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "rgba(177, 167, 166, 0.18)",
    paddingTop: 12,
  },
  metaCol: {
    flex: 1,
  },
  authorText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  readTimeText: {
    fontSize: 11,
    color: Palette.textMuted,
    marginTop: 1,
  },
  readStoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  readStoryText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Palette.pureWhite,
  },

  /* Compact Horizontal Card */
  compactCard: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 18,
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
  },
  compactContentRow: {
    flexDirection: "row",
    gap: 12,
  },
  compactImage: {
    width: 96,
    height: 104,
    borderRadius: 12,
  },
  compactBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  compactHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  bookmarkSmallBtn: {
    padding: 2,
  },
  compactTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Palette.deepTeal,
    lineHeight: 18,
    marginBottom: 3,
  },
  compactExcerpt: {
    fontSize: 12,
    color: Palette.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  compactFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compactAuthor: {
    fontSize: 11,
    fontWeight: "600",
    color: Palette.textMuted,
    maxWidth: "60%",
  },
  compactReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  compactReadText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },
});
