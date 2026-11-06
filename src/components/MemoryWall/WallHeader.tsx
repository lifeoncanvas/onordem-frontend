import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface WallHeaderProps {
  totalItems: number;
  pinnedCount: number;
  onSearchPress: () => void;
  onSortPress: () => void;
}

export default function WallHeader({
  totalItems,
  pinnedCount,
  onSearchPress,
  onSortPress,
}: WallHeaderProps) {
  return (
    <LinearGradient
      colors={["#000000", "#171717"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative ambient glowing circles */}
      <View style={styles.glowCircleRight} />
      <View style={styles.glowAmberLeft} />

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <View style={styles.logoTile}>
            <Ionicons name="book" size={17} color={Palette.accentPeach} />
          </View>
          <Text style={styles.brandTitle}>Memory Wall</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onSearchPress}
            style={styles.glassBtn}
            activeOpacity={0.75}
            accessibilityLabel="Search memories"
            accessibilityRole="button"
          >
            <Ionicons name="search" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSortPress}
            style={styles.glassBtn}
            activeOpacity={0.75}
            accessibilityLabel="Sort and filter options"
            accessibilityRole="button"
          >
            <Ionicons name="options-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Headline */}
      <View style={styles.heroArea}>
        <Text style={styles.headline}>Your Personal</Text>
        <Text style={styles.headlineAccent}>Archive</Text>
        <Text style={styles.subline}>
          Every appreciation card, memo, and note that shaped who you are.
        </Text>
      </View>

      {/* Frosted-Glass Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statPill}>
          <Text style={styles.statNumber}>{totalItems}</Text>
          <Text style={styles.statLabel}>Memories</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statPill}>
          <Text style={styles.statNumber}>{pinnedCount}</Text>
          <Text style={styles.statLabel}>Pinned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statPill}>
          <Ionicons name="heart" size={15} color={Palette.accentPink} />
          <Text style={[styles.statLabel, { marginLeft: 6 }]}>Curated</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 18,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
    position: "relative",
  },
  glowCircleRight: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
  },
  glowAmberLeft: {
    position: "absolute",
    bottom: -30,
    left: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(216, 180, 254, 0.12)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 26,
  },
  titleArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoTile: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(143, 211, 255, 0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  glassBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  heroArea: {
    marginBottom: 24,
  },
  headline: {
    fontSize: 32,
    fontWeight: "300",
    color: "rgba(251, 244, 238, 0.88)",
    letterSpacing: 0.5,
    lineHeight: 38,
  },
  headlineAccent: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    lineHeight: 48,
    marginBottom: 8,
  },
  subline: {
    fontSize: 14,
    color: "rgba(251, 244, 238, 0.78)",
    lineHeight: 20,
    maxWidth: 290,
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.accentPeach,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(251, 244, 238, 0.82)",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
});
