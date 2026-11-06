import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import {
  CreationDraft,
  CreationFormState,
  CreationType,
  InspirationPrompt,
} from "@/types/create";
import { EMOTIONAL_TAGS, MENTOR_RELATIONSHIPS } from "@/data/createStudioData";

interface CreationFlowModalProps {
  visible: boolean;
  creationType: CreationType;
  initialPrompt?: InspirationPrompt | null;
  initialDraft?: CreationDraft | null;
  onClose: () => void;
  onSaveDraft: (draft: CreationDraft) => void;
  onPublish: (form: CreationFormState) => void;
}

interface StudioSheetContentProps {
  creationType: CreationType;
  initialPrompt?: InspirationPrompt | null;
  initialDraft?: CreationDraft | null;
  onClose: () => void;
  onSaveDraft: (draft: CreationDraft) => void;
  onPublish: (form: CreationFormState) => void;
}

function StudioSheetContent({
  creationType,
  initialPrompt,
  initialDraft,
  onClose,
  onSaveDraft,
  onPublish,
}: StudioSheetContentProps) {
  const [mentorName, setMentorName] = useState(
    initialDraft?.formData?.mentorName ?? initialDraft?.mentorName ?? ""
  );
  const [relationship, setRelationship] = useState(
    initialDraft?.formData?.relationship ?? "Teacher"
  );
  const [title, setTitle] = useState(
    initialDraft?.formData?.title ??
      initialDraft?.title ??
      (initialPrompt ? initialPrompt.question : "")
  );
  const [body, setBody] = useState(
    initialDraft?.formData?.body ?? initialDraft?.previewText ?? ""
  );
  const [quote, setQuote] = useState(initialDraft?.formData?.quote ?? "");
  const [selectedTag, setSelectedTag] = useState(
    initialDraft?.formData?.emotionalTag ?? "Endless Gratitude"
  );
  const [dateOrYear, setDateOrYear] = useState(
    initialDraft?.formData?.dateOrYear ?? ""
  );

  const getFormData = (): CreationFormState => ({
    type: creationType,
    mentorName: mentorName.trim(),
    relationship,
    title: title.trim() || getDefaultTitle(creationType),
    body: body.trim(),
    quote: quote.trim(),
    emotionalTag: selectedTag,
    dateOrYear: dateOrYear.trim(),
  });

  const handleSaveDraft = () => {
    const formData = getFormData();
    const newDraft: CreationDraft = {
      id: initialDraft?.id || `draft-${Date.now()}`,
      type: creationType,
      title: formData.title,
      mentorName: formData.mentorName,
      previewText: formData.body || formData.quote || "",
      lastEdited: "Just now",
      wordCount: formData.body.split(/\s+/).filter(Boolean).length,
      formData,
    };

    onSaveDraft(newDraft);
    onClose();
  };

  const handlePublish = () => {
    if (!mentorName.trim()) {
      Alert.alert("Name required", "Enter the person you are celebrating.");
      return;
    }
    if (!body.trim()) {
      Alert.alert("Memory required", "Add a memory or lesson before saving.");
      return;
    }
    onPublish(getFormData());
    onClose();
  };

  const typeConfig = getStudioTypeConfig(creationType);

  if (!typeConfig) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardWrap}
          >
            <View style={styles.sheetContainer}>
              {/* Drag / Accent Bar */}
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: typeConfig.accentColor },
                ]}
              />

              {/* Studio Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: typeConfig.badgeBg },
                    ]}
                  >
                    <Ionicons
                      name={typeConfig.icon}
                      size={18}
                      color={typeConfig.accentColor}
                    />
                  </View>
                  <View>
                    <Text style={styles.modalHeading}>{typeConfig.title}</Text>
                    <Text style={styles.modalSub}>{typeConfig.subtitle}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.closeBtn}
                  accessibilityLabel="Close Studio"
                >
                  <Ionicons name="close" size={18} color={Palette.deepTeal} />
                </TouchableOpacity>
              </View>

              {/* Scrollable Form Content */}
              <ScrollView
                style={styles.scrollForm}
                contentContainerStyle={styles.scrollFormContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Inspiration Prompt banner if provided */}
                {initialPrompt && (
                  <View style={styles.promptBanner}>
                    <Ionicons
                      name="sparkles"
                      size={14}
                      color={Palette.turquoise}
                    />
                    <Text style={styles.promptBannerText} numberOfLines={2}>
                      {initialPrompt.question}
                    </Text>
                  </View>
                )}

                {/* Mentor's Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    WHO ARE YOU CELEBRATING?
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Mrs. Callahan, Dad, Coach Maya..."
                    placeholderTextColor={Palette.textMuted}
                    value={mentorName}
                    onChangeText={setMentorName}
                  />
                </View>

                {/* Relationship selector chips */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>THEIR ROLE IN YOUR LIFE</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                  >
                    {MENTOR_RELATIONSHIPS.map((rel) => {
                      const isSelected = relationship === rel;
                      return (
                        <TouchableOpacity
                          key={rel}
                          onPress={() => setRelationship(rel)}
                          style={[
                            styles.chip,
                            isSelected && styles.chipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isSelected && styles.chipTextActive,
                            ]}
                          >
                            {rel}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Creation Title */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {creationType === "letter"
                      ? "SUBJECT / GREETING"
                      : "TITLE"}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={typeConfig.titlePlaceholder}
                    placeholderTextColor={Palette.textMuted}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                {/* Life Lesson: Wisdom Quote Field */}
                {creationType === "lesson" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>THE CORE ADVICE OR QUOTE</Text>
                    <TextInput
                      style={[styles.textInput, styles.quoteInput]}
                      placeholder="“Energy without focus turns into rebellion...”"
                      placeholderTextColor={Palette.textMuted}
                      value={quote}
                      onChangeText={setQuote}
                      multiline
                    />
                  </View>
                )}

                {/* Main Story / Letter / Memory Body */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {creationType === "letter"
                      ? "YOUR LETTER"
                      : creationType === "lesson"
                      ? "HOW THIS LESSON GUIDED YOU"
                      : "THE MEMORY OR STORY"}
                  </Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder={typeConfig.bodyPlaceholder}
                    placeholderTextColor={Palette.textMuted}
                    value={body}
                    onChangeText={setBody}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                {/* Memory Photo / Moment detail */}
                {creationType === "memory" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>MOMENT TIME / DATE</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Summer of 2019, Graduation Day..."
                      placeholderTextColor={Palette.textMuted}
                      value={dateOrYear}
                      onChangeText={setDateOrYear}
                    />

                    {/* Photo Placeholder Studio Block */}
                    <View style={styles.photoUploadBlock}>
                      <Ionicons
                        name="camera-outline"
                        size={24}
                        color={Palette.turquoise}
                      />
                      <Text style={styles.photoUploadText}>
                        Add a photo, polaroid, or keepsake portrait
                      </Text>
                    </View>
                  </View>
                )}

                {/* Emotional Tone Tags */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMOTIONAL THEME</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                  >
                    {EMOTIONAL_TAGS.map((tag) => {
                      const isSelected = selectedTag === tag;
                      return (
                        <TouchableOpacity
                          key={tag}
                          onPress={() => setSelectedTag(tag)}
                          style={[
                            styles.tagChip,
                            isSelected && styles.tagChipActive,
                          ]}
                        >
                          <Ionicons
                            name="heart"
                            size={10}
                            color={
                              isSelected ? Palette.pureWhite : Palette.turquoise
                            }
                          />
                          <Text
                            style={[
                              styles.tagChipText,
                              isSelected && styles.tagChipTextActive,
                            ]}
                          >
                            {tag}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </ScrollView>

              {/* Bottom Studio Action Bar */}
              <View style={styles.modalActionBar}>
                <TouchableOpacity
                  onPress={handleSaveDraft}
                  activeOpacity={0.75}
                  style={styles.saveDraftBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Save as draft"
                >
                  <Ionicons
                    name="bookmark-outline"
                    size={15}
                    color={Palette.deepTeal}
                  />
                  <Text style={styles.saveDraftBtnText}>Save Draft</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePublish}
                  activeOpacity={0.85}
                  style={styles.publishBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Save and publish memory"
                >
                  <Text style={styles.publishBtnText}>
                    {typeConfig.publishLabel}
                  </Text>
                  <Ionicons
                    name="sparkles"
                    size={14}
                    color={Palette.pureWhite}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default function CreationFlowModal({
  visible,
  creationType,
  initialPrompt,
  initialDraft,
  onClose,
  onSaveDraft,
  onPublish,
}: CreationFlowModalProps) {
  if (!visible) return null;

  const key = `${creationType}-${initialDraft?.id || initialPrompt?.id || "new"}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <StudioSheetContent
        key={key}
        creationType={creationType}
        initialPrompt={initialPrompt}
        initialDraft={initialDraft}
        onClose={onClose}
        onSaveDraft={onSaveDraft}
        onPublish={onPublish}
      />
    </Modal>
  );
}

function getDefaultTitle(type: CreationType): string {
  switch (type) {
    case "tribute":
      return "With Appreciation";
    case "memory":
      return "A Moment Cherished";
    case "letter":
      return "Dear Mentor";
    case "lesson":
      return "Wisdom Passed Forward";
    default:
      return "New Entry";
  }
}

function getStudioTypeConfig(type: CreationType) {
  switch (type) {
    case "tribute":
      return {
        title: "Create an Appreciation Card",
        subtitle: "Celebrate someone who made a lasting difference",
        icon: "heart" as const,
        accentColor: Palette.oceanTeal,
        badgeBg: "rgba(84, 0, 14, 0.08)",
        titlePlaceholder: "e.g. The Quiet Believer Who Changed My Life",
        bodyPlaceholder:
          "Write what made their presence so unforgettable. How did their words or belief shape your decisions?",
        publishLabel: "Honour Mentor",
      };
    case "memory":
      return {
        title: "Preserve a Memory",
        subtitle: "Keep a moment, photo, or milestone alive",
        icon: "camera" as const,
        accentColor: Palette.turquoise,
        badgeBg: "rgba(236, 143, 62, 0.14)",
        titlePlaceholder: "e.g. Our Last Conversation Before College",
        bodyPlaceholder:
          "Capture the sights, sounds, and feeling of that day. What makes this snapshot so dear to you?",
        publishLabel: "Preserve Memory",
      };
    case "letter":
      return {
        title: "A Personal Letter",
        subtitle: "Say what matters to the person who guided you",
        icon: "mail-open-outline" as const,
        accentColor: "#9E2A2B",
        badgeBg: "rgba(158, 42, 43, 0.10)",
        titlePlaceholder: "e.g. Dear Coach, thank you for not giving up",
        bodyPlaceholder:
          "Write from the heart. Share the gratitude you carried for years but perhaps never said aloud...",
        publishLabel: "Seal Letter",
      };
    case "lesson":
      return {
        title: "Capture a Life Lesson",
        subtitle: "Save valuable advice and guiding principles",
        icon: "bulb-outline" as const,
        accentColor: "#B8621B",
        badgeBg: "rgba(184, 98, 27, 0.12)",
        titlePlaceholder: "e.g. Focus Channeled Becomes Art",
        bodyPlaceholder:
          "Explain the context when they shared this truth, and how it continues to guide your journey today...",
        publishLabel: "Save Wisdom",
      };
  }
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(21, 59, 70, 0.55)",
    justifyContent: "flex-end",
  },
  keyboardWrap: {
    width: "100%",
  },
  sheetContainer: {
    backgroundColor: Palette.iceWhite,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 10,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(177, 167, 166, 0.2)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.2,
  },
  modalSub: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(84, 0, 14, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  scrollForm: {
    paddingHorizontal: 20,
  },
  scrollFormContent: {
    paddingTop: 14,
    paddingBottom: 24,
  },

  promptBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.3)",
    marginBottom: 14,
  },
  promptBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },

  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Palette.deepTeal,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  quoteInput: {
    fontStyle: "italic",
    minHeight: 52,
    color: Palette.turquoise,
    fontWeight: "600",
  },
  textArea: {
    minHeight: 110,
    paddingTop: 12,
    lineHeight: 20,
  },

  chipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: Palette.pureWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  chipActive: {
    backgroundColor: Palette.mintMist,
    borderColor: Palette.turquoise,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  chipTextActive: {
    color: Palette.oceanTeal,
    fontWeight: "800",
  },

  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.pureWhite,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  tagChipActive: {
    backgroundColor: Palette.turquoise,
    borderColor: Palette.turquoise,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  tagChipTextActive: {
    color: Palette.pureWhite,
    fontWeight: "800",
  },

  photoUploadBlock: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.2,
    borderColor: "rgba(236, 143, 62, 0.35)",
    borderStyle: "dashed",
  },
  photoUploadText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.textSecondary,
    marginTop: 6,
  },

  // Action Bar
  modalActionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(177, 167, 166, 0.2)",
    backgroundColor: Palette.iceWhite,
    gap: 12,
  },
  saveDraftBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Palette.pureWhite,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  saveDraftBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  publishBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Palette.oceanTeal,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  publishBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
});
