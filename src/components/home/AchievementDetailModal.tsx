import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";
import type { AchievementData } from "./AchievementCard";

interface AchievementDetailModalProps {
  visible: boolean;
  achievement: AchievementData | null;
  onClose: () => void;
  onViewMentor?: (mentorName: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function AchievementDetailModal({
  visible,
  achievement,
  onClose,
  onViewMentor,
}: AchievementDetailModalProps) {
  const [celebrated, setCelebrated] = useState(false);
  const [reaction, setReaction] = useState<"celebrate" | "inspire" | "gratitude">("celebrate");

  if (!achievement) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        title: achievement.title,
        message: `Honoring my milestone: "${achievement.title}" dedicated to ${achievement.mentorName}. "${achievement.story}"`,
      });
    } catch {
      // ignore
    }
  };

  const handleCelebrate = () => {
    setCelebrated(!celebrated);
    Alert.alert(
      celebrated ? "Celebration noted" : "Celebrated! 🎉",
      celebrated
        ? "Milestone marked."
        : `You celebrated this milestone dedicated to ${achievement.mentorName}!`
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCardContainer}>
          {/* Hero Image Header */}
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: achievement.image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Subtle dark overlay preserves image colour while keeping text readable. */}
            <LinearGradient
              colors={[
                "rgba(0, 0, 0, 0.08)",
                "rgba(0, 0, 0, 0.58)",
                "#000000",
              ]}
              locations={[0.1, 0.65, 1.0]}
              style={styles.heroGradient}
            />

            {/* Top Navigation Bar */}
            <View style={styles.topNavBar}>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                style={styles.circleButton}
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.8}
                style={styles.circleButton}
                accessibilityLabel="Share milestone"
              >
                <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Floating Hero Info */}
            <View style={styles.heroInfoContent}>
              <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                  <Ionicons name="trophy" size={12} color={Palette.turquoise} />
                  <Text style={styles.categoryBadgeText}>
                    {achievement.category || "Milestone"}
                  </Text>
                </View>
                <Text style={styles.dateBadgeText}>{achievement.date}</Text>
              </View>

              <Text style={styles.heroTitle}>{achievement.title}</Text>

              {achievement.location ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-sharp" size={13} color={Palette.turquoise} />
                  <Text style={styles.locationText}>{achievement.location}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Interactive Action Chips (Going / Not Going style from reference) */}
          <View style={styles.chipsSection}>
            <View style={styles.chipsContainer}>
              <TouchableOpacity
                onPress={() => {
                  setReaction("celebrate");
                  handleCelebrate();
                }}
                activeOpacity={0.85}
                style={[
                  styles.chipItem,
                  reaction === "celebrate" && styles.chipItemActive,
                ]}
              >
                <Ionicons
                  name={celebrated ? "checkmark-circle" : "sparkles"}
                  size={15}
                  color={reaction === "celebrate" ? Palette.oceanTeal : Palette.textMuted}
                />
                <Text
                  style={[
                    styles.chipText,
                    reaction === "celebrate" && styles.chipTextActive,
                  ]}
                >
                  {celebrated ? "Celebrated" : "Celebrate"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setReaction("inspire")}
                activeOpacity={0.85}
                style={[
                  styles.chipItem,
                  reaction === "inspire" && styles.chipItemActive,
                ]}
              >
                <Ionicons
                  name="heart"
                  size={15}
                  color={reaction === "inspire" ? Palette.oceanTeal : Palette.textMuted}
                />
                <Text
                  style={[
                    styles.chipText,
                    reaction === "inspire" && styles.chipTextActive,
                  ]}
                >
                  Inspiring
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setReaction("gratitude")}
                activeOpacity={0.85}
                style={[
                  styles.chipItem,
                  reaction === "gratitude" && styles.chipItemActive,
                ]}
              >
                <Ionicons
                  name="bookmark"
                  size={15}
                  color={reaction === "gratitude" ? Palette.oceanTeal : Palette.textMuted}
                />
                <Text
                  style={[
                    styles.chipText,
                    reaction === "gratitude" && styles.chipTextActive,
                  ]}
                >
                  Saved
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Content Body */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Dedicated Mentor Card (Host section from reference) */}
            <TouchableOpacity
              onPress={() => onViewMentor?.(achievement.mentorName)}
              activeOpacity={0.85}
              style={styles.mentorDedicatedCard}
            >
              <View style={styles.mentorAvatarWrap}>
                {achievement.mentorAvatar ? (
                  <Image
                    source={{ uri: achievement.mentorAvatar }}
                    style={styles.mentorAvatar}
                  />
                ) : (
                  <View style={styles.mentorAvatarPlaceholder}>
                    <Ionicons name="person" size={20} color={Palette.oceanTeal} />
                  </View>
                )}
                <View style={styles.mentorActiveDot} />
              </View>

              <View style={styles.mentorInfoTextWrap}>
                <Text style={styles.dedicatedToLabel}>Dedicated to Mentor</Text>
                <Text style={styles.mentorNameText}>{achievement.mentorName}</Text>
                {achievement.mentorRole ? (
                  <Text style={styles.mentorRoleText}>{achievement.mentorRole}</Text>
                ) : null}
              </View>

              <Ionicons
                name="chevron-forward-circle"
                size={24}
                color={Palette.turquoise}
              />
            </TouchableOpacity>

            {/* Story & Dedication Quote */}
            <View style={styles.storyCard}>
              <View style={styles.storyHeaderRow}>
                <Ionicons name="chatbubble-ellipses" size={18} color={Palette.turquoise} />
                <Text style={styles.storyCardTitle}>The Story & Dedication</Text>
              </View>

              <Text style={styles.storyBodyText}>
                &ldquo;{achievement.story}&rdquo;
              </Text>

              {achievement.highlightStat ? (
                <View style={styles.statPill}>
                  <Ionicons name="ribbon" size={14} color={Palette.oceanTeal} />
                  <Text style={styles.statPillText}>
                    {achievement.highlightStat}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Reflection Note */}
            <View style={styles.reflectionCard}>
              <Text style={styles.reflectionTitle}>A Note of Gratitude</Text>
              <Text style={styles.reflectionText}>
                Milestones are never achieved alone. This memory is permanently honored
                in your living gratitude wall for {achievement.mentorName}.
              </Text>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomButtonsRow}>
              <TouchableOpacity
                onPress={() => onViewMentor?.(achievement.mentorName)}
                activeOpacity={0.88}
                style={styles.viewMentorBtn}
              >
                <View style={[styles.btnGradient, styles.primaryButton]}>
                  <Ionicons name="person" size={16} color={Palette.textOnPrimary} />
                  <Text style={styles.btnTextWhite}>View Mentor Profile</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.88}
                style={styles.secondaryActionBtn}
              >
                <Ionicons name="sparkles" size={16} color={Palette.oceanTeal} />
                <Text style={styles.secondaryBtnText}>Share Story</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(26, 0, 5, 0.75)",
    justifyContent: "flex-end",
  },
  modalCardContainer: {
    height: SCREEN_HEIGHT * 0.90,
    backgroundColor: Palette.iceWhite, // Cream White background
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    boxShadow: "0px -4px 16px rgba(0, 0, 0, 0.25)",
  },
  heroContainer: {
    height: 250,
    position: "relative",
    backgroundColor: Palette.deepTeal,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
  },
  topNavBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 20 : 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 248, 240, 0.25)",
  },
  heroInfoContent: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(236, 143, 62, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.5)",
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.turquoise,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateBadgeText: {
    fontSize: 12,
    color: Palette.iceWhite,
    opacity: 0.9,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12.5,
    color: "rgba(255, 248, 240, 0.85)",
  },
  chipsSection: {
    backgroundColor: Palette.iceWhite,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  chipsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(177, 167, 166, 0.18)",
    borderRadius: 22,
    padding: 4,
    justifyContent: "space-between",
  },
  chipItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 18,
  },
  chipItemActive: {
    backgroundColor: Palette.pureWhite,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.12)",
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: Palette.textMuted,
  },
  chipTextActive: {
    color: Palette.deepTeal,
    fontWeight: "800",
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
    gap: 14,
  },
  mentorDedicatedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.pureWhite,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.06)",
  },
  mentorAvatarWrap: {
    position: "relative",
    marginRight: 12,
  },
  mentorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Palette.turquoise,
  },
  mentorAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
  },
  mentorActiveDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Palette.turquoise,
    borderWidth: 2,
    borderColor: Palette.pureWhite,
  },
  mentorInfoTextWrap: {
    flex: 1,
  },
  dedicatedToLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: Palette.turquoise,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  mentorNameText: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginTop: 1,
  },
  mentorRoleText: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  storyCard: {
    backgroundColor: Palette.pureWhite,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
  },
  storyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  storyCardTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  storyBodyText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: Palette.deepTeal,
    fontStyle: "italic",
    opacity: 0.9,
    fontFamily: AppFonts.body,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.mintMist,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 14,
  },
  statPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },
  reflectionCard: {
    backgroundColor: Palette.mintMist,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.25)",
  },
  reflectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Palette.oceanTeal,
    marginBottom: 4,
  },
  reflectionText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Palette.textSecondary,
  },
  bottomButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  viewMentorBtn: {
    flex: 1.4,
    borderRadius: 16,
    overflow: "hidden",
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  primaryButton: {
    backgroundColor: Palette.oceanTeal,
  },
  btnTextWhite: {
    fontSize: 13.5,
    fontWeight: "800",
    color: Palette.textOnPrimary,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Palette.pureWhite,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Palette.oceanTeal,
    paddingVertical: 14,
  },
  secondaryBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: Palette.oceanTeal,
  },
});
