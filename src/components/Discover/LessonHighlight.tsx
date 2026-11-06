import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { LessonQuote } from "@/types/story";

interface LessonHighlightProps {
  lesson: LessonQuote;
  onSaveToggle: (lessonId: string) => void;
  onReadStory: (storyId: string) => void;
}

export default function LessonHighlight({
  lesson,
  onSaveToggle,
  onReadStory,
}: LessonHighlightProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={14} color={Palette.turquoise} />
          <Text style={styles.sectionHeading}>One Lesson Worth Keeping</Text>
        </View>
        <Text style={styles.wisdomBadge}>WISDOM</Text>
      </View>

      {/* Wisdom Card */}
      <View style={styles.card}>
        {/* Large Decorative Quote Symbol */}
        <Text style={styles.quoteSymbol}>“</Text>

        <Text style={styles.quoteText}>
          {lesson.quote}
        </Text>

        <View style={styles.attributionRow}>
          <View style={styles.dash} />
          <Text style={styles.attributionText}>{lesson.attribution}</Text>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => onReadStory(lesson.storyId)}
            activeOpacity={0.75}
            style={styles.storyLink}
            accessibilityRole="link"
            accessibilityLabel={`Read story for lesson: ${lesson.storyTitle}`}
          >
            <Text style={styles.storyLinkText}>Read the Story</Text>
            <Ionicons name="arrow-forward" size={13} color={Palette.deepTeal} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSaveToggle(lesson.id)}
            activeOpacity={0.85}
            style={[
              styles.saveBtn,
              lesson.isSaved ? styles.saveBtnActive : styles.saveBtnInactive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              lesson.isSaved ? "Saved to your wisdom collection" : "Save this lesson"
            }
          >
            <Ionicons
              name={lesson.isSaved ? "bookmark" : "bookmark-outline"}
              size={14}
              color={lesson.isSaved ? Palette.pureWhite : Palette.pureWhite}
            />
            <Text style={styles.saveBtnText}>
              {lesson.isSaved ? "Lesson Saved" : "Save This Lesson"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  wisdomBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.turquoise,
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: Palette.mintMist, // Mint Mist background
    borderRadius: 22,
    padding: 22,
    borderWidth: 1.2,
    borderColor: "rgba(236, 143, 62, 0.3)",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  quoteSymbol: {
    fontSize: 64,
    lineHeight: 64,
    fontWeight: "900",
    color: Palette.turquoise,
    position: "absolute",
    top: 6,
    left: 18,
    opacity: 0.45,
  },
  quoteText: {
    fontSize: 17,
    fontWeight: "700",
    color: Palette.deepTeal, // Readable Deep Teal text
    lineHeight: 25,
    fontStyle: "italic",
    marginTop: 18,
    marginBottom: 14,
  },
  attributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  dash: {
    width: 20,
    height: 2,
    backgroundColor: Palette.turquoise,
    borderRadius: 1,
  },
  attributionText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.textSecondary,
    letterSpacing: 0.2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "rgba(84, 0, 14, 0.1)",
    paddingTop: 14,
  },
  storyLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
  },
  storyLinkText: {
    fontSize: 13,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveBtnInactive: {
    backgroundColor: Palette.oceanTeal, // Ocean Teal primary
  },
  saveBtnActive: {
    backgroundColor: Palette.oceanTealDark,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
});
