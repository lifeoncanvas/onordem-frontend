import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { textShadow } from "@/constants/textShadow";

interface TributeHeroEditorialProps {
  imageUri?: string;
  localImage?: any;
}

export default function TributeHeroEditorial({
  imageUri,
  localImage,
}: TributeHeroEditorialProps) {
  // Use provided image, local asset, or high-res editorial mentor photography
  const source = localImage
    ? localImage
    : imageUri
    ? { uri: imageUri }
    : require("../../../assets/images/img2.jpeg");

  return (
    <View style={styles.container}>
      {/* Editorial Layered Frame Composition */}
      <View style={styles.deckleBackdrop} />

      <View style={styles.photoFrame}>
        <Image source={source} style={styles.heroImage} resizeMode="cover" />

        {/* Subtle Warm Gradient Overlay */}
        <LinearGradient
          colors={[
            "transparent",
            "rgba(84, 0, 14, 0.35)",
            "rgba(84, 0, 14, 0.88)",
          ]}
          locations={[0.4, 0.75, 1]}
          style={styles.gradientOverlay}
        />

        {/* Vintage Paper Corner Pin */}
        <View style={styles.washiTab}>
          <View style={styles.washiStitch} />
        </View>

        {/* Floating Message on Photograph */}
        <View style={styles.contentWrap}>
          <View style={styles.badgePill}>
            <Ionicons name="heart" size={10} color={Palette.turquoise} />
            <Text style={styles.badgeText}>A SACRED CONNECTION</Text>
          </View>
          <Text style={styles.captionQuote}>
            “For the person who helped you become you.”
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
    position: "relative",
  },
  deckleBackdrop: {
    position: "absolute",
    top: 6,
    left: 24,
    right: 16,
    bottom: -6,
    backgroundColor: "rgba(252, 238, 228, 0.85)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.25)",
    transform: [{ rotate: "-1.4deg" }],
  },
  photoFrame: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(252, 238, 228, 0.9)",
    boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.14)",
    position: "relative",
    height: 220,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  washiTab: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 38,
    height: 12,
    backgroundColor: "rgba(236, 143, 62, 0.4)",
    borderRadius: 2,
    transform: [{ rotate: "12deg" }],
    justifyContent: "center",
    alignItems: "center",
  },
  washiStitch: {
    width: 24,
    height: 1,
    backgroundColor: "rgba(84, 0, 14, 0.3)",
  },
  contentWrap: {
    position: "absolute",
    bottom: 14,
    left: 16,
    right: 16,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(84, 0, 14, 0.55)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.35)",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.pureWhite,
    letterSpacing: 0.9,
  },
  captionQuote: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.pureWhite,
    letterSpacing: -0.2,
    lineHeight: 22,
    ...textShadow(0, 1, 4, "rgba(0, 0, 0, 0.35)"),
  },
});
