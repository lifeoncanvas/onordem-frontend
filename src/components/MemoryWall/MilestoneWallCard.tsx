import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { WallMilestone, MilestoneType } from "@/types/memoryWall";

interface MilestoneWallCardProps {
  item: WallMilestone;
  onPress: (item: WallMilestone) => void;
  onPinPress: (id: string) => void;
}

const MILESTONE_ICONS: Record<MilestoneType, keyof typeof import("@expo/vector-icons").Ionicons.glyphMap> = {
  "first-meeting": "handshake-outline" as any,
  graduation: "school-outline",
  breakthrough: "flash-outline",
  farewell: "airplane-outline",
  reunion: "people-outline",
  "life-change": "sparkles-outline" as any,
};

export default function MilestoneWallCard({
  item,
  onPress,
  onPinPress,
}: MilestoneWallCardProps) {
  const iconName = MILESTONE_ICONS[item.type] ?? "flag-outline";

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.88}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      {/* Accent gradient strip at top */}
      <LinearGradient
        colors={[item.accentColor, `${item.accentColor}55`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topStripe}
      />

      <View style={styles.body}>
        {/* Left timeline column */}
        <View style={styles.timelineCol}>
          <View style={[styles.iconCircle, { backgroundColor: `${item.accentColor}22`, borderColor: `${item.accentColor}55` }]}>
            <Ionicons name={iconName as any} size={18} color={item.accentColor} />
          </View>
          <View style={[styles.timelineLine, { backgroundColor: `${item.accentColor}30` }]} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.yearBadge}>
              <Text style={[styles.yearText, { color: item.accentColor }]}>{item.year}</Text>
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

          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>

          {/* Mentor tag */}
          <View style={styles.mentorTag}>
            <Ionicons name="person-circle-outline" size={12} color={Palette.textMuted} />
            <Text style={styles.mentorName}>{item.mentorName}</Text>
          </View>
        </View>
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
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  topStripe: {
    height: 4,
    width: "100%",
  },
  body: {
    flexDirection: "row",
    padding: 14,
    gap: 12,
  },
  timelineCol: {
    alignItems: "center",
    width: 44,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    borderRadius: 1,
    minHeight: 20,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  yearBadge: {
    backgroundColor: Palette.mintMist,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  yearText: {
    fontSize: 11,
    fontWeight: "800",
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.textPrimary,
    marginBottom: 6,
    lineHeight: 21,
  },
  description: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  mentorTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mentorName: {
    fontSize: 11,
    color: Palette.textMuted,
    fontWeight: "600",
  },
});
