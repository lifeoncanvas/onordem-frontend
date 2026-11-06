import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
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

// ─── Types ────────────────────────────────────────────────────────────────────

export type CaptureKind = "quote" | "lesson" | "memory" | "milestone";

export interface CapturedMoment {
  id: string;
  kind: CaptureKind;
  text: string;
  mentorName: string;
  date: string;
}

interface CaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (moment: CapturedMoment) => void;
}

// ─── Capture kind options ─────────────────────────────────────────────────────

interface KindOption {
  kind: CaptureKind;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  color: string;
  description: string;
}

const KIND_OPTIONS: KindOption[] = [
  {
    kind: "quote",
    label: "Their Words",
    icon: "chatbubble-ellipses",
    placeholder: "Something they said that you never forgot…",
    color: Palette.accentCoral,
    description: "A quote or saying that stayed with you",
  },
  {
    kind: "lesson",
    label: "Life Lesson",
    icon: "bulb",
    placeholder: "A lesson they taught you, directly or by example…",
    color: Palette.accentSky,
    description: "Wisdom you still carry today",
  },
  {
    kind: "memory",
    label: "Memory",
    icon: "images",
    placeholder: "A moment with them you want to remember…",
    color: Palette.accentLavender,
    description: "A scene, a feeling, a turning point",
  },
  {
    kind: "milestone",
    label: "Milestone",
    icon: "flag",
    placeholder: "An achievement or milestone they helped you reach…",
    color: Palette.accentAmber,
    description: "Something they helped you accomplish",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CaptureModal({ visible, onClose, onSave }: CaptureModalProps) {
  const [selectedKind, setSelectedKind] = useState<CaptureKind>("quote");
  const [text, setText] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const slideAnim = useMemo(() => new Animated.Value(400), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const successScale = useMemo(() => new Animated.Value(0.8), []);

  const textRef = useRef<TextInput>(null);

  const handleShow = () => {
    setIsSaved(false);
    setText("");
    setMentorName("");
    setSelectedKind("quote");
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start(() => {
      textRef.current?.focus();
    });
  };

  React.useEffect(() => {
    if (!visible) {
      slideAnim.setValue(400);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  };

  const handleSave = () => {
    if (!text.trim()) return;

    const moment: CapturedMoment = {
      id: `moment-${Date.now()}`,
      kind: selectedKind,
      text: text.trim(),
      mentorName: mentorName.trim() || "My Mentor",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setIsSaved(true);
    Animated.spring(successScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      onSave(moment);
      handleClose();
    }, 1400);
  };

  const activeOption = KIND_OPTIONS.find((o) => o.kind === selectedKind)!;
  const canSave = text.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onShow={handleShow}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="flash" size={18} color={Palette.turquoise} />
              <Text style={styles.headerTitle}>Capture a Moment</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close capture modal"
            >
              <Ionicons name="close" size={20} color={Palette.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Kind Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.kindRow}
            >
              {KIND_OPTIONS.map((opt) => {
                const isActive = opt.kind === selectedKind;
                return (
                  <TouchableOpacity
                    key={opt.kind}
                    style={[
                      styles.kindChip,
                      isActive && { backgroundColor: opt.color, borderColor: opt.color },
                    ]}
                    onPress={() => setSelectedKind(opt.kind)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${opt.label}`}
                    accessibilityState={{ selected: isActive }}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={14}
                      color={isActive ? Palette.textOnPrimary : Palette.textSecondary}
                    />
                    <Text
                      style={[
                        styles.kindChipText,
                        isActive && styles.kindChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Description */}
            <Text style={styles.kindDescription}>{activeOption.description}</Text>

            {/* Main Text Input */}
            {isSaved ? (
              <Animated.View style={[styles.successBox, { transform: [{ scale: successScale }] }]}>
                <View style={[styles.successIconCircle, { backgroundColor: activeOption.color }]}>
                  <Ionicons name="checkmark" size={28} color={Palette.textOnPrimary} />
                </View>
                <Text style={styles.successTitle}>Saved to your collection</Text>
                <Text style={styles.successSub}>
                  &quot;{text.trim().slice(0, 60)}{text.trim().length > 60 ? "…" : ""}&quot;
                </Text>
              </Animated.View>
            ) : (
              <>
                <View style={styles.textAreaWrap}>
                  <TextInput
                    ref={textRef}
                    value={text}
                    onChangeText={setText}
                    placeholder={activeOption.placeholder}
                    placeholderTextColor={Palette.textMuted}
                    multiline
                    style={styles.textArea}
                    selectionColor={activeOption.color}
                    textAlignVertical="top"
                    maxLength={800}
                    autoCorrect
                    autoCapitalize="sentences"
                    accessibilityLabel="Capture text input"
                  />
                  {text.length > 0 && (
                    <Text style={styles.charCount}>{text.length}/800</Text>
                  )}
                </View>

                {/* Mentor Name */}
                <View style={styles.mentorInputWrap}>
                  <Ionicons
                    name="person"
                    size={16}
                    color={Palette.textMuted}
                    style={styles.mentorIcon}
                  />
                  <TextInput
                    value={mentorName}
                    onChangeText={setMentorName}
                    placeholder="Who said or inspired this? (optional)"
                    placeholderTextColor={Palette.textMuted}
                    style={styles.mentorInput}
                    selectionColor={Palette.oceanTeal}
                    autoCapitalize="words"
                    maxLength={60}
                    accessibilityLabel="Mentor name input"
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!canSave}
                  activeOpacity={0.85}
                  style={[
                    styles.saveBtn,
                    {
                      backgroundColor: canSave
                        ? Palette.oceanTeal
                        : Palette.surfaceElevated,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Save this moment"
                >
                  <Ionicons
                    name="bookmark"
                    size={17}
                    color={canSave ? Palette.textOnPrimary : Palette.textMuted}
                  />
                  <Text
                    style={[
                      styles.saveBtnText,
                      !canSave && styles.saveBtnTextDisabled,
                    ]}
                  >
                    Save This Moment
                  </Text>
                </TouchableOpacity>

                {/* Helper text */}
                <Text style={styles.helperText}>
                  Saved moments are added to your personal memory collection.
                </Text>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Palette.pureWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    maxHeight: "85%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.borderSubtle,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.textPrimary,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 8,
  },
  kindRow: {
    gap: 8,
    paddingRight: 8,
    marginBottom: 10,
  },
  kindChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Palette.borderSubtle,
  },
  kindChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  kindChipTextActive: {
    color: Palette.textOnPrimary,
    fontWeight: "700",
  },
  kindDescription: {
    fontSize: 13,
    color: Palette.textMuted,
    marginBottom: 16,
    fontStyle: "italic",
  },
  textAreaWrap: {
    backgroundColor: Palette.surfaceElevated,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    minHeight: 130,
    position: "relative",
  },
  textArea: {
    fontSize: 16,
    lineHeight: 24,
    color: Palette.textPrimary,
    fontWeight: "500",
    minHeight: 100,
    paddingVertical: 0,
  },
  charCount: {
    position: "absolute",
    bottom: 10,
    right: 14,
    fontSize: 11,
    color: Palette.textMuted,
    fontWeight: "600",
  },
  mentorInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 18,
    height: 48,
  },
  mentorIcon: {
    marginRight: 8,
  },
  mentorInput: {
    flex: 1,
    fontSize: 14.5,
    color: Palette.textPrimary,
    fontWeight: "500",
    paddingVertical: 0,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 28,
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.textOnPrimary,
    letterSpacing: 0.2,
  },
  saveBtnTextDisabled: {
    color: Palette.textMuted,
  },
  helperText: {
    fontSize: 12,
    color: Palette.textMuted,
    textAlign: "center",
  },
  // Success state
  successBox: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: Palette.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
  },
});
