import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface TributeStudioHeaderProps {
  onBack: () => void;
  onSaveDraft: () => void;
  onPreview: () => void;
}

export default function TributeStudioHeader({
  onBack,
  onSaveDraft,
  onPreview,
}: TributeStudioHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Top Controls Row */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to appreciation details"
        >
          <Ionicons name="chevron-back" size={20} color={Palette.deepTeal} />
        </TouchableOpacity>

        <View style={styles.centerBadge}>
          <Ionicons name="brush" size={11} color={Palette.turquoise} />
          <Text style={styles.centerBadgeText}>DESIGN STUDIO</Text>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity
            onPress={onSaveDraft}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.draftBtn}
            accessibilityRole="button"
            accessibilityLabel="Save draft"
          >
            <Ionicons name="bookmark-outline" size={15} color={Palette.deepTeal} />
            <Text style={styles.draftBtnText}>Draft</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPreview}
            activeOpacity={0.85}
            style={styles.previewBtn}
            accessibilityRole="button"
            accessibilityLabel="Preview appreciation card"
          >
            <Text style={styles.previewBtnText}>Preview</Text>
            <Ionicons name="eye-outline" size={13} color={Palette.pureWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title & Subtitle */}
      <View style={styles.titleArea}>
        <Text style={styles.heading}>Design your appreciation card</Text>
        <Text style={styles.subtitle}>Make it uniquely yours</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.pureWhite,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
  },
  centerBadge: {
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
  centerBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 1.1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  draftBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.pureWhite,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  draftBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
  },
  previewBtnText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
  titleArea: {
    marginTop: 2,
  },
  heading: {
    fontSize: 24,
    fontWeight: "900",
    color: Palette.deepTeal,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
});
