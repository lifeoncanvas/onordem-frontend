import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";

interface CreateHeaderProps {
  draftCount?: number;
  onPressDrafts?: () => void;
}

export default function CreateHeader({
  draftCount = 0,
  onPressDrafts,
}: CreateHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Top Studio Badge Row */}
      <View style={styles.topRow}>
        <View style={styles.studioPill}>
          <Text style={styles.studioPillText}>MEMORY STUDIO</Text>
        </View>

        {/* Interactive note / seal icon badge for drafts */}
        <TouchableOpacity
          style={styles.stationerySeal}
          onPress={onPressDrafts}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Open drafts, ${draftCount} unfinished`}
        >
          <Ionicons name="albums-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Header Content */}
      <View style={styles.titleArea}>
        <Text style={styles.heading}>
          Let&apos;s celebrate{"\n"}
          <Text style={styles.headingEmphasis}>someone.</Text>
        </Text>
        <Text style={styles.subtitle}>Every memory deserves a place to live.</Text>
      </View>

      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  studioPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(143, 211, 255, 0.28)",
  },
  studioPillText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: Palette.accentSky,
    letterSpacing: 1.2,
  },
  stationerySeal: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  titleArea: {
    marginTop: 8,
  },
  heading: {
    fontFamily: AppFonts.displaySans,
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  headingEmphasis: {
    fontFamily: AppFonts.displaySans,
    fontStyle: "italic",
    color: Palette.accentLavender,
  },
  subtitle: {
    fontFamily: AppFonts.body,
    fontSize: 15,
    color: Palette.textSecondary,
    marginTop: 6,
    letterSpacing: 0.1,
  },
  dividerLine: {
    marginTop: 18,
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});
