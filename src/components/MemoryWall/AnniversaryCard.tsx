import React from "react";
import { Fonts, Palette } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { memoryService } from "@/services/memoryService";

interface AnniversaryCardProps {
  onWriteThanksPress?: () => void;
}

export default function AnniversaryCard({ onWriteThanksPress }: AnniversaryCardProps) {
  const mentors = memoryService.getAllMentorProfiles();
  const mentorWithDuration = mentors.find((m) => m.duration);

  // If no mentor with a milestone duration exists, do not show dummy anniversary
  if (!mentorWithDuration) {
    return null;
  }

  return (
    <LinearGradient
      colors={["#171717", "#202020"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Ambient decorative glow */}
      <View style={styles.glowCircle} />

      {/* Pill Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Anniversary</Text>
      </View>

      {/* Headline */}
      <Text style={styles.title}>
        {mentorWithDuration.duration} with {mentorWithDuration.name}.
      </Text>

      {/* Bottom Row: Avatar and Action */}
      <View style={styles.bottomRow}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {mentorWithDuration.name.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onWriteThanksPress}
          activeOpacity={0.85}
          style={styles.ctaButton}
          accessibilityRole="button"
          accessibilityLabel={`Write a thank-you to ${mentorWithDuration.name}`}
        >
          <Text style={styles.ctaText}>Write a thank-you</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  glowCircle: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,107,156,0.08)",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.accentPink,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.serif,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 26,
    marginBottom: 18,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.accentPink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
});
