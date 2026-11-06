import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface TributeHeaderProps {
  onBack: () => void;
  onOptionsPress?: () => void;
}

export default function TributeHeader({
  onBack,
  onOptionsPress,
}: TributeHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to Create Studio"
        >
          <Ionicons name="chevron-back" size={20} color={Palette.deepTeal} />
        </TouchableOpacity>

        <View style={styles.studioBadge}>
          <Ionicons name="sparkles" size={11} color={Palette.turquoise} />
          <Text style={styles.studioBadgeText}>APPRECIATION CARD</Text>
        </View>

        <TouchableOpacity
          onPress={onOptionsPress}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.optionsButton}
          accessibilityRole="button"
          accessibilityLabel="Appreciation card options"
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={18}
            color={Palette.deepTeal}
          />
        </TouchableOpacity>
      </View>

      {/* Title & Emotional Introduction */}
      <View style={styles.titleWrapper}>
        <Text style={styles.pageTitle}>Celebrate their impact</Text>
        <Text style={styles.subtitle}>
          “Some people leave a little of themselves in everything we become.”
        </Text>
      </View>

      {/* Decorative Deckle Line */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerDiamond} />
        <View style={styles.dividerLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.pureWhite,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  studioBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.28)",
  },
  studioBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 1.1,
  },
  optionsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.pureWhite,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  titleWrapper: {
    marginTop: 2,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: Palette.deepTeal,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 13.5,
    fontStyle: "italic",
    color: Palette.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(177, 167, 166, 0.35)",
  },
  dividerDiamond: {
    width: 5,
    height: 5,
    backgroundColor: Palette.turquoise,
    transform: [{ rotate: "45deg" }],
    borderRadius: 1,
  },
});
