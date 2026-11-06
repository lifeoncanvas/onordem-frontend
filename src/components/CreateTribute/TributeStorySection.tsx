import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";
import { STARTER_QUESTION_PROMPT } from "@/data/tributeDetailsData";
import WritingAssistantModal from "@/components/Create/WritingAssistantModal";

interface TributeStorySectionProps {
  story: string;
  onStoryChange: (text: string) => void;
  activePrompt?: string | null;
  onApplyPromptText: (text: string) => void;
  mentorName?: string;
}

export default function TributeStorySection({
  story,
  onStoryChange,
  activePrompt,
  onApplyPromptText,
  mentorName,
}: TributeStorySectionProps) {
  const [assistantVisible, setAssistantVisible] = useState(false);
  const wordCount = story.trim().split(/\s+/).filter(Boolean).length;
  const charCount = story.length;

  const handleStarterPromptPress = () => {
    if (!story.trim()) {
      onStoryChange(STARTER_QUESTION_PROMPT + "\n\n");
    } else {
      onStoryChange(story + "\n\n" + STARTER_QUESTION_PROMPT + "\n");
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Ionicons name="journal-outline" size={13} color={Palette.turquoise} />
          <Text style={styles.editorialLabel}>A MEMORY</Text>
        </View>
        <Text style={styles.heading}>What makes them unforgettable?</Text>
        <Text style={styles.subtitle}>
          Tell us about a moment you will never forget, a lesson they taught you, or
          the way they changed your life.
        </Text>
      </View>

      {/* Active Inspiration Prompt Pill */}
      {activePrompt && (
        <View style={styles.activePromptPill}>
          <Ionicons name="sparkles" size={12} color={Palette.turquoise} />
          <Text style={styles.activePromptText} numberOfLines={2}>
            {activePrompt}
          </Text>
        </View>
      )}

      {/* Writing Assistant Quick Bar */}
      <View style={styles.assistantBar}>
        <TouchableOpacity
          style={styles.assistantBtn}
          onPress={() => setAssistantVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={13} color={Palette.accentMint} />
          <Text style={styles.assistantBtnText}>Improve My Writing & Grammar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.askQuestionPill}
          onPress={() => setAssistantVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="help-circle-outline" size={13} color={Palette.accentSky} />
          <Text style={styles.askQuestionPillText}>Ask a Question</Text>
        </TouchableOpacity>
      </View>

      {/* Journal Multiline Card */}
      <View style={styles.journalCard}>
        {/* Left Ruled Margin Line */}
        <View style={styles.marginSpine} />

        <TextInput
          style={styles.storyInput}
          multiline
          textAlignVertical="top"
          placeholder="Some people change our lives in ways they may never realise…"
          placeholderTextColor={Palette.textMuted}
          value={story}
          onChangeText={onStoryChange}
          accessibilityLabel="Appreciation card message"
        />

        {/* Word & Character Count Bar */}
        <View style={styles.metaCounterRow}>
          <View style={styles.writingFlair}>
            <Ionicons name="pencil" size={11} color={Palette.turquoise} />
            <Text style={styles.writingFlairText}>Personal Journal</Text>
          </View>
          <Text style={styles.counterText}>
            {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} chars
          </Text>
        </View>
      </View>

      {/* A Question to Begin With Prompt Panel */}
      <TouchableOpacity
        onPress={handleStarterPromptPress}
        activeOpacity={0.8}
        style={styles.starterPanel}
        accessibilityRole="button"
        accessibilityLabel={`A question to begin with: ${STARTER_QUESTION_PROMPT}`}
      >
        <View style={styles.starterTopRow}>
          <View style={styles.starterLabelWrap}>
            <Ionicons name="help-circle-outline" size={13} color={Palette.deepTeal} />
            <Text style={styles.starterLabel}>A QUESTION TO BEGIN WITH</Text>
          </View>
          <View style={styles.tapToUsePill}>
            <Text style={styles.tapToUseText}>Tap to start</Text>
            <Ionicons name="arrow-up" size={11} color={Palette.oceanTeal} />
          </View>
        </View>
        <Text style={styles.starterQuestion}>“{STARTER_QUESTION_PROMPT}”</Text>
      </TouchableOpacity>

      {/* Writing Assistant Modal */}
      <WritingAssistantModal
        visible={assistantVisible}
        onClose={() => setAssistantVisible(false)}
        currentText={story}
        onApplyText={onStoryChange}
        mentorName={mentorName}
      />
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
    gap: 5,
    marginBottom: 4,
  },
  editorialLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 1.1,
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  activePromptPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  activePromptText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },
  assistantBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  assistantBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(143, 240, 198, 0.12)",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(143, 240, 198, 0.28)",
  },
  assistantBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Palette.accentMint,
    fontFamily: AppFonts.body,
  },
  askQuestionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(143, 211, 255, 0.1)",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(143, 211, 255, 0.25)",
  },
  askQuestionPillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Palette.accentSky,
    fontFamily: AppFonts.body,
  },
  journalCard: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  marginSpine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Palette.turquoise,
  },
  storyInput: {
    minHeight: 160,
    fontSize: 14.5,
    lineHeight: 22,
    color: Palette.deepTeal,
  },
  metaCounterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(177, 167, 166, 0.18)",
  },
  writingFlair: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  writingFlairText: {
    fontSize: 11,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  counterText: {
    fontSize: 11,
    color: Palette.textMuted,
    fontWeight: "600",
  },
  starterPanel: {
    marginTop: 12,
    backgroundColor: Palette.surfaceCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  starterTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  starterLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  starterLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: 0.8,
  },
  tapToUsePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tapToUseText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },
  starterQuestion: {
    fontSize: 13,
    fontStyle: "italic",
    color: Palette.textSecondary,
    lineHeight: 18,
  },
});
