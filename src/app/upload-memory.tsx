/**
 * Upload Photos, Videos & Audio — turn moments from the camera roll into a memory.
 *
 * Flow: pick photos and/or videos → preview them (tap the strip, remove any), optionally
 * attach one audio clip (record a voice note or choose an audio file) → say who it's about,
 * add a title and caption → Save. Saved as a "memory" wall item: first photo is the cover,
 * the rest go to additionalImages, videos to videoUris, audio to audioUri.
 */
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { persistImageUri } from "@/utils/persistMedia";
import * as DocumentPicker from "expo-document-picker";
import { AppFonts, Layout, Palette, SystemColors, TextStyles } from "@/constants/theme";
import { memoryService } from "@/services/memoryService";
import MemoryVideo from "@/components/MemoryVideo";
import AudioPlaybackControls from "@/components/home/AudioPlaybackControls";
import VoiceRecorderModal, { type RecordedVoiceNote } from "@/components/home/VoiceRecorderModal";

interface AttachedAudio {
  uri: string;
  name: string;
  durationSeconds?: number;
}

const MAX_ITEMS = 10;
const CAPTION_MAX = 500;
const CONTENT_MAX_WIDTH = 640;

interface PickedMedia {
  uri: string;
  type: "image" | "video";
  /** Seconds, videos only. */
  duration?: number;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function toPicked(assets: ImagePicker.ImagePickerAsset[]): PickedMedia[] {
  return assets.map((a) => ({
    uri: a.uri,
    type: a.type === "video" || a.type === "pairedVideo" ? "video" : "image",
    // expo-image-picker reports duration in milliseconds.
    duration: a.duration ? a.duration / 1000 : undefined,
  }));
}

/** Photos become reload-safe data URLs on web; videos stay as picked. */
function persistPicked(items: PickedMedia[]): Promise<PickedMedia[]> {
  return Promise.all(
    items.map(async (m) => (m.type === "image" ? { ...m, uri: await persistImageUri(m.uri) } : m))
  );
}

export default function UploadMemoryScreen() {
  const mentors = useMemo(() => memoryService.getAllMentorProfiles().slice(0, 8), []);

  const [media, setMedia] = useState<PickedMedia[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mentorName, setMentorName] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [picking, setPicking] = useState(false);
  const [audio, setAudio] = useState<AttachedAudio | null>(null);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = media[Math.min(activeIndex, media.length - 1)];
  const remaining = MAX_ITEMS - media.length;
  const canSave = (media.length > 0 || audio !== null) && mentorName.trim().length > 0;

  const addMedia = (picked: PickedMedia[]) => {
    if (picked.length === 0) return;
    setActiveIndex(media.length); // jump to the first newly added item
    setMedia((current) => [...current, ...picked].slice(0, MAX_ITEMS));
    setError(null);
  };

  // Called straight from the tap: mobile browsers block pickers opened later.
  const pickFromLibrary = async () => {
    if (remaining <= 0) return;
    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.7,
        videoMaxDuration: 180,
      });
      if (!result.canceled) addMedia(await persistPicked(toPicked(result.assets)));
    } catch {
      setError("Couldn't open your photos. Please try again.");
    } finally {
      setPicking(false);
    }
  };

  const capture = async () => {
    if (remaining <= 0) return;
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Camera Access Is Off",
        "To take photos or videos here, allow camera access for Honour Your Mentor in Settings. You can still choose from your library."
      );
      return;
    }
    setPicking(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images", "videos"],
        quality: 0.7,
        videoMaxDuration: 180,
      });
      if (!result.canceled) addMedia(await persistPicked(toPicked(result.assets)));
    } catch {
      setError("Couldn't open the camera. Please try again.");
    } finally {
      setPicking(false);
    }
  };

  // Must run straight from the tap on web (browser user-activation rule).
  const chooseAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        setAudio({ uri: file.uri, name: file.name.replace(/.[^.]+$/, "") || "Audio clip" });
        setError(null);
      }
    } catch {
      setError("Couldn't open your files. Please try again.");
    }
  };

  const onRecorded = (recording: RecordedVoiceNote) => {
    setAudio({
      uri: recording.uri,
      name: recording.title || "Voice note",
      durationSeconds: recording.durationSeconds,
    });
    if (!mentorName.trim() && recording.mentorName) setMentorName(recording.mentorName);
    setRecorderOpen(false);
    setError(null);
  };

  const remove = (index: number) => {
    setMedia((current) => current.filter((_, i) => i !== index));
    setActiveIndex((i) => Math.max(0, i >= index ? i - 1 : i));
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  const save = () => {
    if (!canSave) return;
    const images = media.filter((m) => m.type === "image").map((m) => m.uri);
    const videos = media.filter((m) => m.type === "video").map((m) => m.uri);
    const now = new Date();
    const name = mentorName.trim();
    const existing = mentors.find((m) => m.name.toLowerCase() === name.toLowerCase());
    try {
      const id = memoryService.addMemory({
        kind: "memory",
        id: `media-${Date.now()}`,
        title:
          title.trim() ||
          (images.length ? "A moment to remember" : videos.length ? "A moment on video" : "A voice to remember"),
        mentorName: name,
        mentorId: existing?.id,
        relationship: existing?.relationship ?? "Mentor",
        excerpt:
          caption.trim() ||
          (media.length
            ? `${media.length} ${media.length === 1 ? "moment" : "moments"} with ${name}`
            : `A recording for ${name}`),
        story: caption.trim() || undefined,
        imageUri: images[0],
        additionalImages: images.slice(1),
        videoUris: videos.length ? videos : undefined,
        audioUri: audio?.uri,
        audioDuration: audio?.durationSeconds,
        year: String(now.getFullYear()),
        emotion: "Grateful",
        emotionColor: SystemColors.blue,
        createdAt: now.toISOString(),
      });
      router.replace({ pathname: "/memory-detail/[id]", params: { id } });
    } catch {
      setError("This memory couldn't be saved on this device. Try fewer or smaller files.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Navigation bar: Cancel · title · Save */}
        <View style={styles.navBar}>
          <Pressable onPress={close} style={styles.navButton} accessibilityRole="button">
            <Text style={styles.navCancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.navTitle} accessibilityRole="header">
            New Memory
          </Text>
          <Pressable
            onPress={save}
            disabled={!canSave}
            style={[styles.navButton, styles.navButtonEnd]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
            accessibilityHint={canSave ? undefined : "Add a photo, video or audio clip, and who it's about"}
          >
            <Text style={[styles.navSave, !canSave && styles.navSaveDisabled]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {media.length === 0 ? (
              /* Empty state: the two ways in */
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="images" size={30} color={SystemColors.blue} />
                </View>
                <Text style={styles.emptyTitle}>Add photos and videos</Text>
                <Text style={styles.emptyBody}>
                  Choose up to {MAX_ITEMS} moments with someone who shaped you. Videos can be up to 3 minutes.
                </Text>
                <Pressable
                  onPress={pickFromLibrary}
                  disabled={picking}
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                  accessibilityRole="button"
                >
                  {picking ? (
                    <ActivityIndicator color={SystemColors.inverseLabel} />
                  ) : (
                    <>
                      <Ionicons name="images-outline" size={18} color={SystemColors.inverseLabel} />
                      <Text style={styles.primaryButtonText}>Choose from Library</Text>
                    </>
                  )}
                </Pressable>
                {Platform.OS !== "web" && (
                  <Pressable
                    onPress={capture}
                    disabled={picking}
                    style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                    accessibilityRole="button"
                  >
                    <Ionicons name="camera-outline" size={18} color={SystemColors.blue} />
                    <Text style={styles.secondaryButtonText}>Take Photo or Video</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <>
                {/* Large preview of the selected item */}
                <View style={styles.preview}>
                  {active.type === "video" ? (
                    <MemoryVideo key={active.uri} uri={active.uri} style={styles.previewVideo} />
                  ) : (
                    <Image source={{ uri: active.uri }} style={styles.previewImage} contentFit="cover" />
                  )}
                  <Text style={styles.counter}>
                    {activeIndex + 1} of {media.length}
                  </Text>
                </View>

                {/* Thumbnail strip */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.strip}
                >
                  {media.map((item, index) => {
                    const selected = index === activeIndex;
                    return (
                      <View key={`${item.uri}-${index}`} style={styles.thumbWrap}>
                        <Pressable
                          onPress={() => setActiveIndex(index)}
                          style={[styles.thumb, selected && styles.thumbSelected]}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          accessibilityLabel={`${item.type === "video" ? "Video" : "Photo"} ${index + 1}`}
                        >
                          {item.type === "image" ? (
                            <Image source={{ uri: item.uri }} style={styles.thumbImage} contentFit="cover" />
                          ) : (
                            <View style={styles.thumbVideo}>
                              <Ionicons name="play" size={18} color={SystemColors.label} />
                              {item.duration ? (
                                <Text style={styles.thumbDuration}>{formatDuration(item.duration)}</Text>
                              ) : null}
                            </View>
                          )}
                        </Pressable>
                        <Pressable
                          onPress={() => remove(index)}
                          style={styles.removeBadge}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${item.type === "video" ? "video" : "photo"} ${index + 1}`}
                        >
                          <Ionicons name="close" size={12} color={SystemColors.inverseLabel} />
                        </Pressable>
                      </View>
                    );
                  })}
                  {remaining > 0 && (
                    <Pressable
                      onPress={pickFromLibrary}
                      disabled={picking}
                      style={[styles.thumb, styles.addThumb]}
                      accessibilityRole="button"
                      accessibilityLabel="Add more photos or videos"
                    >
                      {picking ? (
                        <ActivityIndicator color={SystemColors.blue} />
                      ) : (
                        <Ionicons name="add" size={26} color={SystemColors.blue} />
                      )}
                    </Pressable>
                  )}
                </ScrollView>
              </>
            )}

            {/* Audio */}
            <Text style={styles.fieldLabel}>Audio</Text>
            {audio ? (
              <View style={styles.audioAttached}>
                <View style={styles.audioPlayer}>
                  <AudioPlaybackControls
                    uri={audio.uri}
                    title={audio.name}
                    durationSeconds={audio.durationSeconds}
                    compact
                  />
                </View>
                <Pressable
                  onPress={() => setAudio(null)}
                  style={styles.audioRemove}
                  accessibilityRole="button"
                  accessibilityLabel="Remove audio"
                >
                  <Ionicons name="trash-outline" size={18} color={SystemColors.red} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.audioButtons}>
                <Pressable
                  onPress={() => setRecorderOpen(true)}
                  style={({ pressed }) => [styles.audioButton, pressed && styles.pressed]}
                  accessibilityRole="button"
                >
                  <View style={[styles.audioIcon, { backgroundColor: "rgba(255, 159, 10, 0.16)" }]}>
                    <Ionicons name="mic" size={18} color={SystemColors.orange} />
                  </View>
                  <Text style={styles.audioButtonText}>Record Voice Note</Text>
                </Pressable>
                <Pressable
                  onPress={chooseAudioFile}
                  style={({ pressed }) => [styles.audioButton, pressed && styles.pressed]}
                  accessibilityRole="button"
                >
                  <View style={[styles.audioIcon, { backgroundColor: "rgba(191, 90, 242, 0.16)" }]}>
                    <Ionicons name="musical-notes" size={18} color={SystemColors.purple} />
                  </View>
                  <Text style={styles.audioButtonText}>Choose Audio File</Text>
                </Pressable>
              </View>
            )}

            {/* Details */}
            <Text style={styles.fieldLabel}>Who is this about?</Text>
            <TextInput
              value={mentorName}
              onChangeText={setMentorName}
              placeholder="Their name"
              placeholderTextColor={SystemColors.placeholderText}
              style={styles.field}
              autoCapitalize="words"
              accessibilityLabel="Who is this about"
            />
            {mentors.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
                keyboardShouldPersistTaps="handled"
              >
                {mentors.map((m) => {
                  const selected = m.name.toLowerCase() === mentorName.trim().toLowerCase();
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => setMentorName(m.name)}
                      style={[styles.chip, selected && styles.chipSelected]}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{m.name}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Graduation Day"
              placeholderTextColor={SystemColors.placeholderText}
              style={styles.field}
              maxLength={80}
              accessibilityLabel="Title"
            />

            <Text style={styles.fieldLabel}>Caption</Text>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="What makes this moment matter?"
              placeholderTextColor={SystemColors.placeholderText}
              style={[styles.field, styles.captionField]}
              multiline
              maxLength={CAPTION_MAX}
              textAlignVertical="top"
              accessibilityLabel="Caption"
            />
            <Text style={styles.captionCount}>
              {caption.length}/{CAPTION_MAX}
            </Text>

            {error && (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <VoiceRecorderModal
        visible={recorderOpen}
        onClose={() => setRecorderOpen(false)}
        onSave={onRecorded}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: SystemColors.systemBackground },
  pressed: { opacity: 0.8 },

  navBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: Layout.margin,
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH + Layout.margin * 2,
    alignSelf: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
  },
  navButton: { minWidth: 72, height: Layout.minTouch, justifyContent: "center" },
  navButtonEnd: { alignItems: "flex-end" },
  navTitle: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.label, flex: 1, textAlign: "center" },
  navCancel: { ...TextStyles.body, fontFamily: AppFonts.body, color: SystemColors.blue },
  navSave: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.blue },
  navSaveDisabled: { color: SystemColors.tertiaryLabel },

  scroll: { paddingBottom: 48 },
  content: {
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: Layout.margin,
    paddingTop: 16,
  },

  // Empty state
  emptyCard: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: SystemColors.secondarySystemBackground,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(10, 132, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { ...TextStyles.title3, fontFamily: AppFonts.displaySans, color: SystemColors.label },
  emptyBody: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: Palette.textMuted, textAlign: "center", maxWidth: 360 },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
    height: Layout.controlHeight,
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.label,
    marginTop: 10,
  },
  primaryButtonText: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.inverseLabel },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
    height: Layout.controlHeight,
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.tertiarySystemBackground,
  },
  secondaryButtonText: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.blue },

  // Preview
  preview: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: SystemColors.secondarySystemBackground,
  },
  previewImage: { width: "100%", height: "100%" },
  previewVideo: { aspectRatio: undefined, height: "100%", borderRadius: 0 },
  counter: {
    position: "absolute",
    top: 12,
    right: 12,
    ...TextStyles.caption1,
    fontFamily: AppFonts.body,
    fontWeight: "600",
    color: "#FFF",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },

  // Strip
  strip: { gap: 10, paddingVertical: 14, paddingRight: 8 },
  thumbWrap: { paddingTop: 6, paddingRight: 6 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: SystemColors.tertiarySystemBackground,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbSelected: { borderColor: SystemColors.label },
  thumbImage: { width: "100%", height: "100%" },
  thumbVideo: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  thumbDuration: { ...TextStyles.caption2, fontFamily: AppFonts.body, color: SystemColors.secondaryLabel, fontVariant: ["tabular-nums"] },
  removeBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: SystemColors.label,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: SystemColors.systemBackground,
  },
  addThumb: {
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderColor: SystemColors.opaqueSeparator,
  },

  // Fields
  fieldLabel: {
    ...TextStyles.footnote,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    textTransform: "uppercase",
    marginTop: 22,
    marginBottom: 8,
    marginLeft: 4,
  },
  field: {
    ...TextStyles.body,
    fontFamily: AppFonts.body,
    color: SystemColors.label,
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusMedium,
    minHeight: Layout.controlHeight,
    paddingHorizontal: Layout.margin,
  },
  captionField: { minHeight: 120, paddingTop: 14, paddingBottom: 14 },
  captionCount: { ...TextStyles.caption1, fontFamily: AppFonts.body, color: Palette.textMuted, alignSelf: "flex-end", marginTop: 6 },
  chips: { gap: 8, paddingTop: 10 },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    justifyContent: "center",
    backgroundColor: SystemColors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: SystemColors.opaqueSeparator,
  },
  chipSelected: { backgroundColor: SystemColors.label, borderColor: SystemColors.label },
  chipText: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: SystemColors.label },
  chipTextSelected: { color: SystemColors.inverseLabel, fontWeight: "600" },
  // Audio
  audioButtons: { flexDirection: "row", gap: 10 },
  audioButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 12,
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.secondarySystemBackground,
  },
  audioIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  audioButtonText: { ...TextStyles.subheadline, fontFamily: AppFonts.body, fontWeight: "600", color: SystemColors.label, flexShrink: 1 },
  audioAttached: { flexDirection: "row", alignItems: "center", gap: 10 },
  audioPlayer: { flex: 1 },
  audioRemove: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    borderRadius: Layout.minTouch / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SystemColors.secondarySystemBackground,
  },

  error: { ...TextStyles.footnote, fontFamily: AppFonts.body, color: SystemColors.red, marginTop: 14 },
});
