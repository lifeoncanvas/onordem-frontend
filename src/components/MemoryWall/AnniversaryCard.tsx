


import { Fonts, Palette } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AnniversaryCardProps {
  onWriteThanksPress?: () => void;
}

export default function AnniversaryCard({ onWriteThanksPress }: AnniversaryCardProps) {
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
        10 years ago this month, Mrs. Sharma became your teacher.
      </Text>

      {/* Bottom Row: Avatar and Action */}
      <View style={styles.bottomRow}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onWriteThanksPress}
          activeOpacity={0.85}
          style={styles.ctaButton}
          accessibilityRole="button"
          accessibilityLabel="Write a thank-you to Mrs. Sharma"
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
    marginBottom: 18,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 184, 153, 0.3)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  glowCircle: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 184, 153, 0.1)",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 184, 153, 0.18)",
    paddingHorizontal: 14,
    paddingVertical: 4.5,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    color: Palette.accentPeach,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 28,
    letterSpacing: -0.2,
    marginBottom: 18,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(216, 180, 254, 0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: {
    fontFamily: Fonts.serif,
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
});
