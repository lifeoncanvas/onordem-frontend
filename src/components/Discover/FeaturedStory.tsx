import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { Story } from "@/types/story";

interface FeaturedStoryProps {
  story: Story;
  onReadStory: (story: Story) => void;
  onToggleBookmark: (storyId: string) => void;
}

export default function FeaturedStory({
  story,
  onReadStory,
  onToggleBookmark,
}: FeaturedStoryProps) {
  return (
    <View style={styles.container}>
      {/* Editorial Section Header */}
      <View style={styles.sectionMeta}>
        <View style={styles.sectionBadge}>
          <Ionicons name="sparkles" size={12} color={Palette.turquoise} />
          <Text style={styles.sectionLabel}>FEATURED STORY</Text>
        </View>
        <Text style={styles.headline}>Someone Changed Everything</Text>
      </View>

      {/* Featured Editorial Card */}
      <View style={styles.card}>
        {/* Large Hero Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: story.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              "rgba(84, 0, 14, 0.05)",
              "rgba(84, 0, 14, 0.45)",
              "rgba(84, 0, 14, 0.92)",
            ]}
            locations={[0, 0.55, 1]}
            style={styles.gradientOverlay}
          />

          {/* Floating Top Bar: Relationship Badge + Bookmark */}
          <View style={styles.imageTopRow}>
            <View style={styles.relationshipTag}>
              <Ionicons name="school" size={12} color={Palette.deepTeal} />
              <Text style={styles.relationshipText}>{story.relationship}</Text>
            </View>

            <TouchableOpacity
              onPress={() => onToggleBookmark(story.id)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.bookmarkBtn}
              accessibilityRole="button"
              accessibilityLabel={
                story.isBookmarked
                  ? "Remove bookmark from featured story"
                  : "Bookmark featured story"
              }
            >
              <Ionicons
                name={story.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={18}
                color={story.isBookmarked ? Palette.turquoise : Palette.pureWhite}
              />
            </TouchableOpacity>
          </View>

          {/* Text Over Gradient */}
          <View style={styles.overlayContent}>
            <Text style={styles.storyTitle} numberOfLines={2}>
              {story.title}
            </Text>
            <Text style={styles.storyExcerpt} numberOfLines={3}>
              &ldquo;{story.excerpt}&rdquo;
            </Text>
          </View>
        </View>

        {/* Bottom Editorial Bar with Action */}
        <View style={styles.cardFooter}>
          <View style={styles.authorMeta}>
            <Text style={styles.authorText}>{story.author}</Text>
            <Text style={styles.readTimeText}>• {story.readTime}</Text>
          </View>

          <TouchableOpacity
            onPress={() => onReadStory(story)}
            activeOpacity={0.85}
            style={styles.readBtn}
            accessibilityRole="button"
            accessibilityLabel={`Read story: ${story.title}`}
          >
            <Text style={styles.readBtnText}>Read Their Story</Text>
            <Ionicons name="arrow-forward" size={15} color={Palette.pureWhite} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionMeta: {
    marginBottom: 12,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Palette.turquoise,
    letterSpacing: 1.2,
  },
  headline: {
    fontSize: 22,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.4,
  },
  card: {
    borderRadius: 22,
    backgroundColor: Palette.pureWhite,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  imageWrapper: {
    height: 250,
    width: "100%",
    position: "relative",
    justifyContent: "space-between",
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  imageTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    zIndex: 2,
  },
  relationshipTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  relationshipText: {
    fontSize: 11,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: 0.3,
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  overlayContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 2,
  },
  storyTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: Palette.pureWhite,
    marginBottom: 6,
    letterSpacing: -0.3,
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  storyExcerpt: {
    fontSize: 13.5,
    color: "rgba(255, 248, 240, 0.95)",
    lineHeight: 19,
    fontStyle: "italic",
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Palette.pureWhite,
    borderTopWidth: 1,
    borderColor: "rgba(177, 167, 166, 0.18)",
  },
  authorMeta: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  authorText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  readTimeText: {
    fontSize: 11,
    color: Palette.textMuted,
    marginLeft: 4,
  },
  readBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.oceanTeal, // Ocean Teal primary CTA
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  readBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.pureWhite,
  },
});
