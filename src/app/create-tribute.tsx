/**
 * Appreciation card — step 1 (content). Step 2 is /tribute-design.
 *
 * Layout: nav bar (Back · Appreciation · Save Draft) → live card preview that fills
 * in as you type (the screen's signature element; tapping it adds a photo) →
 * "Who are you celebrating?" → "Their story" with prompt chips → pinned
 * "Continue to Design". The tab bar is hidden: this is a focused writing task.
 */
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { persistImageUri } from "@/utils/persistMedia";

// Design System
import { AppFonts, Layout, Palette, SystemColors, TextStyles } from "@/constants/theme";

import AppreciationCardPreview from "@/components/CreateTribute/AppreciationCardPreview";

// Types, Data & Services
import { TributePayload, TributeRelationship } from "@/types/create";
import {
  DEFAULT_SAMPLE_PORTRAIT,
  INSPIRATION_STORY_CARDS,
  TRIBUTE_RELATIONSHIPS,
} from "@/data/tributeDetailsData";
import { tributeDraftService } from "@/services/tributeDraftService";

const CONTENT_MAX_WIDTH = 640;
const STORY_MAX = 2000;
const ACCENT = SystemColors.pink;

export default function CreateTributeScreen() {
  const params = useLocalSearchParams<{
    promptQuestion?: string;
    mentorName?: string;
    story?: string;
    relationship?: string;
    draftId?: string;
  }>();
  const savedDraft = params.draftId
    ? tributeDraftService.getDraftById(params.draftId)
    : undefined;
  const [tributeId, setTributeId] = useState(
    () => savedDraft?.payload.id || params.draftId || `tribute-${Date.now()}`
  );
  const createdAtRef = React.useRef(
    savedDraft?.payload.createdAt || new Date().toISOString()
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Screen Form State (persisting any incoming navigation params)
  const [mentorName, setMentorName] = useState(
    savedDraft?.payload.mentorName || params.mentorName || ""
  );
  const [recipientEmail, setRecipientEmail] = useState(
    savedDraft?.payload.recipientEmail || ""
  );
  const [relationship, setRelationship] = useState<TributeRelationship>(
    toTributeRelationship(savedDraft?.payload.relationship || params.relationship)
  );
  const [story, setStory] = useState(
    savedDraft?.payload.story ||
      params.story ||
      (params.promptQuestion ? `${params.promptQuestion}\n\n` : "")
  );

  // Photo state. The sample portrait from older drafts counts as "no photo" in the preview.
  const [photoUri, setPhotoUri] = useState<string | null>(
    savedDraft?.payload.isCustomPhoto ? savedDraft.payload.photoUri || null : null
  );
  const [isCustomPhoto, setIsCustomPhoto] = useState(
    savedDraft?.payload.isCustomPhoto ?? false
  );
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  // Active Inspiration Card / Prompt tracking
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activePromptText, setActivePromptText] = useState<string | null>(
    savedDraft?.payload.inspirationPrompt || params.promptQuestion || null
  );

  // Validation Error state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Smooth entrance animation
  const entranceFade = useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    Animated.timing(entranceFade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [entranceFade]);

  React.useEffect(() => {
    let active = true;
    tributeDraftService
      .initialize()
      .then(() => {
        if (!active) return;
        const draft = params.draftId
          ? tributeDraftService.getDraftById(params.draftId)
          : undefined;
        if (draft) {
          setTributeId(draft.payload.id);
          createdAtRef.current = draft.payload.createdAt;
          setMentorName(draft.payload.mentorName);
          setRelationship(toTributeRelationship(draft.payload.relationship));
          setStory(draft.payload.story);
          setPhotoUri(draft.payload.isCustomPhoto ? draft.payload.photoUri || null : null);
          setIsCustomPhoto(draft.payload.isCustomPhoto);
          setActivePromptText(draft.payload.inspirationPrompt || null);
          setSelectedCardId(null);
          tributeDraftService.setPayload(draft.payload);
          if (draft.designState) {
            tributeDraftService.setDesignState(draft.designState);
          }
        } else if (params.draftId) {
          Alert.alert("Draft not found", "This appreciation draft could not be found.");
        }
        setIsHydrated(true);
      })
      .catch((error: unknown) => {
        console.error("Unable to load appreciation draft:", error);
        if (active) {
          Alert.alert("Draft unavailable", "Your appreciation draft could not be loaded.");
          setIsHydrated(true);
        }
      });
    return () => {
      active = false;
    };
  }, [params.draftId]);

  // Photo: called straight from the tap (mobile browsers block pickers opened later).
  const handlePickPhoto = async () => {
    setLoadingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotoUri(await persistImageUri(result.assets[0].uri));
        setIsCustomPhoto(true);
      }
    } catch {
      Alert.alert("Couldn't open your photos", "Please try again.");
    } finally {
      setLoadingPhoto(false);
    }
  };

  const handlePhotoRemoved = () => {
    setPhotoUri(null);
    setIsCustomPhoto(false);
  };

  // Inspiration prompt tap: adds the question to the story to write under.
  const handleSelectInspiration = (promptText: string, cardId: string) => {
    setSelectedCardId(cardId);
    setActivePromptText(promptText);

    if (!story.trim()) {
      setStory(promptText + "\n\n");
    } else if (!story.includes(promptText)) {
      setStory((prev) => prev.trim() + "\n\n" + promptText + "\n");
    }
  };

  const buildPayload = React.useCallback((): TributePayload => ({
    id: tributeId,
    mentorName: mentorName.trim(),
    recipientEmail: recipientEmail.trim() || undefined,
    relationship,
    photoUri: photoUri || DEFAULT_SAMPLE_PORTRAIT,
    isCustomPhoto,
    story: story.trim(),
    inspirationPrompt: activePromptText || undefined,
    createdAt: createdAtRef.current,
  }), [tributeId, mentorName, recipientEmail, relationship, photoUri, isCustomPhoto, story, activePromptText]);

  React.useEffect(() => {
    if (!isHydrated) return;
    const hasContent =
      mentorName.trim() || story.trim() || isCustomPhoto || activePromptText;
    if (!hasContent) return;
    const timeout = setTimeout(() => {
      const design = tributeDraftService.getDesignState();
      tributeDraftService
        .saveDraft(
          buildPayload(),
          design?.id === tributeId ? design : null
        )
        .catch((error: unknown) => {
          console.error("Unable to autosave appreciation draft:", error);
          Alert.alert("Draft not saved", "Your appreciation draft could not be saved.");
        });
    }, 700);
    return () => clearTimeout(timeout);
  }, [
    isHydrated,
    mentorName,
    story,
    isCustomPhoto,
    activePromptText,
    buildPayload,
    tributeId,
  ]);

  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);

  const handleSaveDraft = async () => {
    const payload = buildPayload();
    try {
      await tributeDraftService.saveDraft(
        payload,
        tributeDraftService.getDesignState()?.id === tributeId
          ? tributeDraftService.getDesignState()
          : null
      );
      // Feedback in the interface, not an alert (HIG feedback.md).
      setDraftSavedAt(Date.now());
    } catch (error) {
      console.error("Unable to save tribute draft:", error);
      Alert.alert("Could not save draft", "Please check device storage and try again.");
    }
  };

  React.useEffect(() => {
    if (draftSavedAt === null) return;
    const t = setTimeout(() => setDraftSavedAt(null), 2000);
    return () => clearTimeout(t);
  }, [draftSavedAt]);

  // Handle "Continue to Design" submission & validation
  const handleContinueToDesign = async () => {
    if (!mentorName.trim()) {
      setValidationError("Add the name of the person you're celebrating.");
      return;
    }

    if (!story.trim()) {
      setValidationError("Write a memory or a lesson they gave you.");
      return;
    }

    setValidationError(null);

    const payload = buildPayload();

    // Store safely in shared state service
    tributeDraftService.setPayload(payload);
    try {
      const design = tributeDraftService.getDesignState();
      await tributeDraftService.saveDraft(
        payload,
        design?.id === tributeId ? design : null
      );
    } catch (error) {
      console.error("Unable to update tribute draft:", error);
      setValidationError("Your draft could not be saved. Please try again.");
      return;
    }

    router.push({
      pathname: "/tribute-design",
      params: {
        id: payload.id,
        name: payload.mentorName,
        recipientEmail: payload.recipientEmail,
        relationship: payload.relationship,
        photoUri: payload.photoUri || undefined,
        story: payload.story,
      },
    });
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/create"));

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loading}>
          <ActivityIndicator color={ACCENT} />
          <Text style={styles.loadingText}>Restoring your draft…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const relationshipOptions = TRIBUTE_RELATIONSHIPS.includes(relationship)
    ? TRIBUTE_RELATIONSHIPS
    : [...TRIBUTE_RELATIONSHIPS, relationship];
  const nameMissing = validationError !== null && !mentorName.trim();
  const storyMissing = validationError !== null && mentorName.trim().length > 0 && !story.trim();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />

      {/* Navigation bar */}
      <View style={styles.navBar}>
        <Pressable
          onPress={goBack}
          style={styles.navIcon}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color={SystemColors.label} />
        </Pressable>
        <Text style={styles.navTitle} accessibilityRole="header">
          Appreciation
        </Text>
        <Pressable
          onPress={handleSaveDraft}
          style={styles.navAction}
          accessibilityRole="button"
          accessibilityLabel={draftSavedAt ? "Draft saved" : "Save draft"}
        >
          <Text style={styles.navActionText}>{draftSavedAt ? "Saved ✓" : "Save Draft"}</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <Animated.View style={[styles.flex, { opacity: entranceFade }]}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <Text style={styles.lede}>
                Celebrate someone who left a little of themselves in who you became.
              </Text>

              {/* 1. Live card */}
              <AppreciationCardPreview
                name={mentorName}
                relationship={relationship}
                story={story}
                photoUri={photoUri}
                loadingPhoto={loadingPhoto}
                onPickPhoto={handlePickPhoto}
                onRemovePhoto={handlePhotoRemoved}
              />

              {/* 2. Who */}
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Who are you celebrating?
              </Text>
              <TextInput
                value={mentorName}
                onChangeText={(text) => {
                  setMentorName(text);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Their name"
                placeholderTextColor={SystemColors.placeholderText}
                style={[styles.field, nameMissing && styles.fieldError]}
                autoCapitalize="words"
                returnKeyType="next"
                maxLength={60}
                accessibilityLabel="Their name"
              />

              <Text style={styles.sectionTitle} accessibilityRole="header">
                Their email (optional)
              </Text>
              <Text style={styles.sectionHint}>
                We will send an official appreciation notification to this address from info@onodem.com.
              </Text>
              <TextInput
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                placeholder="name@example.com"
                placeholderTextColor={SystemColors.placeholderText}
                style={styles.field}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Their email"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
                accessibilityRole="radiogroup"
                accessibilityLabel="Your relationship"
              >
                {relationshipOptions.map((option) => {
                  const selected = option === relationship;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setRelationship(option)}
                      style={[styles.chip, selected && styles.chipSelected]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected, checked: selected }}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* 3. Story */}
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Their story
              </Text>
              <Text style={styles.sectionHint}>Need a starting point? Pick a prompt.</Text>
              <View style={styles.prompts}>
                {INSPIRATION_STORY_CARDS.map((card) => {
                  const selected = card.id === selectedCardId;
                  return (
                    <Pressable
                      key={card.id}
                      onPress={() => handleSelectInspiration(card.promptText, card.id)}
                      style={({ pressed }) => [
                        styles.prompt,
                        selected && styles.promptSelected,
                        pressed && styles.pressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityHint="Adds this question to your story"
                    >
                      <Ionicons
                        name={selected ? "checkmark-circle" : "sparkles-outline"}
                        size={18}
                        color={selected ? ACCENT : SystemColors.secondaryLabel}
                      />
                      <View style={styles.promptText}>
                        <Text style={styles.promptTitle}>{card.title}</Text>
                        <Text style={styles.promptSub} numberOfLines={2}>
                          {card.subtitle}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                value={story}
                onChangeText={(text) => {
                  setStory(text);
                  if (validationError) setValidationError(null);
                }}
                placeholder={
                  mentorName.trim()
                    ? `What did ${mentorName.trim().split(" ")[0]} teach you, or do for you?`
                    : "A moment you'll never forget, or a lesson they gave you…"
                }
                placeholderTextColor={SystemColors.placeholderText}
                style={[styles.field, styles.storyField, storyMissing && styles.fieldError]}
                multiline
                maxLength={STORY_MAX}
                textAlignVertical="top"
                accessibilityLabel="Their story"
              />
              <Text style={styles.counter}>
                {story.length}/{STORY_MAX}
              </Text>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Pinned footer */}
        <View style={styles.footer}>
          <View style={styles.footerInner}>
            {validationError && (
              <Text style={styles.error} accessibilityRole="alert">
                {validationError}
              </Text>
            )}
            <Pressable
              onPress={handleContinueToDesign}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Continue to Design</Text>
              <Ionicons name="arrow-forward" size={18} color={SystemColors.inverseLabel} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function toTributeRelationship(value?: string): TributeRelationship {
  switch (value) {
    case "Teacher":
    case "Parent":
    case "Coach":
    case "Friend":
    case "Leader":
    case "Other":
    case "Grandparent":
    case "Professor":
    case "Colleague":
    case "Spiritual Guide":
    case "Other Mentor":
    case "Literature Teacher":
    case "Research Advisor":
    case "Engineering Director":
    case "Art & Design Coach":
    case "Friend & Mentor":
      return value;
    default:
      return "Other";
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: SystemColors.systemBackground },
  pressed: { opacity: 0.8 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: Palette.textMuted },

  navBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: Layout.margin / 2,
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH + Layout.margin * 2,
    alignSelf: "center",
  },
  navIcon: { width: 88, height: Layout.minTouch, justifyContent: "center", paddingLeft: 4 },
  navTitle: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.label, flex: 1, textAlign: "center" },
  navAction: { width: 88, height: Layout.minTouch, alignItems: "flex-end", justifyContent: "center", paddingRight: 8 },
  navActionText: { ...TextStyles.body, fontFamily: AppFonts.body, color: SystemColors.blue },

  scrollContent: { paddingBottom: 32 },
  content: {
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: Layout.margin,
  },
  lede: {
    ...TextStyles.subheadline,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },

  sectionTitle: {
    ...TextStyles.title3,
    fontFamily: AppFonts.displaySans,
    color: SystemColors.label,
    marginTop: 32,
    marginBottom: 12,
  },
  sectionHint: {
    ...TextStyles.subheadline,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    marginTop: -6,
    marginBottom: 12,
  },

  field: {
    ...TextStyles.body,
    fontFamily: AppFonts.body,
    color: SystemColors.label,
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusMedium,
    minHeight: Layout.controlHeight,
    paddingHorizontal: Layout.margin,
    borderWidth: 1,
    borderColor: "transparent",
  },
  fieldError: { borderColor: SystemColors.red },
  storyField: { minHeight: 180, paddingTop: 14, paddingBottom: 14, marginTop: 14, lineHeight: 24 },
  counter: {
    ...TextStyles.caption1,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    alignSelf: "flex-end",
    marginTop: 6,
  },

  chips: { gap: 8, paddingTop: 12 },
  chip: {
    minHeight: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    justifyContent: "center",
    backgroundColor: SystemColors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: SystemColors.opaqueSeparator,
  },
  chipSelected: { backgroundColor: SystemColors.label, borderColor: SystemColors.label },
  chipText: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: SystemColors.label },
  chipTextSelected: { color: SystemColors.inverseLabel, fontWeight: "600" },

  prompts: { gap: 8 },
  prompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: "transparent",
  },
  promptSelected: { borderColor: "rgba(255, 55, 95, 0.55)", backgroundColor: "rgba(255, 55, 95, 0.08)" },
  promptText: { flex: 1 },
  promptTitle: { ...TextStyles.subheadline, fontFamily: AppFonts.body, fontWeight: "600", color: SystemColors.label },
  promptSub: { ...TextStyles.footnote, fontFamily: AppFonts.body, color: Palette.textMuted, marginTop: 1 },

  footer: {
    paddingHorizontal: Layout.margin,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SystemColors.separator,
    backgroundColor: SystemColors.systemBackground,
  },
  footerInner: { width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", gap: 8 },
  error: { ...TextStyles.footnote, fontFamily: AppFonts.body, color: SystemColors.red, textAlign: "center" },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: Layout.controlHeight,
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.label,
  },
  primaryButtonText: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.inverseLabel },
});
