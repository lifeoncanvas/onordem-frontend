/**
 * Live appreciation card — the signature element of the Appreciation screen.
 * It fills in as you type: photo, name, relationship and their words, so people
 * see the keepsake they're making instead of a decorative stock hero.
 *
 * The photo area is the "add / change photo" button. "Remove photo" is a sibling
 * button layered on top, never nested inside it.
 */
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette, SystemColors, TextStyles } from "@/constants/theme";

const ACCENT = SystemColors.pink;

interface AppreciationCardPreviewProps {
  name: string;
  relationship: string;
  story: string;
  photoUri: string | null;
  loadingPhoto?: boolean;
  onPickPhoto: () => void;
  onRemovePhoto: () => void;
}

/** First sentence-ish of the story, trimmed for the card. */
function excerpt(story: string): string {
  const text = story.replace(/\s+/g, " ").trim();
  if (text.length <= 150) return text;
  const cut = text.slice(0, 150);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 90 ? cut.lastIndexOf(" ") : 150)}…`;
}

export default function AppreciationCardPreview({
  name,
  relationship,
  story,
  photoUri,
  loadingPhoto,
  onPickPhoto,
  onRemovePhoto,
}: AppreciationCardPreviewProps) {
  const displayName = name.trim();
  const words = excerpt(story);
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={styles.card} accessibilityLabel="Card preview">
      <View style={styles.photoArea}>
        <Pressable
          onPress={onPickPhoto}
          disabled={loadingPhoto}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={photoUri ? "Change photo" : "Add a photo"}
          accessibilityHint="Choose a photo from your library"
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <View style={styles.placeholder}>
              <View style={styles.placeholderBadge}>
                {initials ? (
                  <Text style={styles.placeholderInitials}>{initials}</Text>
                ) : (
                  <Ionicons name="heart" size={30} color={ACCENT} />
                )}
              </View>
            </View>
          )}
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.85)"]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.photoText} pointerEvents="none">
            <Text style={styles.eyebrow} numberOfLines={1}>
              {relationship && relationship !== "Other" ? `With gratitude · ${relationship}` : "With gratitude"}
            </Text>
            <Text style={[styles.name, !displayName && styles.namePlaceholder]} numberOfLines={2}>
              {displayName || "Their name"}
            </Text>
          </View>
        </Pressable>

        {/* Photo action pill (sibling of the photo button). */}
        <Pressable
          onPress={photoUri ? onRemovePhoto : onPickPhoto}
          disabled={loadingPhoto}
          style={styles.photoPill}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={photoUri ? "Remove photo" : "Add a photo"}
        >
          {loadingPhoto ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name={photoUri ? "close" : "camera"} size={14} color="#FFF" />
              <Text style={styles.photoPillText}>{photoUri ? "Remove" : "Add Photo"}</Text>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.quoteMark} accessibilityElementsHidden>
          {"“"}
        </Text>
        <Text style={[styles.words, !words && styles.wordsPlaceholder]} numberOfLines={5}>
          {words || "Your words will appear here as you write."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: SystemColors.secondarySystemBackground,
  },
  photoArea: { width: "100%", aspectRatio: 4 / 3 },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "9%",
    backgroundColor: "rgba(255, 55, 95, 0.10)",
  },
  placeholderBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 55, 95, 0.16)",
  },
  placeholderInitials: { fontSize: 28, fontWeight: "700", color: ACCENT, fontFamily: AppFonts.displaySans },
  photoText: { position: "absolute", left: 20, right: 20, bottom: 18 },
  eyebrow: {
    ...TextStyles.caption1,
    fontFamily: AppFonts.body,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.82)",
    marginBottom: 4,
  },
  name: { ...TextStyles.largeTitle, fontFamily: AppFonts.displaySans, color: "#FFFFFF" },
  namePlaceholder: { color: "rgba(255,255,255,0.45)" },
  photoPill: {
    position: "absolute",
    top: 14,
    right: 14,
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  photoPillText: { ...TextStyles.footnote, fontFamily: AppFonts.body, fontWeight: "600", color: "#FFF" },
  body: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 22 },
  quoteMark: {
    fontSize: 48,
    lineHeight: 48,
    fontWeight: "700",
    color: ACCENT,
    fontFamily: AppFonts.displaySerif,
    marginBottom: -14,
  },
  words: { ...TextStyles.title3, fontFamily: AppFonts.body, fontWeight: "500", color: SystemColors.label, lineHeight: 27 },
  wordsPlaceholder: { color: Palette.textMuted, fontWeight: "400" },
});
