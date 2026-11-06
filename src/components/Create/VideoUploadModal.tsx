import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";
import { memoryService } from "@/services/memoryService";

interface VideoUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function VideoUploadModal({
  visible,
  onClose,
  onSuccess,
}: VideoUploadModalProps) {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setVideoUri(null);
    setCaption("");
    setMentorName("");
    setDuration(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleRecordVideo = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please grant camera access to record a video memory."
        );
        return;
      }

      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["videos"],
        allowsEditing: true,
        quality: 0.85,
        videoMaxDuration: 180, // up to 3 minutes
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setVideoUri(asset.uri);
        if (asset.duration) {
          setDuration(Math.round(asset.duration / 1000));
        }
      }
    } catch {
      Alert.alert("Camera Error", "Could not record video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Gallery Permission Required",
          "Please grant photo library access to upload a video."
        );
        return;
      }

      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setVideoUri(asset.uri);
        if (asset.duration) {
          setDuration(Math.round(asset.duration / 1000));
        }
      }
    } catch {
      Alert.alert("Gallery Error", "Could not load video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostVideo = () => {
    if (!videoUri) {
      Alert.alert("Video required", "Please record or select a video to continue.");
      return;
    }

    const title = caption.trim()
      ? caption.slice(0, 50).trim()
      : `Video Tribute for ${mentorName.trim() || "My Mentor"}`;

    memoryService.addMemory({
      kind: "memory",
      id: `video_${Date.now()}`,
      mentorName: mentorName.trim() || "My Mentor",
      relationship: "Mentor",
      title,
      excerpt: caption.trim() || "A video remembrance captured in deep gratitude.",
      story: caption.trim() || "A video remembrance captured in deep gratitude.",
      imageUri: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      year: new Date().getFullYear().toString(),
      emotion: "Gratitude",
      emotionColor: "#8FD3FF",
      createdAt: new Date().toISOString(),
    });

    Alert.alert(
      "Video Posted! 🎉",
      "Your video tribute has been saved to your keepsakes and memory wall.",
      [
        {
          text: "View Keepsakes",
          onPress: () => {
            handleClose();
            onSuccess?.();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Upload Video</Text>
                <Text style={styles.subtitle}>
                  Capture spoken memories and moments that live on
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* If no video selected, show the two primary options */}
            {!videoUri ? (
              <View style={styles.selectionGrid}>
                {/* 1. Record a Video */}
                <TouchableOpacity
                  onPress={handleRecordVideo}
                  activeOpacity={0.8}
                  style={styles.actionCard}
                >
                  <View style={[styles.iconCircle, { backgroundColor: "rgba(143, 211, 255, 0.15)" }]}>
                    <Ionicons name="videocam" size={26} color={Palette.accentSky} />
                  </View>
                  <Text style={styles.actionCardTitle}>Record a Video</Text>
                  <Text style={styles.actionCardSub}>
                    Use camera to record a heartfelt reflection right now
                  </Text>
                </TouchableOpacity>

                {/* 2. Add from Gallery */}
                <TouchableOpacity
                  onPress={handleAddFromGallery}
                  activeOpacity={0.8}
                  style={styles.actionCard}
                >
                  <View style={[styles.iconCircle, { backgroundColor: "rgba(143, 240, 198, 0.15)" }]}>
                    <Ionicons name="film-outline" size={26} color={Palette.accentMint} />
                  </View>
                  <Text style={styles.actionCardTitle}>Add from Gallery</Text>
                  <Text style={styles.actionCardSub}>
                    Pick an existing video memory from your device
                  </Text>
                </TouchableOpacity>

                {isLoading && (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={Palette.accentMint} />
                    <Text style={styles.loadingText}>Preparing video...</Text>
                  </View>
                )}
              </View>
            ) : (
              /* Preview Video & Caption Section */
              <View style={styles.previewSection}>
                <View style={styles.previewCard}>
                  <View style={styles.previewHeaderRow}>
                    <View style={styles.previewBadge}>
                      <Ionicons name="play-circle" size={14} color={Palette.accentSky} />
                      <Text style={styles.previewBadgeText}>PREVIEW VIDEO</Text>
                    </View>
                    <TouchableOpacity onPress={() => setVideoUri(null)} style={styles.changeBtn}>
                      <Text style={styles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.videoPlaceholder}>
                    <Ionicons name="videocam" size={44} color={Palette.accentSky} />
                    <Text style={styles.videoReadyText}>Video Ready to Share</Text>
                    {duration ? (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>
                          {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Mentor Dedicated To */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>HONOURING MENTOR</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="e.g. Mrs. Anita Sharma or Dr. Reed"
                    placeholderTextColor={Palette.textMuted}
                    value={mentorName}
                    onChangeText={setMentorName}
                  />
                </View>

                {/* Add a Caption */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ADD A CAPTION</Text>
                  <TextInput
                    style={[styles.inputField, styles.captionInput]}
                    placeholder="Add a caption to this video tribute..."
                    placeholderTextColor={Palette.textMuted}
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    maxLength={300}
                  />
                </View>

                {/* Post Video Button */}
                <TouchableOpacity
                  onPress={handlePostVideo}
                  activeOpacity={0.85}
                  style={styles.postBtn}
                >
                  <Text style={styles.postBtnText}>Post Video</Text>
                  <Ionicons name="checkmark-circle" size={18} color="#111111" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  sheet: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    borderTopWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignSelf: "center",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  subtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
  },
  selectionGrid: {
    gap: 14,
  },
  actionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  actionCardTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  actionCardSub: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    textAlign: "center",
    fontFamily: AppFonts.body,
    maxWidth: 260,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  loadingText: {
    fontSize: 13,
    color: Palette.textSecondary,
  },
  previewSection: {
    gap: 16,
  },
  previewCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  previewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(143, 211, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.accentSky,
    letterSpacing: 0.8,
  },
  changeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeBtnText: {
    fontSize: 12,
    color: Palette.accentSky,
    fontWeight: "700",
  },
  videoPlaceholder: {
    height: 160,
    backgroundColor: "#202020",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  videoReadyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  durationBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Palette.textSecondary,
    letterSpacing: 0.8,
  },
  inputField: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  captionInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  postBtn: {
    backgroundColor: Palette.accentMint,
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  postBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111111",
    fontFamily: AppFonts.body,
  },
});

