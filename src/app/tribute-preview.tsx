import React, { useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Design System
import { Palette } from "@/constants/theme";

// Components
import { TributeCanvas } from "@/components/TributeStudio";
import BottomNavigation from "@/components/home/BottomNavigation";

// Types & Services
import { TributeDesignState } from "@/types/create";
import { tributeDraftService } from "@/services/tributeDraftService";
import { DEFAULT_SAMPLE_PORTRAIT } from "@/data/tributeDetailsData";

export default function TributePreviewScreen() {
  // Retrieve the appreciation-card design created in the studio
  const loadedDesign = tributeDraftService.getDesignState();

  // Fallback state if accessed directly
  const design: TributeDesignState = useMemo(() => {
    if (loadedDesign) return loadedDesign;

    return {
      id: "tribute-sample-preview",
      mentorName: "Dr. Evelyn Reed",
      relationship: "Teacher",
      photoUri: DEFAULT_SAMPLE_PORTRAIT,
      isCustomPhoto: false,
      story:
        "When I was ready to give up on mathematics, you saw something in me that I couldn't see in myself. You stayed after school every Thursday for ten months until I found my confidence.",
      quote: "Thank you for believing in me before I believed in myself.",
      customTitle: "With Deepest Appreciation",
      templateId: "editorial",
      frameStyle: "clean",
      typographyStyle: "serif",
      textAlign: "left",
      decorations: ["wax-seal", "sparkle-star"],
      createdAt: "2026-10-21",
    };
  }, [loadedDesign]);

  // Full Screen State
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Entrance animations
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.97), []);
  const toastFade = useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.delay(2600),
      Animated.timing(toastFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => setToastMessage(null));
  };

  // Primary Action: Save Keepsake
  const handleSaveKeepsake = async () => {
    if (isSaving || isSaved) return;
    setIsSaving(true);
    try {
      await tributeDraftService.saveCompletedTribute(design);
      setIsSaved(true);
      showToast("Appreciation card saved to your collection!");
      Alert.alert(
        "Appreciation Saved",
        `Your card for ${design.mentorName} is now safely preserved in your personal collection.`,
        [{ text: "Cherish It", style: "default" }]
      );
    } catch (error) {
      console.error("Unable to save appreciation card:", error);
      Alert.alert("Could not save card", "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Secondary Action: Share Appreciation Card
  const handleShareTribute = async () => {
    try {
      const shareContent = {
        title: design.customTitle || `In Honour of ${design.mentorName}`,
        message: `${design.customTitle || "With Deepest Appreciation"}\n\n${design.story}\n\n“${design.quote}”\n\nFor my ${design.relationship}, ${design.mentorName}.\n\nCreated with Honour Your Mentor.`,
      };
      await Share.share(shareContent);
    } catch {
      Alert.alert("Share", "Unable to share the appreciation card at this moment.");
    }
  };

  // Secondary Action: Edit Appreciation Card
  const handleEditTribute = () => {
    // Return to design studio with all properties preserved
    router.back();
  };

  // Next Step: Add to Memory Wall
  const handleAddToMemoryWall = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (!isSaved) {
        await tributeDraftService.saveCompletedTribute(design);
        setIsSaved(true);
      }
      showToast("Added to Memory Wall!");
      Alert.alert(
        "Memory Wall",
        `Your appreciation card for ${design.mentorName} has been added to your Memory Wall.`,
        [
          {
            text: "View Memory Wall",
            onPress: () => {
              router.push("/memory-wall");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Unable to add tribute to the Memory Wall:", error);
      Alert.alert("Could not save appreciation card", "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />

      {/* Main Preview Container */}
      <View style={styles.mainContainer}>
        {/* Compact Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleEditTribute}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back to edit appreciation card"
          >
            <Ionicons name="chevron-back" size={20} color={Palette.deepTeal} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Appreciation Card</Text>
            <Text style={styles.headerSubtitle}>A memory worth keeping.</Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsFullScreen(true)}
            activeOpacity={0.75}
            style={styles.fullScreenHeaderBtn}
            accessibilityRole="button"
            accessibilityLabel="Full screen preview"
          >
            <Ionicons name="expand-outline" size={18} color={Palette.deepTeal} />
          </TouchableOpacity>
        </View>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <Animated.View style={[styles.toastBanner, { opacity: toastFade }]}>
            <Ionicons
              name="checkmark-circle"
              size={15}
              color={Palette.pureWhite}
            />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ======================================================== */}
          {/* 1. THE FINISHED TRIBUTE AS HERO                          */}
          {/* ======================================================== */}
          <Animated.View
            style={[
              styles.heroCanvasWrapper,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {/* Museum Matte Presentation Frame */}
            <TouchableOpacity
              activeOpacity={0.96}
              onPress={() => setIsFullScreen(true)}
              style={styles.matteCard}
              accessibilityRole="button"
              accessibilityLabel="Tap to view appreciation card full screen"
            >
              <TributeCanvas design={design} />

              {/* Discreet Expand Indicator */}
              <View style={styles.tapExpandPill}>
                <Ionicons name="expand" size={11} color={Palette.deepTeal} />
                <Text style={styles.tapExpandText}>Tap for full screen</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* ======================================================== */}
          {/* 2. RESTRAINED METADATA DETAILS                           */}
          {/* ======================================================== */}
          <View style={styles.metaCard}>
            <View style={styles.metaTopRow}>
              <View>
                <Text style={styles.metaName}>{design.mentorName}</Text>
                <Text style={styles.metaRole}>
                  Honoured as {design.relationship}
                </Text>
              </View>
              <View style={styles.verifiedSeal}>
                <Ionicons name="shield-checkmark" size={13} color={Palette.turquoise} />
                <Text style={styles.verifiedSealText}>KEEPSAKE</Text>
              </View>
            </View>

            <Text style={styles.metaStoryExcerpt} numberOfLines={2}>
              {design.story}
            </Text>
          </View>

          {/* ======================================================== */}
          {/* 3. CAREFULLY STRUCTURED ACTION HIERARCHY                 */}
          {/* ======================================================== */}
          <View style={styles.actionsSection}>
            {/* Primary Action — Save Keepsake */}
            <TouchableOpacity
              onPress={handleSaveKeepsake}
              disabled={isSaving}
              activeOpacity={0.85}
              style={[
                styles.primarySaveBtn,
                isSaved && styles.primarySaveBtnSaved,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Save keepsake to collection"
            >
              <Ionicons
                name={isSaved ? "checkmark-circle" : "bookmark"}
                size={18}
                color={Palette.pureWhite}
              />
              <Text style={styles.primarySaveBtnText}>
                {isSaved ? "Saved to Keepsakes" : "Save Card"}
              </Text>
            </TouchableOpacity>

            {/* Secondary Actions: Share & Edit */}
            <View style={styles.secondaryActionsRow}>
              <TouchableOpacity
                onPress={handleShareTribute}
                activeOpacity={0.8}
                style={styles.secondaryActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Share your appreciation card"
              >
                <Ionicons
                  name="share-social-outline"
                  size={16}
                  color={Palette.deepTeal}
                />
                <Text style={styles.secondaryActionBtnText}>Share Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEditTribute}
                activeOpacity={0.8}
                style={styles.secondaryActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Edit appreciation card"
              >
                <Ionicons
                  name="color-wand-outline"
                  size={16}
                  color={Palette.deepTeal}
                />
                <Text style={styles.secondaryActionBtnText}>Edit Card</Text>
              </TouchableOpacity>
            </View>

            {/* Next Step Action — Add to Memory Wall */}
            <TouchableOpacity
              onPress={handleAddToMemoryWall}
              disabled={isSaving}
              activeOpacity={0.8}
              style={styles.memoryWallBtn}
              accessibilityRole="button"
              accessibilityLabel="Add to Living Memory Wall"
            >
              <View style={styles.memoryWallIconCircle}>
                <Ionicons name="sparkles" size={13} color={Palette.oceanTeal} />
              </View>
              <View style={styles.memoryWallTextCol}>
                <Text style={styles.memoryWallTitle}>Add to Memory Wall</Text>
                <Text style={styles.memoryWallSubtitle}>
                  Display on your living wall of gratitude
                </Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={15}
                color={Palette.deepTeal}
              />
            </TouchableOpacity>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </View>

      {/* ======================================================== */}
      {/* 4. DEDICATED FULL-SCREEN IMMERSIVE PREVIEW MODAL         */}
      {/* ======================================================== */}
      <Modal
        visible={isFullScreen}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setIsFullScreen(false)}
      >
        <SafeAreaView style={styles.fullScreenContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#1A0005" />

          {/* Full Screen Top Bar */}
          <View style={styles.fullScreenTopBar}>
            <View style={styles.fullScreenPill}>
              <Ionicons name="sparkles" size={12} color={Palette.turquoise} />
              <Text style={styles.fullScreenPillText}>FULL SCREEN KEEPSAKE</Text>
            </View>

            <TouchableOpacity
              onPress={() => setIsFullScreen(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeFullScreenBtn}
              accessibilityRole="button"
              accessibilityLabel="Exit full screen preview"
            >
              <Ionicons name="close" size={20} color={Palette.pureWhite} />
            </TouchableOpacity>
          </View>

          {/* Centered Large Keepsake */}
          <View style={styles.fullScreenCanvasWrap}>
            <TributeCanvas design={design} isFullScreen={true} />
          </View>

          {/* Full Screen Bottom Actions */}
          <View style={styles.fullScreenBottomBar}>
            <TouchableOpacity
              onPress={handleShareTribute}
              style={styles.fullScreenShareBtn}
            >
              <Ionicons name="share-outline" size={16} color={Palette.pureWhite} />
              <Text style={styles.fullScreenShareText}>Share Keepsake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsFullScreen(false)}
              style={styles.fullScreenDoneBtn}
            >
              <Text style={styles.fullScreenDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Floating Bottom Navigation Bar (Active: Create) */}
      <BottomNavigation activeTab="create" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.pureWhite,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
  },
  headerTitleWrap: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontStyle: "italic",
    marginTop: 1,
  },
  fullScreenHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.pureWhite,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  toastBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.2)",
  },
  toastText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.pureWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },

  // Hero Presentation
  heroCanvasWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  matteCard: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 26,
    padding: 8,
    borderWidth: 1.5,
    borderColor: "rgba(236, 143, 62, 0.35)",
    boxShadow: "0px 8px 18px rgba(0, 0, 0, 0.16)",
    position: "relative",
  },
  tapExpandPill: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 248, 240, 0.94)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.3)",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  tapExpandText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: Palette.deepTeal,
  },

  // Restrained Metadata Card
  metaCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFDF9",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    marginBottom: 18,
  },
  metaTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metaName: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  metaRole: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  verifiedSeal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.25)",
  },
  verifiedSealText: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 0.8,
  },
  metaStoryExcerpt: {
    fontSize: 12,
    color: Palette.textSecondary,
    lineHeight: 17,
    fontStyle: "italic",
  },

  // Actions
  actionsSection: {
    paddingHorizontal: 20,
    gap: 10,
  },
  primarySaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal,
    paddingVertical: 14,
    borderRadius: 18,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.35)",
  },
  primarySaveBtnSaved: {
    backgroundColor: "#2E7D32",
    borderColor: "rgba(46, 125, 50, 0.4)",
  },
  primarySaveBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryActionBtn: {
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
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  memoryWallBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.3)",
    gap: 12,
  },
  memoryWallIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(236, 143, 62, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  memoryWallTextCol: {
    flex: 1,
  },
  memoryWallTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  memoryWallSubtitle: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 1,
  },

  // Full Screen Modal
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#1A0005",
    justifyContent: "space-between",
  },
  fullScreenTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  fullScreenPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 248, 240, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  fullScreenPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.pureWhite,
    letterSpacing: 1,
  },
  closeFullScreenBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreenCanvasWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  fullScreenBottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
  fullScreenShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  fullScreenShareText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Palette.pureWhite,
  },
  fullScreenDoneBtn: {
    backgroundColor: Palette.turquoise,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
  },
  fullScreenDoneText: {
    fontSize: 13,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
});
