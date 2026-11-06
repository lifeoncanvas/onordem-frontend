import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";

interface WritingAssistantProps {
  visible: boolean;
  onClose: () => void;
  currentText: string;
  onApplyText: (newText: string) => void;
  mentorName?: string;
}

const EXPRESSION_PROMPTS = [
  "I want to thank them for believing in me when I doubted myself.",
  "I want to share the single most important lesson they taught me.",
  "I want to celebrate their patience during a defining season of my career.",
  "I want to tell them that their words still echo in my daily choices.",
  "I want to express how their quiet kindness transformed my life.",
];

export default function WritingAssistantModal({
  visible,
  onClose,
  currentText,
  onApplyText,
  mentorName,
}: WritingAssistantProps) {
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [activeTab, setActiveTab] = useState<"tools" | "question">("tools");
  const [questionInput, setQuestionInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestionType, setSuggestionType] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to push history for undo
  const updateTextWithUndo = (newText: string) => {
    setHistory((prev) => [...prev, currentText]);
    onApplyText(newText);
  };

  const handleUndo = () => {
    if (history.length === 0) {
      Alert.alert("Nothing to undo", "You are at your original draft.");
      return;
    }
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    onApplyText(previous);
    setSuggestion(null);
  };

  // Grammar Check
  const handleGrammarCheck = () => {
    if (!currentText.trim()) {
      Alert.alert("Empty text", "Please write a few words first to check grammar.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      let corrected = currentText
        .replace(/\bi\b/g, "I")
        .replace(/\bteh\b/gi, "the")
        .replace(/\brecieve\b/gi, "receive")
        .replace(/\bseperate\b/gi, "separate")
        .replace(/\bdefinatly\b/gi, "definitely")
        .replace(/\buntill\b/gi, "until")
        .replace(/\s+,/g, ",")
        .replace(/\s+\./g, ".");

      // Capitalize first letter of sentences
      corrected = corrected.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

      // Ensure period at end if missing
      if (!/[.!?]$/.test(corrected.trim())) {
        corrected = corrected.trim() + ".";
      }

      setSuggestionType("Grammar Check");
      setSuggestion(corrected);
    }, 350);
  };

  // Improve My Writing
  const handleImproveWriting = () => {
    if (!currentText.trim()) {
      Alert.alert("Empty text", "Please draft a brief sentence or thoughts first.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const target = mentorName ? mentorName : "you";
      const clean = currentText.trim();
      let improved = "";

      if (clean.length < 50) {
        improved = `Looking back, I am endlessly grateful for ${target}. ${clean} Their presence and enduring wisdom showed me what quiet dedication truly looks like.`;
      } else {
        improved = `${clean}\n\nHaving someone like ${target} in my corner transformed how I approach each obstacle. The lessons they gave me continue to guide my steps every single day.`;
      }

      setSuggestionType("Improve My Writing");
      setSuggestion(improved);
    }, 400);
  };

  const handleAcceptSuggestion = () => {
    if (suggestion) {
      updateTextWithUndo(suggestion);
      setSuggestion(null);
      Alert.alert("Suggestion applied", "Your writing has been updated.");
    }
  };

  const handleApplyExpressionPrompt = (prompt: string) => {
    const formatted = currentText.trim() ? `${currentText}\n\n${prompt}` : prompt;
    updateTextWithUndo(formatted);
    onClose();
  };

  const handleCustomQuestionSubmit = () => {
    if (!questionInput.trim()) return;
    const formatted = currentText.trim()
      ? `${currentText}\n\n${questionInput.trim()}`
      : questionInput.trim();
    updateTextWithUndo(formatted);
    setQuestionInput("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Handle indicator */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Ionicons name="sparkles" size={18} color={Palette.accentSky} />
              <Text style={styles.title}>Writing Assistant</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close assistant">
              <Ionicons name="close" size={20} color={Palette.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Auto-correct Toggle Bar */}
          <View style={styles.toggleBar}>
            <View style={styles.toggleTextWrap}>
              <Ionicons
                name={autoCorrect ? "checkmark-circle" : "close-circle-outline"}
                size={18}
                color={autoCorrect ? Palette.accentMint : Palette.textMuted}
              />
              <Text style={styles.toggleLabel}>
                Auto-correct: {autoCorrect ? "ON" : "OFF"}
              </Text>
            </View>
            <Switch
              value={autoCorrect}
              onValueChange={setAutoCorrect}
              thumbColor={autoCorrect ? Palette.accentMint : "#FFFFFF"}
              trackColor={{ false: "#3A151C", true: "rgba(143, 240, 198, 0.4)" }}
            />
          </View>

          {/* Navigation Sub-Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "tools" && styles.tabBtnActive]}
              onPress={() => setActiveTab("tools")}
            >
              <Text style={[styles.tabBtnText, activeTab === "tools" && styles.tabBtnTextActive]}>
                Enhance Tools
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "question" && styles.tabBtnActive]}
              onPress={() => setActiveTab("question")}
            >
              <Text style={[styles.tabBtnText, activeTab === "question" && styles.tabBtnTextActive]}>
                Ask a Question
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            {activeTab === "tools" ? (
              <>
                {/* Action Buttons Row */}
                <View style={styles.actionGrid}>
                  <TouchableOpacity
                    style={styles.actionTile}
                    onPress={handleGrammarCheck}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.tileIcon, { backgroundColor: "rgba(143, 211, 255, 0.16)" }]}>
                      <Ionicons name="checkmark-circle-outline" size={18} color={Palette.accentSky} />
                    </View>
                    <Text style={styles.tileLabel}>Grammar Check</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionTile}
                    onPress={handleImproveWriting}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.tileIcon, { backgroundColor: "rgba(255, 184, 153, 0.16)" }]}>
                      <Ionicons name="color-wand-outline" size={18} color={Palette.accentPeach} />
                    </View>
                    <Text style={styles.tileLabel}>Improve My Writing</Text>
                  </TouchableOpacity>
                </View>

                {/* Undo changes button */}
                <TouchableOpacity
                  style={[styles.undoBtn, history.length === 0 && styles.undoBtnDisabled]}
                  onPress={handleUndo}
                  disabled={history.length === 0}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="arrow-undo-outline"
                    size={16}
                    color={history.length === 0 ? Palette.textMuted : Palette.accentSky}
                  />
                  <Text
                    style={[
                      styles.undoBtnText,
                      history.length === 0 && { color: Palette.textMuted },
                    ]}
                  >
                    Undo Changes {history.length > 0 ? `(${history.length})` : ""}
                  </Text>
                </TouchableOpacity>

                {/* Suggestions Card if active */}
                {suggestion && (
                  <View style={styles.suggestionCard}>
                    <View style={styles.suggestionHeader}>
                      <View style={styles.suggestionBadge}>
                        <Ionicons name="bulb" size={12} color={Palette.accentMint} />
                        <Text style={styles.suggestionBadgeText}>{suggestionType}</Text>
                      </View>
                      <TouchableOpacity onPress={() => setSuggestion(null)}>
                        <Ionicons name="close" size={16} color={Palette.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.suggestionBody}>
                      {suggestion}
                    </Text>

                    <View style={styles.suggestionActions}>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={handleAcceptSuggestion}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.acceptBtnText}>Accept Suggestion ✅</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.discardBtn}
                        onPress={() => setSuggestion(null)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.discardBtnText}>Dismiss</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            ) : (
              /* Ask a Question / What would you like to express? */
              <View style={styles.questionSection}>
                <Text style={styles.questionHeading}>What would you like to express?</Text>
                <Text style={styles.questionSubtitle}>
                  Select a starter reflection or describe the emotion you wish to convey:
                </Text>

                {/* Custom Question / Expression Input */}
                <View style={styles.customInputCard}>
                  <TextInput
                    style={styles.customTextInput}
                    placeholder="Ask a question or type your feeling..."
                    placeholderTextColor={Palette.textMuted}
                    value={questionInput}
                    onChangeText={setQuestionInput}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.sendInputBtn, !questionInput.trim() && { opacity: 0.5 }]}
                    onPress={handleCustomQuestionSubmit}
                    disabled={!questionInput.trim()}
                  >
                    <Ionicons name="arrow-up" size={16} color="#000000" />
                  </TouchableOpacity>
                </View>

                {/* Starter Prompts */}
                <Text style={styles.starterListTitle}>Suggested Reflections</Text>
                {EXPRESSION_PROMPTS.map((prompt, idx) => (
                  <TouchableOpacity
                    key={`expr-${idx}`}
                    style={styles.promptTile}
                    onPress={() => handleApplyExpressionPrompt(prompt)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.promptIconWrap}>
                      <Ionicons name="heart-outline" size={14} color={Palette.accentPink} />
                    </View>
                    <Text style={styles.promptText}>{prompt}</Text>
                    <Ionicons name="add-circle-outline" size={18} color={Palette.accentSky} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#16050B",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "rgba(239, 162, 91, 0.2)",
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#200910",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 14,
  },
  toggleTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textSecondary,
    fontFamily: AppFonts.body,
  },
  tabBtnTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  scrollArea: {
    maxHeight: 460,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  actionTile: {
    flex: 1,
    backgroundColor: "#220A12",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    gap: 8,
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
    textAlign: "center",
  },
  undoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(143, 211, 255, 0.3)",
    backgroundColor: "rgba(143, 211, 255, 0.06)",
    marginBottom: 14,
  },
  undoBtnDisabled: {
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "transparent",
  },
  undoBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.accentSky,
    fontFamily: AppFonts.body,
  },
  suggestionCard: {
    backgroundColor: "#2A0E17",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.2,
    borderColor: Palette.accentMint,
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  suggestionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(143, 240, 198, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  suggestionBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: Palette.accentMint,
    textTransform: "uppercase",
  },
  suggestionBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#FFF8F3",
    fontFamily: AppFonts.body,
    marginBottom: 14,
  },
  suggestionActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: Palette.accentMint,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
  acceptBtnText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "800",
    fontFamily: AppFonts.body,
  },
  discardBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  discardBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  questionSection: {
    gap: 12,
  },
  questionHeading: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  questionSubtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    fontFamily: AppFonts.body,
    lineHeight: 18,
  },
  customInputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#220A12",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  customTextInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13.5,
    fontFamily: AppFonts.body,
    maxHeight: 80,
  },
  sendInputBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.accentMint,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  starterListTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.accentSky,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 6,
  },
  promptTile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#200910",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 10,
  },
  promptIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255, 158, 207, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  promptText: {
    flex: 1,
    fontSize: 12.5,
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
    lineHeight: 18,
  },
});

