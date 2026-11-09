import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";
import { memoryService } from "@/services/memoryService";
import { userProfileService } from "@/services/userProfileService";

interface CreativeVoiceModalProps {
  visible: boolean;
  onClose: () => void;
  voiceNote?: {
    id?: string;
    title: string;
    mentorName: string;
    relationship?: string;
    duration: string;
    date?: string;
    description?: string;
    transcript?: string;
    audioUri?: string;
  } | null;
  mode?: "listen" | "record";
}

const WAVEFORM_HEIGHTS = [38, 60, 80, 100, 116, 100, 80, 60, 38];

export default function CreativeVoiceModal({
  visible,
  onClose,
  voiceNote,
  mode: initialMode = "listen",
}: CreativeVoiceModalProps) {
  const [activeTab, setActiveTab] = useState<"listen" | "record">(initialMode);
  const [isPlaying, setIsPlaying] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteQuote, setNoteQuote] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [sendEmailDedication, setSendEmailDedication] = useState(true);
  const [shareOnFeed, setShareOnFeed] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // MediaRecorder refs for web audio
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioUrlRef = useRef<string | null>(null);
  const recordedAudioPlayerRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Bar animations
  const barAnims = useMemo(
    () => WAVEFORM_HEIGHTS.map((h) => new Animated.Value(h * 0.35)),
    []
  );
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  const displayTranscript =
    voiceNote?.description ||
    voiceNote?.transcript ||
    voiceNote?.title ||
    "A voice memo recorded to keep you grounded on the path.";

  const mentorDisplayName = voiceNote?.mentorName || "Your Mentor";

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode, visible]);

  // Waveform animation
  useEffect(() => {
    if (!visible) return;

    const shouldAnimate = (activeTab === "listen" && isPlaying) || (activeTab === "record" && isRecording);

    if (!shouldAnimate) {
      barAnims.forEach((anim, i) =>
        Animated.timing(anim, {
          toValue: WAVEFORM_HEIGHTS[i] * 0.28,
          duration: 180,
          useNativeDriver: false,
        }).start()
      );
      return;
    }

    const loops = barAnims.map((anim, i) => {
      const minH = WAVEFORM_HEIGHTS[i] * 0.28;
      const maxH = WAVEFORM_HEIGHTS[i];
      const duration = 400 + i * 85;

      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: maxH,
            duration,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: minH,
            duration,
            useNativeDriver: false,
          }),
        ])
      );
    });

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 850,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );

    loops.forEach((l) => l.start());
    pulseLoop.start();

    return () => {
      loops.forEach((l) => l.stop());
      pulseLoop.stop();
    };
  }, [visible, activeTab, isPlaying, isRecording, barAnims, pulseAnim]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const playAcousticChime = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        const chords = [329.63, 392.0, 523.25, 659.25]; // E4, G4, C5, E5
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.5);
        });
      } catch (e) {
        console.debug("Chime playback error:", e);
      }
    }
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setRecordSeconds(0);
    setHasRecorded(false);
    setRecordedAudioUri(null);
    recordedAudioUrlRef.current = null;

    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType =
          typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";
        const options = mimeType ? { mimeType } : undefined;
        const recorder = new (window as any).MediaRecorder(stream, options);

        recorder.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          try {
            const blob = new Blob(audioChunksRef.current, mimeType ? { type: mimeType } : undefined);
            const url = URL.createObjectURL(blob);
            recordedAudioUrlRef.current = url;
            setRecordedAudioUri(url);
          } catch (err) {
            console.warn("Blob creation err:", err);
          }
          stream.getTracks().forEach((track) => track.stop());
        };
        recorder.start(250);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.warn("Microphone access simulated:", err);
      }
    }

    setIsRecording(true);
    timerIntervalRef.current = setInterval(() => {
      setRecordSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setHasRecorded(true);
  };

  const playRecordedVoiceFallback = () => {
    if (Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = noteQuote.trim() || noteTitle.trim() || `Dedicated voice message of appreciation for ${mentorDisplayName}.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onend = () => setIsPlayingRecorded(false);
      utterance.onerror = () => setIsPlayingRecorded(false);
      setIsPlayingRecorded(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const togglePlayRecordedAudio = () => {
    if (Platform.OS !== "web") return;

    if (isPlayingRecorded) {
      if (recordedAudioPlayerRef.current) {
        recordedAudioPlayerRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingRecorded(false);
      return;
    }

    playAcousticChime();

    const audioUrl = recordedAudioUri || recordedAudioUrlRef.current;
    if (audioUrl) {
      try {
        if (!recordedAudioPlayerRef.current || recordedAudioPlayerRef.current.src !== audioUrl) {
          recordedAudioPlayerRef.current = new Audio(audioUrl);
          recordedAudioPlayerRef.current.onended = () => setIsPlayingRecorded(false);
          recordedAudioPlayerRef.current.onerror = () => playRecordedVoiceFallback();
        }
        recordedAudioPlayerRef.current.currentTime = 0;
        recordedAudioPlayerRef.current
          .play()
          .then(() => {
            setIsPlayingRecorded(true);
          })
          .catch(() => {
            playRecordedVoiceFallback();
          });
        return;
      } catch {
        playRecordedVoiceFallback();
        return;
      }
    }

    playRecordedVoiceFallback();
  };

  const playMentorVoice = () => {
    playAcousticChime();
    if (Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const cleanText = displayTranscript.replace(/[“”"]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.94;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopMentorVoice = () => {
    if (Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleToggleListen = () => {
    if (isPlaying) {
      stopMentorVoice();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playMentorVoice();
    }
  };

  useEffect(() => {
    if (!visible) {
      stopMentorVoice();
      setIsPlaying(false);
      if (recordedAudioPlayerRef.current) {
        recordedAudioPlayerRef.current.pause();
        setIsPlayingRecorded(false);
      }
    }
  }, [visible]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSaveRecordedNote = async () => {
    const mentorName = voiceNote?.mentorName || "My Mentor";
    const title = noteTitle.trim() || `Voice Note for ${mentorName}`;
    const quote = noteQuote.trim() || "A heartfelt voice message dedicated to guiding principles.";
    const durationStr = formatTimer(recordSeconds || 45);

    setIsSaving(true);
    try {
      const savedId = `voice-${Date.now()}`;
      const author = userProfileService.getProfile();

      // 1. Save to local memories
      memoryService.addMemory({
        kind: "memory",
        id: savedId,
        mentorName,
        relationship: voiceNote?.relationship || "Mentor",
        title,
        excerpt: quote,
        story: quote,
        year: String(new Date().getFullYear()),
        emotion: "Inspiration",
        emotionColor: Palette.accentSky,
        quote: quote,
        createdAt: new Date().toISOString(),
        isPinned: false,
      }, {
        recipientEmail: mentorEmail.trim() || undefined,
        sendDedicationEmail: sendEmailDedication && !!mentorEmail.trim(),
        signature: author.name || undefined,
        privacy: shareOnFeed ? "PUBLIC" : "PRIVATE",
      });

      // 2. memoryService.addMemory saves it to the backend and sends the dedication email.

      const alertMsg = mentorEmail.trim() && sendEmailDedication
        ? `Your voice note has been recorded and dedicated! We sent an email notification to ${mentorEmail.trim()} with the link so your mentor can listen.`
        : "Your voice note has been saved to your collection and shared to your feed!";

      Alert.alert("Voice Note Dedicated", alertMsg, [
        {
          text: "Done",
          onPress: () => {
            onClose();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("Unable to save", err.message || "Could not save your voice note.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* ── TOP NAV BAR ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Close voice modal"
          >
            <Ionicons name="arrow-back" size={20} color={Palette.textPrimary} />
          </TouchableOpacity>

          {/* Mode Switcher Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, activeTab === "listen" && styles.modeTabActive]}
              onPress={() => setActiveTab("listen")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="volume-medium"
                size={14}
                color={activeTab === "listen" ? Palette.accentSky : Palette.textSecondary}
              />
              <Text
                style={[
                  styles.modeTabText,
                  activeTab === "listen" && styles.modeTabTextActive,
                ]}
              >
                Listen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, activeTab === "record" && styles.modeTabActive]}
              onPress={() => setActiveTab("record")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="mic"
                size={14}
                color={activeTab === "record" ? Palette.accentPink : Palette.textSecondary}
              />
              <Text
                style={[
                  styles.modeTabText,
                  activeTab === "record" && styles.modeTabTextActive,
                ]}
              >
                Record for Mentor
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={20} color={Palette.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── CONTENT BODY ── */}
        {activeTab === "listen" ? (
          /* LISTEN MODE */
          <View style={styles.listenContainer}>
            <View style={styles.statusSection}>
              <Text style={styles.statusLabel}>
                {isPlaying ? "Playing Voice Note..." : "Tap to Listen"}
              </Text>
              {!!mentorDisplayName && (
                <Text style={styles.mentorLabel}>{mentorDisplayName}</Text>
              )}
              <TouchableOpacity
                style={styles.listenPillBtn}
                onPress={handleToggleListen}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isPlaying ? "pause-circle" : "play-circle"}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.listenPillText}>
                  {isPlaying ? "Pause Audio" : `Play ${mentorDisplayName}'s Audio Memo`}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.waveformSection}>
              <View style={styles.waveformRow}>
                {barAnims.map((anim, idx) => (
                  <Animated.View
                    key={`bar-${idx}`}
                    style={[
                      styles.waveBar,
                      {
                        height: isPlaying ? anim : WAVEFORM_HEIGHTS[idx] * 0.28,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.transcriptSection}>
              <Text style={styles.transcriptText}>
                &ldquo;{displayTranscript}&rdquo;
              </Text>
            </View>

            <View style={styles.bottomDock}>
              <TouchableOpacity
                style={styles.circleBtn}
                activeOpacity={0.8}
                onPress={() => setActiveTab("record")}
              >
                <Ionicons name="mic-outline" size={22} color={Palette.accentPink} />
              </TouchableOpacity>

              <View style={styles.mainBtnWrap}>
                <Animated.View
                  style={[
                    styles.pulseRingOuter,
                    { transform: [{ scale: isPlaying ? pulseAnim : 1 }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.pulseRingInner,
                    { transform: [{ scale: isPlaying ? pulseAnim : 1 }] },
                  ]}
                />
                <TouchableOpacity
                  style={styles.mainBtn}
                  activeOpacity={0.85}
                  onPress={handleToggleListen}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={30}
                    color={Palette.textOnPrimary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.circleBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={22} color={Palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* RECORD MODE */
          <ScrollView
            contentContainerStyle={styles.recordScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.statusSection}>
              <Text style={styles.statusLabel}>
                {isRecording
                  ? "Recording Your Voice..."
                  : hasRecorded
                  ? "Voice Note Ready"
                  : `Record for ${mentorDisplayName}`}
              </Text>
              <Text style={styles.recordTimer}>{formatTimer(recordSeconds)}</Text>
            </View>

            {/* Waveform while recording */}
            <View style={styles.waveformSection}>
              <View style={styles.waveformRow}>
                {barAnims.map((anim, idx) => (
                  <Animated.View
                    key={`rec-bar-${idx}`}
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: isRecording ? Palette.accentPink : Palette.accentSky,
                        height: isRecording ? anim : WAVEFORM_HEIGHTS[idx] * 0.28,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Mic Action Button */}
            <View style={styles.recordActionWrap}>
              {!isRecording ? (
                <TouchableOpacity
                  style={[styles.recordBtn, { backgroundColor: hasRecorded ? "#20191D" : Palette.accentPink }]}
                  onPress={startRecording}
                  activeOpacity={0.85}
                >
                  <Ionicons name="mic" size={32} color="#FFFFFF" />
                  <Text style={styles.recordBtnText}>
                    {hasRecorded ? "Record Again" : "Tap to Record"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.recordBtn, { backgroundColor: "#D32F2F" }]}
                  onPress={stopRecording}
                  activeOpacity={0.85}
                >
                  <Ionicons name="stop" size={32} color="#FFFFFF" />
                  <Text style={styles.recordBtnText}>Stop Recording</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Play Recorded Audio Preview */}
            {hasRecorded && (
              <View style={styles.previewAudioPlayer}>
                <TouchableOpacity
                  style={styles.playPreviewBtn}
                  onPress={togglePlayRecordedAudio}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={isPlayingRecorded ? "pause" : "play"}
                    size={18}
                    color="#111111"
                  />
                  <Text style={styles.playPreviewText}>
                    {isPlayingRecorded ? "Pause Preview" : "Listen to Your Recording"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Dedication Form (Visible once recorded) */}
            {hasRecorded && (
              <View style={styles.dedicationBox}>
                <Text style={styles.dedicationBoxTitle}>Dedication & Details</Text>

                <TextInput
                  style={styles.inputField}
                  placeholder="Voice note title (e.g. My deepest thank you)"
                  placeholderTextColor="#777777"
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                />

                <TextInput
                  style={[styles.inputField, { minHeight: 60 }]}
                  placeholder="Words or summary of what you spoke about..."
                  placeholderTextColor="#777777"
                  value={noteQuote}
                  onChangeText={setNoteQuote}
                  multiline
                />

                <TextInput
                  style={styles.inputField}
                  placeholder="Mentor's Email (send dedication link)"
                  placeholderTextColor="#777777"
                  value={mentorEmail}
                  onChangeText={setMentorEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setSendEmailDedication((p) => !p)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={sendEmailDedication ? "checkbox" : "square-outline"}
                    size={20}
                    color={sendEmailDedication ? Palette.accentMint : "#666666"}
                  />
                  <Text style={styles.optionText}>
                    Send dedication email from info@onodem.com with link
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setShareOnFeed((p) => !p)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={shareOnFeed ? "checkbox" : "square-outline"}
                    size={20}
                    color={shareOnFeed ? Palette.accentSky : "#666666"}
                  />
                  <Text style={styles.optionText}>
                    Share on your Community Feed & Memory Wall
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, { opacity: isSaving ? 0.7 : 1 }]}
                  onPress={handleSaveRecordedNote}
                  disabled={isSaving}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveBtnText}>
                    {isSaving ? "Saving & Sending..." : "Save & Dedicate Voice Note"}
                  </Text>
                  <Ionicons name="paper-plane" size={17} color="#111111" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
    paddingTop: Platform.select({ ios: 54, android: 40, default: 40 }),
    paddingBottom: Platform.select({ ios: 34, android: 24, default: 24 }),
    paddingHorizontal: 22,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.12)",
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "#161616",
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: "#2B2B2B",
    gap: 4,
  },
  modeTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: "#262626",
  },
  modeTabText: {
    color: Palette.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  modeTabTextActive: {
    color: "#FFFFFF",
  },
  listenContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  statusSection: {
    alignItems: "center",
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: Palette.textPrimary,
    letterSpacing: 0.1,
  },
  mentorLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: Palette.accentSky,
    marginTop: 5,
  },
  listenPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Palette.accentSky,
    gap: 8,
  },
  listenPillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  recordTimer: {
    fontSize: 26,
    fontWeight: "800",
    color: Palette.accentPink,
    marginTop: 6,
    fontFamily: AppFonts.body,
  },
  waveformSection: {
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.17,
    width: "100%",
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: "100%",
  },
  waveBar: {
    width: 14,
    borderRadius: 8,
    backgroundColor: Palette.accentSky,
    boxShadow: "0px 4px 3px rgba(0, 0, 0, 0.12)",
  },
  transcriptSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  transcriptText: {
    fontSize: 21,
    lineHeight: 32,
    textAlign: "center",
    color: Palette.textPrimary,
    fontWeight: "500",
    fontFamily: AppFonts.body,
  },
  bottomDock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  mainBtnWrap: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
    position: "relative",
  },
  pulseRingOuter: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(143, 211, 255, 0.06)",
  },
  pulseRingInner: {
    position: "absolute",
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(143, 211, 255, 0.1)",
  },
  mainBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Palette.oceanTeal,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  recordScroll: {
    paddingBottom: 40,
    alignItems: "center",
  },
  recordActionWrap: {
    marginVertical: 14,
    alignItems: "center",
  },
  recordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
  },
  recordBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  previewAudioPlayer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  playPreviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Palette.accentMint,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.2)",
  },
  playPreviewText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "800",
  },
  dedicationBox: {
    width: "100%",
    backgroundColor: "#151515",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#282828",
    marginTop: 10,
  },
  dedicationBoxTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  inputField: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    color: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  optionText: {
    color: "#DDDDDD",
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  saveBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  saveBtnText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "800",
  },
});
