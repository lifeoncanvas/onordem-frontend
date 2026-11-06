import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { WallLetter } from "@/types/memoryWall";

interface LetterWallCardProps {
  item: WallLetter;
  onPress: (item: WallLetter) => void;
  onPinPress: (id: string) => void;
}

const MOOD_CONFIG: Record<string, { icon: string; color: string }> = {
  Reflective: { icon: "moon-outline", color: "#D8B4FE" },
  Warm: { icon: "sunny-outline", color: "#FFB899" },
  Grateful: { icon: "heart-outline", color: "#FF9ECF" },
  Hopeful: { icon: "leaf-outline", color: "#8FF0C6" },
};

export default function LetterWallCard({
  item,
  onPress,
  onPinPress,
}: LetterWallCardProps) {
  const mood = MOOD_CONFIG[item.mood] ?? { icon: "mail-outline", color: Palette.textSecondary };

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.88}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      {/* Decorative envelope flap */}
      <View style={styles.flapRow}>
        <View style={styles.envelope}>
          <Ionicons name="mail" size={18} color={Palette.turquoise} />
        </View>
        <View style={styles.moodChip}>
          <Ionicons name={mood.icon as any} size={11} color={mood.color} />
          <Text style={[styles.moodText, { color: mood.color }]}>{item.mood}</Text>
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

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.toLine}>To {item.mentorName}</Text>

      {/* Preview */}
      <Text style={styles.preview} numberOfLines={3}>
        {item.preview}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons name="document-text-outline" size={12} color={Palette.textMuted} />
        <Text style={styles.footerText}>{item.wordCount} words</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.footerText}>{item.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: Palette.pureWhite,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    // Faint ruled-paper feel
    borderLeftWidth: 3,
    borderLeftColor: Palette.turquoise,
  },
  flapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  envelope: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Palette.turquoiseSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(143,211,255,0.3)",
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.mintMist,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  moodText: {
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.textPrimary,
    marginBottom: 2,
  },
  toLine: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: "500",
    marginBottom: 8,
  },
  preview: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: Palette.textMuted,
    fontWeight: "500",
  },
  dot: {
    color: Palette.textMuted,
    fontSize: 11,
  },
});
