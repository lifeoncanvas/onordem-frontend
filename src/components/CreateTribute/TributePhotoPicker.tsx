import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { persistImageUri } from "@/utils/persistMedia";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface PresetPhoto {
  id: string;
  label: string;
  uri: string;
}

const PRESET_PORTRAITS: PresetPhoto[] = [
  {
    id: "mentor-teacher",
    label: "Teacher",
    uri: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "mentor-guide",
    label: "Leader",
    uri: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "mentor-parent",
    label: "Parent",
    uri: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "mentor-coach",
    label: "Coach",
    uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
  },
];

interface TributePhotoPickerProps {
  currentPhotoUri: string | null;
  isCustomPhoto: boolean;
  onPhotoSelected: (uri: string, isCustom: boolean) => void;
  onPhotoRemoved: () => void;
}

export default function TributePhotoPicker({
  currentPhotoUri,
  isCustomPhoto,
  onPhotoSelected,
  onPhotoRemoved,
}: TributePhotoPickerProps) {
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Default displayed image is either custom user photo or sample portrait
  const displayUri = currentPhotoUri || PRESET_PORTRAITS[0].uri;

  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to select an appreciation-card photo from your gallery."
        );
        return;
      }

      setIsLoadingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onPhotoSelected(await persistImageUri(result.assets[0].uri), true);
      }
    } catch {
      Alert.alert("Error", "Could not load image from gallery. Please try again.");
    } finally {
      setIsLoadingImage(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.labelRow}>
          <Ionicons name="camera-outline" size={13} color={Palette.turquoise} />
          <Text style={styles.editorialLabel}>PHOTO SELECTION</Text>
        </View>
        <Text style={styles.heading}>Choose a photo that tells your story</Text>
        <Text style={styles.subtitle}>
          A portrait, a candid moment, or a handwritten memory worth framing
        </Text>
      </View>

      {/* Main Photographic Card */}
      <View style={styles.photoCard}>
        {/* Photo Viewport */}
        <View style={styles.imageViewport}>
          <Image
            source={{ uri: displayUri }}
            style={styles.portraitImage}
            resizeMode="cover"
          />

          {isLoadingImage && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={Palette.pureWhite} />
            </View>
          )}

          {/* Badge over photo */}
          <View style={styles.photoStatusBadge}>
            <Ionicons
              name={isCustomPhoto ? "checkmark-circle" : "sparkles"}
              size={11}
              color={isCustomPhoto ? "#2E7D32" : Palette.turquoise}
            />
            <Text style={styles.photoStatusText}>
              {isCustomPhoto ? "YOUR TRIBUTE PHOTO" : "SAMPLE PORTRAIT"}
            </Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.controlsRow}>
          {!isCustomPhoto ? (
            <TouchableOpacity
              onPress={handlePickFromGallery}
              activeOpacity={0.85}
              style={styles.addPhotoBtn}
              accessibilityRole="button"
              accessibilityLabel="Add your photo from device gallery"
            >
              <Ionicons name="image-outline" size={17} color="#000000" />
              <Text style={styles.addPhotoBtnText}>Add your photo</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.customActionRow}>
              <TouchableOpacity
                onPress={handlePickFromGallery}
                activeOpacity={0.8}
                style={styles.replaceBtn}
                accessibilityRole="button"
                accessibilityLabel="Replace selected photo"
              >
                <Ionicons
                  name="sync-outline"
                  size={14}
                  color={Palette.deepTeal}
                />
                <Text style={styles.replaceBtnText}>Replace photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onPhotoRemoved}
                activeOpacity={0.8}
                style={styles.removeBtn}
                accessibilityRole="button"
                accessibilityLabel="Remove selected photo"
              >
                <Ionicons
                  name="trash-outline"
                  size={14}
                  color={Palette.textSecondary}
                />
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Curated Preset Alternatives if user hasn't uploaded yet */}
        {!isCustomPhoto && (
          <View style={styles.presetsArea}>
            <Text style={styles.presetsTitle}>
              Or choose from the mentor portraits:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsList}
            >
              {PRESET_PORTRAITS.map((item) => {
                const isSelected = displayUri === item.uri;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => onPhotoSelected(item.uri, false)}
                    activeOpacity={0.8}
                    style={[
                      styles.presetThumbWrap,
                      isSelected && styles.presetThumbActive,
                    ]}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.presetThumb}
                    />
                    <Text
                      style={[
                        styles.presetThumbLabel,
                        isSelected && styles.presetThumbLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 14,
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
  photoCard: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageViewport: {
    height: 230,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Palette.mintMist,
  },
  portraitImage: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(84, 0, 14, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoStatusBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 248, 240, 0.92)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.35)",
  },
  photoStatusText: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: 0.8,
  },
  controlsRow: {
    marginTop: 12,
  },
  addPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  addPhotoBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.2,
  },
  customActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  replaceBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Palette.mintMist,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.3)",
  },
  replaceBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  removeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "rgba(84, 0, 14, 0.05)",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  presetsArea: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(177, 167, 166, 0.2)",
  },
  presetsTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.textSecondary,
    marginBottom: 8,
  },
  presetsList: {
    gap: 10,
  },
  presetThumbWrap: {
    alignItems: "center",
    padding: 3,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  presetThumbActive: {
    borderColor: Palette.accentSky,
    backgroundColor: "rgba(143, 211, 255, 0.12)",
  },
  presetThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  presetThumbLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Palette.textSecondary,
    marginTop: 3,
  },
  presetThumbLabelActive: {
    color: Palette.accentSky,
    fontWeight: "800",
  },
});
