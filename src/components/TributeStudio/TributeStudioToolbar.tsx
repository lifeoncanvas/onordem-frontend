import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { persistImageUri } from "@/utils/persistMedia";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import {
  TributeDecorationId,
  TributeFrameStyle,
  TributeTypographyStyle,
} from "@/types/create";
import {
  CURATED_QUOTES,
  DECORATION_OPTIONS,
  STUDIO_FRAMES,
  TYPOGRAPHY_OPTIONS,
} from "@/data/tributeStudioData";

type ToolTab = "frames" | "text" | "decorations" | "photos";

interface TributeStudioToolbarProps {
  currentFrame: TributeFrameStyle;
  onSelectFrame: (frame: TributeFrameStyle) => void;

  quote: string;
  onQuoteChange: (quote: string) => void;
  typographyStyle: TributeTypographyStyle;
  onTypographyChange: (style: TributeTypographyStyle) => void;
  textAlign: "left" | "center";
  onTextAlignChange: (align: "left" | "center") => void;

  activeDecorations: TributeDecorationId[];
  onToggleDecoration: (deco: TributeDecorationId) => void;

  currentPhotoUri: string;
  isCustomPhoto: boolean;
  onPhotoSelected: (uri: string, isCustom: boolean) => void;
  onPhotoRemoved: () => void;
}

export default function TributeStudioToolbar({
  currentFrame,
  onSelectFrame,
  quote,
  onQuoteChange,
  typographyStyle,
  onTypographyChange,
  textAlign,
  onTextAlignChange,
  activeDecorations,
  onToggleDecoration,
  currentPhotoUri,
  isCustomPhoto,
  onPhotoSelected,
  onPhotoRemoved,
}: TributeStudioToolbarProps) {
  const [activeTab, setActiveTab] = useState<ToolTab>("frames");

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to choose a personal photo."
        );
        return;
      }

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
      Alert.alert("Error", "Could not load image from gallery.");
    }
  };

  return (
    <View style={styles.container}>
      {/* 4 Tool Category Tabs */}
      <View style={styles.tabBar}>
        {[
          { key: "frames", label: "Frames", icon: "square-outline" as const },
          { key: "text", label: "Text", icon: "text-outline" as const },
          { key: "decorations", label: "Decorations", icon: "sparkles-outline" as const },
          { key: "photos", label: "Photos", icon: "camera-outline" as const },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as ToolTab)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? Palette.oceanTeal : Palette.textSecondary}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  isActive && styles.tabButtonTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sub-panel Content based on Active Tab */}
      <View style={styles.panelContent}>
        {/* 1. FRAMES PANEL */}
        {activeTab === "frames" && (
          <View style={styles.panelInner}>
            <Text style={styles.panelTitle}>CHOOSE PHOTO FRAME STYLE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {STUDIO_FRAMES.map((f) => {
                const isSelected = currentFrame === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => onSelectFrame(f.id)}
                    style={[
                      styles.frameChip,
                      isSelected && styles.frameChipActive,
                    ]}
                  >
                    <Ionicons
                      name={f.icon}
                      size={14}
                      color={isSelected ? Palette.oceanTeal : Palette.textSecondary}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {f.name}
                    </Text>
                    <View
                      style={[
                        styles.miniBadge,
                        isSelected && styles.miniBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.miniBadgeText,
                          isSelected && styles.miniBadgeTextActive,
                        ]}
                      >
                        {f.badge}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 2. TEXT & QUOTES PANEL */}
        {activeTab === "text" && (
          <View style={styles.panelInner}>
            {/* Alignment & Typography Row */}
            <View style={styles.textControlTopRow}>
              <Text style={styles.panelTitle}>TYPOGRAPHY & ALIGNMENT</Text>
              <View style={styles.alignToggle}>
                <TouchableOpacity
                  onPress={() => onTextAlignChange("left")}
                  style={[
                    styles.alignBtn,
                    textAlign === "left" && styles.alignBtnActive,
                  ]}
                >
                  <Ionicons
                    name="filter-outline"
                    size={14}
                    color={textAlign === "left" ? Palette.pureWhite : Palette.deepTeal}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onTextAlignChange("center")}
                  style={[
                    styles.alignBtn,
                    textAlign === "center" && styles.alignBtnActive,
                  ]}
                >
                  <Ionicons
                    name="menu-outline"
                    size={14}
                    color={textAlign === "center" ? Palette.pureWhite : Palette.deepTeal}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Typography Presets */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {TYPOGRAPHY_OPTIONS.map((ty) => {
                const isSelected = typographyStyle === ty.id;
                return (
                  <TouchableOpacity
                    key={ty.id}
                    onPress={() => onTypographyChange(ty.id)}
                    style={[
                      styles.typoChip,
                      isSelected && styles.typoChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typoName,
                        isSelected && styles.typoNameActive,
                      ]}
                    >
                      {ty.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Curated Quotes Picker */}
            <Text style={[styles.panelTitle, { marginTop: 12 }]}>
              SELECT INSPIRING QUOTE
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quotesScrollRow}
            >
              {CURATED_QUOTES.map((q, idx) => {
                const isSelected = quote === q;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => onQuoteChange(q)}
                    style={[
                      styles.quoteChip,
                      isSelected && styles.quoteChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.quoteChipText,
                        isSelected && styles.quoteChipTextActive,
                      ]}
                      numberOfLines={2}
                    >
                      “{q}”
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Edit Custom Quote Trigger */}
            <View style={styles.customQuoteRow}>
              <TextInput
                style={styles.customQuoteInput}
                placeholder="Or type your own custom quote..."
                placeholderTextColor={Palette.textMuted}
                value={quote}
                onChangeText={onQuoteChange}
              />
            </View>
          </View>
        )}

        {/* 3. DECORATIONS PANEL */}
        {activeTab === "decorations" && (
          <View style={styles.panelInner}>
            <Text style={styles.panelTitle}>
              ADD OR REMOVE ACCENTS & EMBLEMS
            </Text>
            <View style={styles.decorationsGrid}>
              {DECORATION_OPTIONS.map((deco) => {
                const isActive = activeDecorations.includes(deco.id);
                return (
                  <TouchableOpacity
                    key={deco.id}
                    onPress={() => onToggleDecoration(deco.id)}
                    style={[
                      styles.decoButton,
                      isActive && styles.decoButtonActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.decoIconWrap,
                        isActive && styles.decoIconWrapActive,
                      ]}
                    >
                      <Ionicons
                        name={deco.icon}
                        size={16}
                        color={isActive ? Palette.pureWhite : Palette.deepTeal}
                      />
                    </View>
                    <Text
                      style={[
                        styles.decoName,
                        isActive && styles.decoNameActive,
                      ]}
                    >
                      {deco.name}
                    </Text>
                    {isActive && (
                      <Ionicons
                        name="checkmark-circle"
                        size={12}
                        color={Palette.turquoise}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 4. PHOTOS PANEL */}
        {activeTab === "photos" && (
          <View style={styles.panelInner}>
            <Text style={styles.panelTitle}>PHOTO MANAGEMENT</Text>
            <View style={styles.photoActionsRow}>
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.photoGalleryBtn}
              >
                <Ionicons name="images-outline" size={16} color={Palette.pureWhite} />
                <Text style={styles.photoGalleryBtnText}>
                  {isCustomPhoto ? "Replace Photo" : "Select from Gallery"}
                </Text>
              </TouchableOpacity>

              {isCustomPhoto && (
                <TouchableOpacity
                  onPress={onPhotoRemoved}
                  style={styles.photoRemoveBtn}
                >
                  <Ionicons name="trash-outline" size={14} color="#9E2A2B" />
                  <Text style={styles.photoRemoveBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.panelTitle, { marginTop: 12 }]}>
              OR SWITCH TO CURATED PORTRAITS:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {[
                {
                  id: "p1",
                  name: "Teacher",
                  uri: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80",
                },
                {
                  id: "p2",
                  name: "Leader",
                  uri: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
                },
                {
                  id: "p3",
                  name: "Parent",
                  uri: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&auto=format&fit=crop&q=80",
                },
                {
                  id: "p4",
                  name: "Coach",
                  uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => onPhotoSelected(item.uri, false)}
                  style={[
                    styles.thumbPresetCard,
                    currentPhotoUri === item.uri && styles.thumbPresetActive,
                  ]}
                >
                  <Image source={{ uri: item.uri }} style={styles.thumbPresetImg} />
                  <Text style={styles.thumbPresetLabel}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(177, 167, 166, 0.2)",
    backgroundColor: Palette.surfaceCard,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 12,
  },
  tabButtonActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: Palette.oceanTeal,
    backgroundColor: Palette.mintMist,
  },
  tabButtonText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Palette.textSecondary,
  },
  tabButtonTextActive: {
    color: Palette.oceanTeal,
    fontWeight: "800",
  },
  panelContent: {
    padding: 14,
  },
  panelInner: {},
  panelTitle: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  frameChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.iceWhite,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  frameChipActive: {
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
  miniBadge: {
    backgroundColor: "rgba(84, 0, 14, 0.06)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniBadgeActive: {
    backgroundColor: Palette.turquoise,
  },
  miniBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  miniBadgeTextActive: {
    color: Palette.pureWhite,
  },

  // Text panel
  textControlTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  alignToggle: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: Palette.mintMist,
    borderRadius: 8,
    padding: 2,
  },
  alignBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alignBtnActive: {
    backgroundColor: Palette.oceanTeal,
  },
  typoChip: {
    backgroundColor: Palette.iceWhite,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  typoChipActive: {
    backgroundColor: Palette.mintMist,
    borderColor: Palette.turquoise,
  },
  typoName: {
    fontSize: 11.5,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  typoNameActive: {
    color: Palette.oceanTeal,
    fontWeight: "800",
  },
  quotesScrollRow: {
    gap: 8,
  },
  quoteChip: {
    width: 200,
    backgroundColor: Palette.iceWhite,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  quoteChipActive: {
    backgroundColor: Palette.mintMist,
    borderColor: Palette.turquoise,
  },
  quoteChipText: {
    fontSize: 11,
    fontStyle: "italic",
    color: Palette.textSecondary,
    lineHeight: 15,
  },
  quoteChipTextActive: {
    color: Palette.oceanTeal,
    fontWeight: "700",
  },
  customQuoteRow: {
    marginTop: 10,
  },
  customQuoteInput: {
    backgroundColor: Palette.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: Palette.deepTeal,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },

  // Decorations panel
  decorationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  decoButton: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.iceWhite,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  decoButtonActive: {
    backgroundColor: Palette.mintMist,
    borderColor: Palette.turquoise,
  },
  decoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(84, 0, 14, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  decoIconWrapActive: {
    backgroundColor: Palette.oceanTeal,
  },
  decoName: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  decoNameActive: {
    color: Palette.oceanTeal,
    fontWeight: "800",
  },

  // Photos panel
  photoActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  photoGalleryBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Palette.oceanTeal,
    paddingVertical: 10,
    borderRadius: 12,
  },
  photoGalleryBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
  photoRemoveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: Palette.surfaceElevated,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  photoRemoveBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#9E2A2B",
  },
  thumbPresetCard: {
    alignItems: "center",
    padding: 3,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  thumbPresetActive: {
    borderColor: Palette.turquoise,
    backgroundColor: Palette.mintMist,
  },
  thumbPresetImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  thumbPresetLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Palette.textSecondary,
    marginTop: 2,
  },
});
