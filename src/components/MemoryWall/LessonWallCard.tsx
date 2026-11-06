import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { WallLesson } from "@/types/memoryWall";

interface LessonWallCardProps {
  item: WallLesson;
  onPress: (item: WallLesson) => void;
  onPinPress: (id: string) => void;
}

export default function LessonWallCard({
  item,
  onPress,
  onPinPress,
}: LessonWallCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.88}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={item.lessonTitle}
    >
      {/* Quote mark decoration */}
      <Text style={styles.quoteDecor}>{'"'}</Text>

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.bulbIcon}>
          <Ionicons
            name={item.category === "Note" ? "create-outline" : "bulb"}
            size={15}
            color={Palette.turquoise}
          />
        </View>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onPinPress(item.id)}
          style={{ marginLeft: "auto" }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={item.isPinned ? "pin" : "pin-outline"}
            size={14}
            color={item.isPinned ? Palette.turquoise : Palette.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Lesson title */}
      <Text style={styles.lessonTitle} numberOfLines={2}>
        {item.lessonTitle}
      </Text>

      {/* Quote */}
      <Text style={styles.quote} numberOfLines={4}>
        {item.quote}
      </Text>

      {/* Attribution */}
      <View style={styles.attribution}>
        <View style={styles.dash} />
        <Text style={styles.mentorName}>{item.mentorName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: Palette.mintMist,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(216,180,254,0.22)",
    position: "relative",
    overflow: "hidden",
  },
  quoteDecor: {
    position: "absolute",
    top: -12,
    right: 14,
    fontSize: 80,
    color: "rgba(216,180,254,0.12)",
    fontWeight: "900",
    lineHeight: 80,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  bulbIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(216,180,254,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(216,180,254,0.3)",
  },
  categoryChip: {
    backgroundColor: "rgba(143,211,255,0.08)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(143,211,255,0.18)",
  },
  categoryText: {
    fontSize: 10,
    color: Palette.textSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.textPrimary,
    marginBottom: 8,
    lineHeight: 22,
  },
  quote: {
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 21,
    fontStyle: "italic",
    marginBottom: 12,
  },
  attribution: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dash: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: Palette.turquoise,
  },
  mentorName: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
});
