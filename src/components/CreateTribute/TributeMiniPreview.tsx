import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";
import { TributeRelationship } from "@/types/create";

interface TributeMiniPreviewProps {
  name: string;
  relationship: TributeRelationship;
  photoUri: string;
  story: string;
}

export default function TributeMiniPreview({
  name,
  relationship,
  photoUri,
  story,
}: TributeMiniPreviewProps) {
  const displayName = name.trim() || "Dr. Evelyn Reed";
  const displayQuote = story.trim()
    ? `“${story.slice(0, 110).trim()}${story.length > 110 ? "…" : ""}”`
    : "“Who helped you become the person you are today?”";

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Ionicons name="eye-outline" size={13} color={Palette.accentSky} />
          <Text style={styles.editorialLabel}>STUDIO PREVIEW</Text>
        </View>
        <Text style={styles.heading}>Your memories, beautifully kept.</Text>
        <Text style={styles.subtitle}>
          A live glimpse of how your tribute will look in your keepsake collection
        </Text>
      </View>

      {/* Keepsake Mini Frame */}
      <View style={styles.frameContainer}>
        {/* Decorative Tape Strip */}
        <View style={styles.vintageTape} />

        <View style={styles.innerCard}>
          {/* Top Row: Photo + Name/Role */}
          <View style={styles.topInfoRow}>
            <View style={styles.photoMount}>
              <Image
                source={{ uri: photoUri }}
                style={styles.portrait}
                resizeMode="cover"
              />
              <View style={styles.photoCorner} />
            </View>

            <View style={styles.textColumn}>
              <View style={styles.roleBadge}>
                <Ionicons name="sparkles" size={10} color={Palette.accentSky} />
                <Text style={styles.roleBadgeText}>
                  {relationship.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.mentorName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.dedicatedTo}>In profound gratitude</Text>
            </View>
          </View>

          {/* Quote Block */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>{displayQuote}</Text>
          </View>

          {/* Bottom Seal & Verification */}
          <View style={styles.cardFooter}>
            <View style={styles.sealEmblem}>
              <Ionicons name="heart" size={12} color={Palette.accentPink} />
              <Text style={styles.sealText}>HONOURED</Text>
            </View>
            <Text style={styles.previewIndicator}>Live Example Preview</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  editorialLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: Palette.accentSky,
    letterSpacing: 1.1,
    fontFamily: AppFonts.body,
  },
  heading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    fontFamily: AppFonts.displaySans,
  },
  subtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  frameContainer: {
    position: "relative",
    paddingTop: 8,
  },
  vintageTape: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: 60,
    height: 12,
    backgroundColor: "rgba(255, 184, 153, 0.5)",
    borderRadius: 2,
    zIndex: 3,
  },
  innerCard: {
    backgroundColor: "#FFFBF7",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255, 184, 153, 0.35)",
    boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.22)",
  },
  topInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  photoMount: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: "#181818",
    padding: 3,
    borderWidth: 1.5,
    borderColor: "rgba(143, 211, 255, 0.4)",
    position: "relative",
  },
  portrait: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  photoCorner: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: Palette.accentSky,
    borderRadius: 2,
  },
  textColumn: {
    flex: 1,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#181818",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.accentSky,
    letterSpacing: 0.8,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#181818", // Crisp dark charcoal on cream card!
    letterSpacing: -0.3,
    fontFamily: AppFonts.body,
  },
  dedicatedTo: {
    fontSize: 12,
    color: "#6B5B53",
    fontStyle: "italic",
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  quoteBox: {
    backgroundColor: "#F7EFE8",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(180, 140, 120, 0.25)",
  },
  quoteText: {
    fontSize: 13.5,
    fontStyle: "italic",
    color: "#2C201C", // Deep readable espresso color on cream box
    lineHeight: 19,
    fontFamily: AppFonts.body,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(180, 140, 120, 0.2)",
  },
  sealEmblem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sealText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2C201C", // Crisp dark text on cream card
    letterSpacing: 1,
  },
  previewIndicator: {
    fontSize: 11,
    color: "#7A6B63",
    fontStyle: "italic",
    fontFamily: AppFonts.body,
  },
});
