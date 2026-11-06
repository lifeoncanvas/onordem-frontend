/**
 * Post-signup profile setup — shown right after an account is created.
 *
 * Four short steps: birthday (required: age check), gender, profile photo, and
 * a short bio + who you're here to honour. Everything after the birthday can be
 * skipped (HIG onboarding.md: "Postpone nonessential setup flows").
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { persistImageUri } from "@/utils/persistMedia";
import { AppFonts, Layout, SystemColors, TextStyles, Palette } from "@/constants/theme";
import { userProfileService } from "@/services/userProfileService";

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_AGE = 10;
const BIO_MAX = 150;
const ROW_HEIGHT = 44;
const WHEEL_HEIGHT = ROW_HEIGHT * 5;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const GENDER_OPTIONS = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
] as const;

const HONOUR_OPTIONS = [
  { id: "teacher", label: "Teachers", icon: "school-outline" },
  { id: "parent", label: "Parents", icon: "home-outline" },
  { id: "grandparent", label: "Grandparents", icon: "heart-outline" },
  { id: "coach", label: "Coaches", icon: "trophy-outline" },
  { id: "manager", label: "Managers", icon: "briefcase-outline" },
  { id: "friend", label: "Friends", icon: "people-outline" },
  { id: "spiritual", label: "Spiritual guides", icon: "sparkles-outline" },
] as const;

type StepId = "birthday" | "gender" | "photo" | "about";
const STEPS: StepId[] = ["birthday", "gender", "photo", "about"];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function daysInMonth(monthIndex: number, year: number | null): number {
  // Unknown year: allow Feb 29 so a leap-day birthday can be picked before the year.
  return new Date(year ?? 2000, monthIndex + 1, 0).getDate();
}

function ageOn(today: Date, year: number, monthIndex: number, day: number): number {
  let age = today.getFullYear() - year;
  const beforeBirthday =
    today.getMonth() < monthIndex || (today.getMonth() === monthIndex && today.getDate() < day);
  if (beforeBirthday) age -= 1;
  return age;
}

function toIsoDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ─── Wheel column (cross-platform list picker) ────────────────────────────────

interface WheelColumnProps<T extends string | number> {
  label: string;
  values: T[];
  selected: T | null;
  onSelect: (value: T) => void;
  format?: (value: T) => string;
  /** Value to centre on first layout when nothing is selected yet. */
  initialFocus?: T;
  flex?: number;
}

function WheelColumn<T extends string | number>({
  label,
  values,
  selected,
  onSelect,
  format = (v) => String(v),
  initialFocus,
  flex = 1,
}: WheelColumnProps<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const didInitialScroll = useRef(false);

  const centreOn = (value: T | undefined | null, animated: boolean) => {
    if (value === undefined || value === null) return;
    const index = values.indexOf(value);
    if (index < 0) return;
    // Content has (WHEEL_HEIGHT - ROW_HEIGHT) / 2 of top padding, so row `index` is centred at y = index * ROW_HEIGHT.
    const y = index * ROW_HEIGHT;
    scrollRef.current?.scrollTo({ y, animated });
  };

  return (
    <View style={[styles.wheel, { flex }]} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onLayout={() => {
          if (didInitialScroll.current) return;
          didInitialScroll.current = true;
          centreOn(selected ?? initialFocus, false);
        }}
        contentContainerStyle={{ paddingVertical: (WHEEL_HEIGHT - ROW_HEIGHT) / 2 }}
        nestedScrollEnabled
      >
        {values.map((value) => {
          const isSelected = value === selected;
          return (
            <TouchableOpacity
              key={String(value)}
              style={[styles.wheelRow, isSelected && styles.wheelRowSelected]}
              onPress={() => {
                onSelect(value);
                centreOn(value, true);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, checked: isSelected }}
              accessibilityLabel={`${label} ${format(value)}`}
            >
              <Text
                style={[styles.wheelText, isSelected && styles.wheelTextSelected]}
                numberOfLines={1}
              >
                {format(value)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileSetupScreen() {
  // The stored profile may still be loading on a cold start, so follow updates.
  const [existing, setExisting] = useState(() => userProfileService.getProfile());
  useEffect(() => userProfileService.subscribe(setExisting), []);
  const today = useMemo(() => new Date(), []);
  const years = useMemo(
    () => Array.from({ length: 111 }, (_, i) => today.getFullYear() - i),
    [today]
  );

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

  // Birthday
  const [month, setMonth] = useState<number | null>(null);
  const [pickedDay, setDay] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);

  // Gender
  const [gender, setGender] = useState<string | null>(null);

  // Photo
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [pickingPhoto, setPickingPhoto] = useState(false);

  // About
  const [bio, setBio] = useState("");
  const [honouring, setHonouring] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the day valid when the month or year changes (e.g. Mar 31 → Feb 28).
  const maxDay = month === null ? 31 : daysInMonth(month, year);
  const day = pickedDay === null ? null : Math.min(pickedDay, maxDay);

  const days = useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay]);
  const monthIndexes = useMemo(() => MONTHS.map((_, i) => i), []);

  const birthdayComplete = month !== null && day !== null && year !== null;
  const age = birthdayComplete ? ageOn(today, year!, month!, day!) : null;
  const isInFuture = age !== null && age < 0;
  const tooYoung = age !== null && age >= 0 && age < MIN_AGE;

  const firstName = (existing.name || "").split(" ")[0];
  const initials = (existing.name || "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ── Navigation ──

  const canContinue = (() => {
    switch (step) {
      case "birthday":
        return birthdayComplete && !tooYoung && !isInFuture;
      case "gender":
        return gender !== null;
      case "photo":
        return photoUri !== null;
      case "about":
        return true;
    }
  })();

  const goNext = () => {
    setError(null);
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      void finish();
    }
  };

  const goBack = () => {
    setError(null);
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const skip = () => {
    // Skipping a step discards anything half-entered on it.
    if (step === "gender") {
      setGender(null);
    }
    if (step === "photo") setPhotoUri(null);
    if (step === "about") {
      void finish({ skipAbout: true });
      return;
    }
    goNext();
  };

  const finish = async ({ skipAbout = false }: { skipAbout?: boolean } = {}) => {
    if (!birthdayComplete) return;
    setSaving(true);
    setError(null);
    try {
      await userProfileService.updateProfile({
        birthday: toIsoDate(year!, month!, day!),
        ...(gender ? { gender } : {}),
        ...(photoUri ? { avatarUri: photoUri } : {}),
        ...(!skipAbout && bio.trim() ? { bio: bio.trim() } : {}),
        ...(!skipAbout && honouring.length ? { honouring } : {}),
        setupComplete: true,
      });
      // Save to the server in the background (photo upload can take a moment).
      userProfileService.pushToBackend().catch((e) => console.debug("Profile sync later:", e));
      router.replace("/home");
    } catch {
      setError("Your profile couldn't be saved on this device. Try a smaller photo, or skip the photo for now.");
      setSaving(false);
    }
  };

  // ── Photo ──

  const pickFromLibrary = async () => {
    // Must run directly from the tap: mobile browsers block pickers opened later.
    setPickingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled && result.assets?.[0]?.uri) setPhotoUri(await persistImageUri(result.assets[0].uri));
    } catch {
      setError("Couldn't open your photos. Please try again.");
    } finally {
      setPickingPhoto(false);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Camera Access Is Off",
        "To take a profile photo, allow camera access for Honour Your Mentor in Settings. You can also choose a photo from your library."
      );
      return;
    }
    setPickingPhoto(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        cameraType: ImagePicker.CameraType.front,
      });
      if (!result.canceled && result.assets?.[0]?.uri) setPhotoUri(await persistImageUri(result.assets[0].uri));
    } catch {
      setError("Couldn't open the camera. Please try again.");
    } finally {
      setPickingPhoto(false);
    }
  };

  const toggleHonouring = (id: string) => {
    setHonouring((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  // ── Step content ──

  const renderBirthday = () => (
    <>
      <Text style={styles.title} accessibilityRole="header">
        {firstName ? `When's your birthday, ${firstName}?` : "When's your birthday?"}
      </Text>
      <Text style={styles.subtitle}>
        We use it to confirm you&apos;re old enough to join. It won&apos;t be shown on your profile.
      </Text>

      <View style={styles.datePreview} accessibilityLiveRegion="polite">
        <Text style={[styles.datePreviewText, !birthdayComplete && styles.datePreviewPlaceholder]}>
          {birthdayComplete ? `${MONTHS[month!]} ${day}, ${year}` : "Choose month, day and year"}
        </Text>
        {age !== null && !isInFuture && (
          <Text style={styles.datePreviewAge}>
            {age} {age === 1 ? "year" : "years"} old
          </Text>
        )}
      </View>

      <View style={styles.wheelGroup}>
        <WheelColumn
          label="Month"
          values={monthIndexes}
          selected={month}
          onSelect={setMonth}
          format={(m) => MONTHS[m]}
          initialFocus={today.getMonth()}
          flex={1.6}
        />
        <WheelColumn
          label="Day"
          values={days}
          selected={day}
          onSelect={setDay}
          initialFocus={Math.min(today.getDate(), maxDay)}
          flex={0.8}
        />
        <WheelColumn
          label="Year"
          values={years}
          selected={year}
          onSelect={setYear}
          initialFocus={today.getFullYear() - 25}
          flex={1}
        />
      </View>

      {tooYoung && (
        <Text style={styles.inlineError} accessibilityRole="alert">
          You need to be at least {MIN_AGE} to use Honour Your Mentor.
        </Text>
      )}
      {isInFuture && (
        <Text style={styles.inlineError} accessibilityRole="alert">
          That date hasn&apos;t happened yet. Check the year.
        </Text>
      )}
    </>
  );

  const renderGender = () => (
    <>
      <Text style={styles.title} accessibilityRole="header">
        How do you identify?
      </Text>
      <Text style={styles.subtitle}>Optional. Only you can see this.</Text>

      <View style={styles.groupedList} accessibilityRole="radiogroup" accessibilityLabel="Gender">
        {GENDER_OPTIONS.map((option, index) => {
          const isSelected = gender === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.listRow, index > 0 && styles.listRowDivider]}
              onPress={() => setGender(option.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, checked: isSelected }}
              accessibilityLabel={option.label}
            >
              <Text style={styles.listRowText}>{option.label}</Text>
              {isSelected && <Ionicons name="checkmark" size={22} color={SystemColors.blue} />}
            </TouchableOpacity>
          );
        })}
      </View>

    </>
  );

  const renderPhoto = () => (
    <>
      <Text style={styles.title} accessibilityRole="header">
        Add a profile photo
      </Text>
      <Text style={styles.subtitle}>
        A familiar face helps the people you honour recognise you.
      </Text>

      <View style={styles.avatarWrap}>
        <TouchableOpacity
          onPress={pickFromLibrary}
          disabled={pickingPhoto}
          style={styles.avatar}
          accessibilityRole="button"
          accessibilityLabel={photoUri ? "Change profile photo" : "Choose a profile photo"}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <Text style={styles.avatarInitials}>{initials || "?"}</Text>
          )}
          <View style={styles.avatarBadge}>
            {pickingPhoto ? (
              <ActivityIndicator size="small" color={SystemColors.inverseLabel} />
            ) : (
              <Ionicons name={photoUri ? "pencil" : "camera"} size={18} color={SystemColors.inverseLabel} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.photoActions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={pickFromLibrary}
          disabled={pickingPhoto}
          accessibilityRole="button"
        >
          <Ionicons name="images-outline" size={20} color={SystemColors.blue} />
          <Text style={styles.secondaryButtonText}>
            {photoUri ? "Choose a Different Photo" : "Choose from Library"}
          </Text>
        </TouchableOpacity>
        {Platform.OS !== "web" && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={takePhoto}
            disabled={pickingPhoto}
            accessibilityRole="button"
          >
            <Ionicons name="camera-outline" size={20} color={SystemColors.blue} />
            <Text style={styles.secondaryButtonText}>Take Photo</Text>
          </TouchableOpacity>
        )}
        {photoUri && (
          <TouchableOpacity
            style={styles.textButton}
            onPress={() => setPhotoUri(null)}
            accessibilityRole="button"
          >
            <Text style={styles.destructiveText}>Remove Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const renderAbout = () => (
    <>
      <Text style={styles.title} accessibilityRole="header">
        Who are you here to honour?
      </Text>
      <Text style={styles.subtitle}>
        Pick any that apply. We&apos;ll suggest prompts and stories to match.
      </Text>

      <View style={styles.chipWrap}>
        {HONOUR_OPTIONS.map((option) => {
          const isSelected = honouring.includes(option.id);
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleHonouring(option.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={option.label}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={isSelected ? "#000" : SystemColors.secondaryLabel}
              />
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.fieldLabel} nativeID="bioLabel">
        Bio
      </Text>
      <TextInput
        style={[styles.textField, styles.bioField]}
        value={bio}
        onChangeText={setBio}
        placeholder="A line about you, or someone who shaped you"
        placeholderTextColor={SystemColors.placeholderText}
        maxLength={BIO_MAX}
        multiline
        textAlignVertical="top"
        accessibilityLabel="Bio"
        accessibilityLabelledBy="bioLabel"
      />
      <Text style={styles.counter}>
        {bio.length}/{BIO_MAX}
      </Text>
    </>
  );

  const isOptionalStep = step !== "birthday";
  const isLastStep = stepIndex === STEPS.length - 1;
  const primaryLabel = isLastStep ? "Finish" : "Next";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top bar: back · progress · skip */}
        <View style={styles.topBar}>
          <View style={styles.topBarSide}>
            {stepIndex > 0 && (
              <TouchableOpacity
                onPress={goBack}
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <Ionicons name="chevron-back" size={26} color={SystemColors.label} />
              </TouchableOpacity>
            )}
          </View>

          <View
            style={styles.progress}
            accessibilityRole="progressbar"
            accessibilityLabel={`Step ${stepIndex + 1} of ${STEPS.length}`}
            accessibilityValue={{ min: 1, max: STEPS.length, now: stepIndex + 1 }}
          >
            {STEPS.map((id, i) => (
              <View
                key={id}
                style={[styles.progressSegment, i <= stepIndex && styles.progressSegmentActive]}
              />
            ))}
          </View>

          <View style={[styles.topBarSide, styles.topBarSideEnd]}>
            {isOptionalStep && (
              <TouchableOpacity
                onPress={skip}
                disabled={saving}
                style={styles.skipButton}
                accessibilityRole="button"
                accessibilityLabel={isLastStep ? "Skip and finish" : "Skip this step"}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {step === "birthday" && renderBirthday()}
            {step === "gender" && renderGender()}
            {step === "photo" && renderPhoto()}
            {step === "about" && renderAbout()}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerInner}>
            {error && (
              <Text style={styles.inlineError} accessibilityRole="alert">
                {error}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.primaryButton, (!canContinue || saving) && styles.primaryButtonDisabled]}
              onPress={goNext}
              disabled={!canContinue || saving}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canContinue || saving }}
            >
              {saving ? (
                <ActivityIndicator color={SystemColors.inverseLabel} />
              ) : (
                <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CONTENT_MAX_WIDTH = 480;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: SystemColors.systemBackground },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.margin / 2,
    height: 52,
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH + Layout.margin * 2,
    alignSelf: "center",
  },
  topBarSide: { width: 64, justifyContent: "center" },
  topBarSideEnd: { alignItems: "flex-end" },
  iconButton: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
  progress: { flex: 1, flexDirection: "row", gap: 6 },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: SystemColors.tertiarySystemFill,
  },
  progressSegmentActive: { backgroundColor: SystemColors.label },
  skipButton: {
    minWidth: Layout.minTouch,
    height: Layout.minTouch,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: { ...TextStyles.body, fontFamily: AppFonts.body, color: SystemColors.blue },

  // Content
  scrollContent: { flexGrow: 1, paddingHorizontal: Layout.marginWide, paddingBottom: 24 },
  content: { width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", paddingTop: 20 },
  title: {
    ...TextStyles.title1,
    fontFamily: AppFonts.displaySans,
    color: SystemColors.label,
    marginBottom: 8,
  },
  subtitle: {
    ...TextStyles.subheadline,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    marginBottom: 28,
  },

  // Birthday
  datePreview: {
    alignItems: "center",
    marginBottom: 16,
    minHeight: 50,
  },
  datePreviewText: { ...TextStyles.title3, fontFamily: AppFonts.displaySans, color: SystemColors.label },
  datePreviewPlaceholder: { color: Palette.textMuted, fontWeight: "400" },
  datePreviewAge: {
    ...TextStyles.footnote,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    marginTop: 4,
  },
  wheelGroup: {
    flexDirection: "row",
    gap: 8,
    height: WHEEL_HEIGHT,
  },
  wheel: {
    height: WHEEL_HEIGHT,
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.secondarySystemBackground,
    overflow: "hidden",
  },
  wheelRow: {
    height: ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    borderRadius: Layout.radiusSmall,
  },
  wheelRowSelected: { backgroundColor: SystemColors.tertiarySystemBackground },
  wheelText: { ...TextStyles.body, fontFamily: AppFonts.body, color: Palette.textMuted },
  wheelTextSelected: { color: SystemColors.label, fontWeight: "600" },

  // Gender list
  groupedList: {
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.secondarySystemBackground,
    overflow: "hidden",
  },
  listRow: {
    minHeight: Layout.minTouch + 6,
    paddingHorizontal: Layout.margin,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listRowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: SystemColors.separator },
  listRowText: { ...TextStyles.body, fontFamily: AppFonts.body, color: SystemColors.label },

  // Fields
  fieldLabel: {
    ...TextStyles.footnote,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 8,
    marginLeft: 4,
  },
  textField: {
    ...TextStyles.body,
    fontFamily: AppFonts.body,
    color: SystemColors.label,
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusMedium,
    minHeight: Layout.controlHeight,
    paddingHorizontal: Layout.margin,
    marginTop: 12,
  },
  bioField: { minHeight: 110, paddingTop: 14, paddingBottom: 14, marginTop: 0 },
  counter: {
    ...TextStyles.caption1,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    alignSelf: "flex-end",
    marginTop: 6,
  },

  // Photo
  avatarWrap: { alignItems: "center", marginTop: 8, marginBottom: 32 },
  avatar: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: SystemColors.tertiarySystemBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 168, height: 168, borderRadius: 84 },
  avatarInitials: {
    fontSize: 56,
    fontWeight: "600",
    fontFamily: AppFonts.displaySans,
    color: SystemColors.secondaryLabel,
  },
  avatarBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SystemColors.label,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: SystemColors.systemBackground,
  },
  photoActions: { gap: 12 },
  secondaryButton: {
    height: Layout.controlHeight,
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.secondarySystemBackground,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.blue },
  textButton: { height: Layout.minTouch, alignItems: "center", justifyContent: "center" },
  destructiveText: { ...TextStyles.body, fontFamily: AppFonts.body, color: SystemColors.red },

  // Honour chips
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: Layout.minTouch,
    paddingHorizontal: 16,
    borderRadius: Layout.minTouch / 2,
    backgroundColor: SystemColors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: SystemColors.opaqueSeparator,
  },
  chipSelected: { backgroundColor: SystemColors.label, borderColor: SystemColors.label },
  chipText: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: SystemColors.label },
  chipTextSelected: { color: SystemColors.inverseLabel, fontWeight: "600" },

  // Footer
  footer: {
    paddingHorizontal: Layout.marginWide,
    paddingTop: 12,
    paddingBottom: 12,
  },
  footerInner: { width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", gap: 10 },
  primaryButton: {
    height: Layout.controlHeight,
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.label,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: { opacity: 0.35 },
  primaryButtonText: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.inverseLabel },
  inlineError: {
    ...TextStyles.footnote,
    fontFamily: AppFonts.body,
    color: SystemColors.red,
    marginTop: 12,
  },
});
