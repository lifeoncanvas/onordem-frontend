import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Palette } from "@/constants/theme";
import AudioPlaybackControls from "./AudioPlaybackControls";

export interface RecordedVoiceNote {
  uri: string;
  durationSeconds: number;
  title: string;
  mentorName: string;
}

interface VoiceRecorderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (recording: RecordedVoiceNote) => void;
}

export default function VoiceRecorderModal({
  visible,
  onClose,
  onSave,
}: VoiceRecorderModalProps) {
  const options = useMemo(
    () =>
      Platform.OS === "web"
        ? RecordingPresets.HIGH_QUALITY
        : { ...RecordingPresets.HIGH_QUALITY, directory: "document" as const },
    []
  );
  const recorder = useAudioRecorder(options);
  const recorderState = useAudioRecorderState(recorder);
  const [title, setTitle] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [isWorking, setIsWorking] = useState(false);

  const startRecording = async () => {
    setIsWorking(true);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Microphone permission needed",
          "Allow microphone access to record a voice memory."
        );
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await recorder.prepareToRecordAsync(options);
      setRecordedUri(null);
      recorder.record();
    } catch (error) {
      console.error("Unable to start voice recording:", error);
      Alert.alert(
        "Recording unavailable",
        "The microphone could not start recording. Please try again."
      );
    } finally {
      setIsWorking(false);
    }
  };

  const stopRecording = async () => {
    setIsWorking(true);
    try {
      const duration = recorder.currentTime || recorderState.durationMillis / 1000;
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        throw new Error("The recorder stopped without producing an audio file.");
      }
      setRecordedUri(uri);
      setRecordedDuration(Math.max(1, Math.round(duration)));
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    } catch (error) {
      console.error("Unable to finish voice recording:", error);
      Alert.alert(
        "Recording could not be saved",
        "The recording did not produce a playable audio file. Please try again."
      );
    } finally {
      setIsWorking(false);
    }
  };

  const handleSave = () => {
    if (!recordedUri) return;
    onSave({
      uri: recordedUri,
      durationSeconds: recordedDuration,
      title: title.trim() || "Voice memory",
      mentorName: mentorName.trim() || "My Mentor",
    });
    setTitle("");
    setMentorName("");
    setRecordedUri(null);
    setRecordedDuration(0);
  };

  const handleClose = async () => {
    if (recorderState.isRecording) {
      try {
        await recorder.stop();
      } catch (error) {
        console.error("Unable to stop discarded voice recording:", error);
      }
    }
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    } catch (error) {
      console.error("Unable to restore audio mode:", error);
    }
    setTitle("");
    setMentorName("");
    setRecordedUri(null);
    setRecordedDuration(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="mic" size={20} color={Palette.oceanTeal} />
              </View>
              <View style={styles.headingCopy}>
                <Text style={styles.heading}>Record a voice memory</Text>
                <Text style={styles.subheading}>
                  Keep a voice, story, or moment close.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isWorking}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close voice recorder"
            >
              <Ionicons name="close" size={22} color={Palette.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Give this recording a title"
            placeholderTextColor={Palette.textMuted}
            style={styles.input}
            editable={!recorderState.isRecording && !isWorking}
            accessibilityLabel="Voice memory title"
          />
          <TextInput
            value={mentorName}
            onChangeText={setMentorName}
            placeholder="Mentor's name"
            placeholderTextColor={Palette.textMuted}
            style={styles.input}
            editable={!recorderState.isRecording && !isWorking}
            accessibilityLabel="Mentor name"
          />

          {recorderState.isRecording ? (
            <View style={styles.recordingStatus}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording</Text>
              <Text style={styles.duration}>
                {formatTime(recorderState.durationMillis / 1000)}
              </Text>
            </View>
          ) : recordedUri ? (
            <AudioPlaybackControls
              uri={recordedUri}
              title={title.trim() || "Voice memory"}
              durationSeconds={recordedDuration}
            />
          ) : (
            <Text style={styles.hint}>
              Your recording stays on this device.
            </Text>
          )}

          {recorderState.isRecording ? (
            <TouchableOpacity
              onPress={stopRecording}
              disabled={isWorking}
              style={[styles.recordButton, styles.stopButton]}
              accessibilityRole="button"
              accessibilityLabel="Stop recording"
            >
              <Ionicons name="stop" size={20} color={Palette.pureWhite} />
              <Text style={styles.recordButtonText}>
                {isWorking ? "Saving recording..." : "Stop recording"}
              </Text>
            </TouchableOpacity>
          ) : recordedUri ? (
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={startRecording}
                disabled={isWorking}
                style={styles.secondaryButton}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryButtonText}>Record again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isWorking}
                style={styles.recordButton}
                accessibilityRole="button"
              >
                <Ionicons name="bookmark-outline" size={18} color={Palette.pureWhite} />
                <Text style={styles.recordButtonText}>Save voice memory</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={startRecording}
              disabled={isWorking}
              style={styles.recordButton}
              accessibilityRole="button"
              accessibilityLabel="Start voice recording"
            >
              <Ionicons name="mic" size={20} color={Palette.pureWhite} />
              <Text style={styles.recordButtonText}>
                {isWorking ? "Preparing microphone..." : "Start recording"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(28, 0, 8, 0.45)",
  },
  sheet: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 34,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Palette.iceWhite,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: Palette.mintMist,
  },
  headingCopy: { flex: 1 },
  heading: {
    color: Palette.deepTeal,
    fontSize: 18,
    fontWeight: "800",
  },
  subheading: {
    marginTop: 3,
    color: Palette.textSecondary,
    fontSize: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
    color: Palette.deepTeal,
    fontSize: 14,
  },
  hint: {
    paddingVertical: 12,
    color: Palette.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
  recordingStatus: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D32F2F",
  },
  recordingText: {
    color: "#9C2431",
    fontWeight: "700",
  },
  duration: {
    minWidth: 42,
    color: Palette.deepTeal,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
  },
  secondaryButtonText: {
    color: Palette.deepTeal,
    fontSize: 13,
    fontWeight: "700",
  },
  recordButton: {
    minHeight: 50,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Palette.oceanTeal,
  },
  stopButton: {
    backgroundColor: "#9C2431",
  },
  recordButtonText: {
    color: Palette.pureWhite,
    fontSize: 14,
    fontWeight: "800",
  },
});
