import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts } from "@/constants/theme";

export interface MilestoneDedicationData {
  id: string;
  badgeIcon: "school" | "trophy" | "ribbon" | "briefcase" | "color-palette" | "star";
  title: string;
  mentorName: string;
  mentorId?: string;
  date: string;
  dedicationQuote: string;
}

interface MilestoneDedicationCardProps {
  item: MilestoneDedicationData;
  cardWidth?: number;
  onPress?: () => void;
  onMentorPress?: (mentorName: string) => void;
}

// Map badge icons to vibrant accent colours
const BADGE_COLORS: Record<string, string> = {
  school: "#00D2D3",        // Vivid cyan
  trophy: "#F59E0B",        // Golden amber
  ribbon: "#FF4B72",        // Vivid rose
  briefcase: "#38BDF8",     // Sky blue
  "color-palette": "#EC4899", // Magenta
  star: "#A855F7",          // Purple
};

export default function MilestoneDedicationCard({
  item,
  cardWidth,
  onPress,
  onMentorPress,
}: MilestoneDedicationCardProps) {
  const iconColor = BADGE_COLORS[item.badgeIcon] || "#F59E0B";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, dedicated to ${item.mentorName}`}
      style={[
        styles.container,
        {
          width: cardWidth ?? 270,
        },
      ]}
    >
      <View style={styles.contentWrap}>
        {/* Top Row: Icon Badge & Date */}
        <View style={styles.topRow}>
          <View style={[styles.iconCircle, { borderColor: `${iconColor}40` }]}>
            <Ionicons name={item.badgeIcon} size={18} color={iconColor} />
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Dedicated to Row */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onMentorPress?.(item.mentorName)}
          style={styles.dedicatedRow}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={styles.dedicatedPrefix}>Dedicated to: </Text>
          <Text style={styles.dedicatedMentorName}>{item.mentorName}</Text>
        </TouchableOpacity>

        {/* Italic Dedication Quote */}
        <Text style={styles.dedicationQuote} numberOfLines={3}>
          &ldquo;{item.dedicationQuote}&rdquo;
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: "#141414", // Subtle dark-grey layer
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.12)", // Subtle grey border
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 220,
    justifyContent: "space-between",
  },
  contentWrap: {
    padding: 18,
    flex: 1,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#737373", // Muted light grey
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF", // Bright white
    letterSpacing: -0.3,
    lineHeight: 23,
  },
  dedicatedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  dedicatedPrefix: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  dedicatedMentorName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#F59E0B", // Vibrant amber highlight
  },
  dedicationQuote: {
    fontSize: 12.5,
    lineHeight: 19,
    color: "#D1D5DB",
    fontStyle: "italic",
    fontFamily: AppFonts.body,
  },
});
