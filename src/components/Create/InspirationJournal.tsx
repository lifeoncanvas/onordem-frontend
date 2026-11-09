import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { InspirationPrompt } from "@/types/create";

interface InspirationJournalProps {
  prompts: InspirationPrompt[];
  onStartCreating: (prompt: InspirationPrompt) => void;
}

export default function InspirationJournal({
  prompts,
  onStartCreating,
}: InspirationJournalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = React.useMemo(() => new Animated.Value(1), []);

  const currentPrompt = prompts[currentIndex] || prompts[0];

  const handleNextPrompt = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.1,
        duration: 150,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();

    setCurrentIndex((prev) => (prev + 1) % prompts.length);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.inspirationIconWrap}>
            <Ionicons name="bulb-outline" size={13} color={Palette.turquoise} />
          </View>
          <Text style={styles.sectionHeading}>A Little Inspiration</Text>
        </View>

        {/* Rotate / Shuffle Prompts CTA */}
        <TouchableOpacity
          onPress={handleNextPrompt}
          activeOpacity={0.7}
          style={styles.shuffleBtn}
          accessibilityRole="button"
          accessibilityLabel="Shuffle gratitude prompt"
        >
          <Ionicons name="sync-outline" size={13} color={Palette.deepTeal} />
          <Text style={styles.shuffleText}>Another thought</Text>
        </TouchableOpacity>
      </View>

      {/* Journal Entry Page Container */}
      <View style={styles.journalPaper}>
        {/* Left Bookmark Ribbon Spine */}
        <View style={styles.paperSpine} />

        {/* Top Journal Tag & Corner Fold */}
        <View style={styles.journalMetaRow}>
          <View style={styles.themeTag}>
            <Ionicons name="bookmark-outline" size={11} color={Palette.oceanTeal} />
            <Text style={styles.themeTagText}>
              {currentPrompt.categoryTag.toUpperCase()}
            </Text>
          </View>

          {/* Prompt counter indicator */}
          <Text style={styles.counterText}>
            {currentIndex + 1} of {prompts.length}
          </Text>
        </View>

        {/* Animated Question & Thought */}
        <Animated.View style={[styles.promptContent, { opacity: fadeAnim }]}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.questionText}>{currentPrompt.question}</Text>
          <Text style={styles.supportingText}>
            {currentPrompt.supportingText}
          </Text>
        </Animated.View>

        {/* Journal Bottom Action Row */}
        <View style={styles.bottomRow}>
          <View style={styles.handwrittenHint}>
            <Ionicons name="heart-outline" size={13} color={Palette.turquoise} />
            <Text style={styles.handwrittenText}>Honour their impact</Text>
          </View>

          {/* Primary "Start Creating" Button */}
          <TouchableOpacity
            onPress={() => onStartCreating(currentPrompt)}
            activeOpacity={0.85}
            style={styles.startBtn}
            accessibilityRole="button"
            accessibilityLabel="Start Creating with this prompt"
          >
            <Text style={styles.startBtnText}>Start Creating</Text>
            <Ionicons name="create-outline" size={15} color={Palette.textOnPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  inspirationIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 184, 153, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  shuffleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  shuffleText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  journalPaper: {
    backgroundColor: Palette.surfaceCard,
    borderRadius: 22,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.12)",
    position: "relative",
    overflow: "hidden",
  },
  paperSpine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: Palette.turquoise,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  journalMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingLeft: 4,
  },
  themeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  themeTagText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 0.8,
  },
  counterText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: Palette.textMuted,
  },
  promptContent: {
    paddingLeft: 4,
    marginVertical: 4,
    position: "relative",
  },
  quoteMark: {
    position: "absolute",
    top: -16,
    left: -2,
    fontSize: 38,
    fontWeight: "900",
    color: "rgba(255, 184, 153, 0.35)",
  },
  questionText: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.deepTeal,
    lineHeight: 24,
    letterSpacing: -0.2,
    marginBottom: 6,
    paddingTop: 10,
  },
  supportingText: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 18,
    fontStyle: "italic",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    paddingLeft: 4,
  },
  handwrittenHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  handwrittenText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.25)",
  },
  startBtnText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: Palette.textOnPrimary,
    letterSpacing: 0.2,
  },
});
