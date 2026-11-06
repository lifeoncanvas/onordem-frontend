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
import { WallMemory } from "@/types/memoryWall";

interface MemoryWallCardProps {
  item: WallMemory;
  onPress: (item: WallMemory) => void;
  onPinPress: (id: string) => void;
}

export default function MemoryWallCard({
  item,
  onPress,
  onPinPress,
}: MemoryWallCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.88}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      {/* Left color stripe */}
      <View style={[styles.stripe, { backgroundColor: item.emotionColor }]} />

      {/* Main content */}
      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.typeBadge}>
            <Ionicons name="images-outline" size={10} color={Palette.textMuted} />
            <Text style={styles.typeText}>Memo · {item.year}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onPinPress(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={item.isPinned ? "pin" : "pin-outline"}
              size={14}
              color={item.isPinned ? Palette.turquoise : Palette.textMuted}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.mentor} numberOfLines={1}>
          {item.mentorName}
        </Text>
        <Text style={styles.excerpt} numberOfLines={3}>
          {item.excerpt}
        </Text>

        {/* Emotion tag */}
        <View style={[styles.emotionTag, { borderColor: `${item.emotionColor}55` }]}>
          <View style={[styles.emotionDot, { backgroundColor: item.emotionColor }]} />
          <Text style={[styles.emotionText, { color: item.emotionColor }]}>
            {item.emotion}
          </Text>
        </View>
      </View>

      {/* Optional image */}
      {item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.thumb} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: Palette.pureWhite,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  stripe: {
    width: 4,
    alignSelf: "stretch",
  },
  body: {
    flex: 1,
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  typeText: {
    fontSize: 10,
    color: Palette.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.textPrimary,
    marginBottom: 2,
  },
  mentor: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: "500",
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  emotionTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  emotionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  emotionText: {
    fontSize: 11,
    fontWeight: "700",
  },
  thumb: {
    width: 80,
    height: "100%" as any,
    resizeMode: "cover",
  },
});
