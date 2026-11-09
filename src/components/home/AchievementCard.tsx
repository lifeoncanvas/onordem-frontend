import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";

export type AchievementCardVariant =
  | "cinematic"
  | "editorial"
  | "luxe"
  | "polaroid"
  | "showcase";

export interface AchievementData {
  id: string;
  badgeType: "graduation" | "award" | "job" | "certificate" | "competition";
  title: string;
  mentorName: string;
  mentorAvatar?: string;
  mentorRole?: string;
  date: string;
  story: string;
  image: string;
  location?: string;
  category?: string;
  highlightStat?: string;
  variant?: AchievementCardVariant;
}

interface AchievementCardProps {
  achievement: AchievementData;
  index?: number;
  onPress?: () => void;
}

export default function AchievementCard({
  achievement,
  index = 0,
  onPress,
}: AchievementCardProps) {
  // Determine variant: use achievement.variant or cycle through variants based on index
  const variants: AchievementCardVariant[] = [
    "cinematic",
    "editorial",
    "luxe",
    "polaroid",
    "showcase",
  ];
  const activeVariant: AchievementCardVariant =
    achievement.variant || variants[index % variants.length];

  const getBadgeMeta = () => {
    switch (achievement.badgeType) {
      case "graduation":
        return {
          icon: "school" as const,
          label: "Graduation",
          color: Palette.turquoise,
        };
      case "award":
        return {
          icon: "trophy" as const,
          label: "Honor Award",
          color: Palette.turquoise,
        };
      case "job":
        return {
          icon: "briefcase" as const,
          label: "Career Start",
          color: Palette.turquoise,
        };
      case "certificate":
        return {
          icon: "ribbon" as const,
          label: "Certification",
          color: Palette.turquoise,
        };
      case "competition":
        return {
          icon: "medal" as const,
          label: "Victory",
          color: Palette.turquoise,
        };
      default:
        return {
          icon: "star" as const,
          label: "Milestone",
          color: Palette.turquoise,
        };
    }
  };

  const meta = getBadgeMeta();

  // =========================================================================
  // 1. VARIANT: CINEMATIC (Streaming / Netflix backdrop style)
  // =========================================================================
  if (activeVariant === "cinematic") {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.cinematicContainer}
      >
        <Image
          source={{ uri: achievement.image }}
          style={styles.cinematicImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            "rgba(0, 0, 0, 0.2)",
            "rgba(0, 0, 0, 0.7)",
            "#000000",
          ]}
          locations={[0, 0.5, 1]}
          style={styles.cinematicGradient}
        />

        {/* Top Badges */}
        <View style={styles.cinematicTopRow}>
          <View style={styles.cinematicBadgePill}>
            <Ionicons name={meta.icon} size={12} color="#FFFFFF" />
            <Text style={styles.cinematicBadgeText}>{meta.label}</Text>
          </View>
          <View style={styles.cinematicDatePill}>
            <Text style={styles.cinematicDateText}>{achievement.date}</Text>
          </View>
        </View>

        {/* Bottom Content */}
        <View style={styles.cinematicBottomContent}>
          <Text style={styles.cinematicTitle} numberOfLines={1}>
            {achievement.title}
          </Text>
          <Text style={styles.cinematicDedicated} numberOfLines={1}>
            Dedicated to:{" "}
            <Text style={styles.cinematicMentorName}>{achievement.mentorName}</Text>
          </Text>
          <Text style={styles.cinematicStory} numberOfLines={2}>
            &ldquo;{achievement.story}&rdquo;
          </Text>

          {/* Accent progress line (streaming aesthetic) */}
          <View style={styles.cinematicAccentBar}>
            <View style={styles.cinematicAccentFilled} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // =========================================================================
  // 2. VARIANT: EDITORIAL (Curved photo header + clean cream/white paper)
  // =========================================================================
  if (activeVariant === "editorial") {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.editorialContainer}
      >
        <View style={styles.editorialImageWrap}>
          <Image
            source={{ uri: achievement.image }}
            style={styles.editorialImage}
            resizeMode="cover"
          />
          <View style={styles.editorialTagOverlay}>
            <Ionicons name={meta.icon} size={11} color={Palette.textOnAmber} />
            <Text style={styles.editorialTagText}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.editorialBody}>
          <Text style={styles.editorialDate}>{achievement.date}</Text>
          <Text style={styles.editorialTitle} numberOfLines={1}>
            {achievement.title}
          </Text>

          <View style={styles.editorialDedicatedRow}>
            {achievement.mentorAvatar ? (
              <Image
                source={{ uri: achievement.mentorAvatar }}
                style={styles.editorialMiniAvatar}
              />
            ) : (
              <View style={styles.editorialAvatarPlaceholder}>
                <Ionicons name="person" size={10} color={Palette.oceanTeal} />
              </View>
            )}
            <Text style={styles.editorialDedicatedText} numberOfLines={1}>
              For <Text style={styles.editorialMentorBold}>{achievement.mentorName}</Text>
            </Text>
          </View>

          <Text style={styles.editorialStory} numberOfLines={2}>
            &ldquo;{achievement.story}&rdquo;
          </Text>

          <View style={styles.editorialFooter}>
            <View style={styles.editorialHighlightPill}>
              <Ionicons name="sparkles" size={10} color={Palette.turquoise} />
              <Text style={styles.editorialHighlightText}>
                {achievement.highlightStat || "Honored"}
              </Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={18} color={Palette.oceanTeal} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // =========================================================================
  // 3. VARIANT: LUXE (Deep Crimson royal background + gold foil frame)
  // =========================================================================
  if (activeVariant === "luxe") {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.luxeContainer}
      >
        <LinearGradient
          colors={["#111111", "#171717", "#202020"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.luxeGradient}
        >
          <View style={styles.luxeTopRow}>
            <View style={styles.luxeBadge}>
              <Ionicons name={meta.icon} size={13} color={Palette.turquoise} />
              <Text style={styles.luxeBadgeText}>Royal Milestone</Text>
            </View>
            <Text style={styles.luxeDate}>{achievement.date}</Text>
          </View>

          <View style={styles.luxeImageFrame}>
            <Image
              source={{ uri: achievement.image }}
              style={styles.luxeImage}
              resizeMode="cover"
            />
            <View style={styles.luxeWaxSeal}>
              <Ionicons name="ribbon" size={14} color="#111111" />
            </View>
          </View>

          <Text style={styles.luxeTitle} numberOfLines={1}>
            {achievement.title}
          </Text>

          <Text style={styles.luxeDedicated} numberOfLines={1}>
            Dedicated to:{" "}
            <Text style={styles.luxeMentorName}>{achievement.mentorName}</Text>
          </Text>

          <Text style={styles.luxeStory} numberOfLines={2}>
            &ldquo;{achievement.story}&rdquo;
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // =========================================================================
  // 4. VARIANT: POLAROID (Scrapbook keepsake photo frame)
  // =========================================================================
  if (activeVariant === "polaroid") {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.polaroidContainer}
      >
        {/* Decorative Tape / Pin */}
        <View style={styles.polaroidTape} />

        <View style={styles.polaroidPhotoFrame}>
          <Image
            source={{ uri: achievement.image }}
            style={styles.polaroidImage}
            resizeMode="cover"
          />
          <View style={styles.polaroidDateStamp}>
            <Text style={styles.polaroidDateText}>{achievement.date}</Text>
          </View>
        </View>

        <View style={styles.polaroidBody}>
          <Text style={styles.polaroidTitle} numberOfLines={1}>
            {achievement.title}
          </Text>
          <Text style={styles.polaroidDedicated} numberOfLines={1}>
            Guided by <Text style={styles.polaroidMentorName}>{achievement.mentorName}</Text>
          </Text>
          <Text style={styles.polaroidStory} numberOfLines={2}>
            &ldquo;{achievement.story}&rdquo;
          </Text>
          <View style={styles.polaroidFooter}>
            <View style={styles.polaroidBadgePill}>
              <Ionicons name={meta.icon} size={11} color={Palette.oceanTeal} />
              <Text style={styles.polaroidBadgeText}>{meta.label}</Text>
            </View>
            <Ionicons name="sparkles" size={16} color={Palette.turquoise} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // =========================================================================
  // 5. VARIANT: SHOWCASE (Side banner layout / high contrast badge)
  // =========================================================================
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.showcaseContainer}
    >
      <View style={styles.showcaseImageWrap}>
        <Image
          source={{ uri: achievement.image }}
          style={styles.showcaseImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0, 0, 0, 0.8)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.showcaseCategoryPill}>
          <Text style={styles.showcaseCategoryText}>{achievement.category || "Honor"}</Text>
        </View>
      </View>

      <View style={styles.showcaseBody}>
        <View style={styles.showcaseTopRow}>
          <View style={styles.showcaseIconWrap}>
            <Ionicons name={meta.icon} size={13} color={Palette.oceanTeal} />
          </View>
          <Text style={styles.showcaseDate}>{achievement.date}</Text>
        </View>

        <Text style={styles.showcaseTitle} numberOfLines={1}>
          {achievement.title}
        </Text>

        <Text style={styles.showcaseDedicated} numberOfLines={1}>
          Mentor: <Text style={styles.showcaseMentorName}>{achievement.mentorName}</Text>
        </Text>

        <Text style={styles.showcaseStory} numberOfLines={2}>
          &ldquo;{achievement.story}&rdquo;
        </Text>

        <View style={styles.showcaseFooter}>
          <Text style={styles.showcaseTapLabel}>Tap to view milestone</Text>
          <Ionicons name="chevron-forward" size={14} color={Palette.turquoise} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // =========================================================================
  // 1. Cinematic Variant Styles
  // =========================================================================
  cinematicContainer: {
    width: 275,
    height: 250,
    borderRadius: 22,
    marginRight: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Palette.deepTeal,
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.16)",
  },
  cinematicImage: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  cinematicGradient: {
    ...StyleSheet.absoluteFill,
  },
  cinematicTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    zIndex: 2,
  },
  cinematicBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 184, 153, 0.9)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cinematicBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cinematicDatePill: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cinematicDateText: {
    fontSize: 10.5,
    color: Palette.iceWhite,
    fontWeight: "600",
  },
  cinematicBottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    zIndex: 2,
  },
  cinematicTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
    marginBottom: 2,
    fontFamily: AppFonts.displaySans,
  },
  cinematicDedicated: {
    fontSize: 11.5,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 5,
  },
  cinematicMentorName: {
    color: Palette.turquoise, // Golden Amber
    fontWeight: "800",
  },
  cinematicStory: {
    fontSize: 12,
    lineHeight: 16.5,
    color: "rgba(255, 255, 255, 0.9)",
    fontStyle: "italic",
    marginBottom: 10,
    fontFamily: AppFonts.displaySerif,
  },
  cinematicAccentBar: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 2,
    overflow: "hidden",
  },
  cinematicAccentFilled: {
    width: "75%",
    height: "100%",
    backgroundColor: Palette.turquoise, // Golden Amber progress bar
  },

  // =========================================================================
  // 2. Editorial Variant Styles
  // =========================================================================
  editorialContainer: {
    width: 255,
    borderRadius: 20,
    marginRight: 16,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    overflow: "hidden",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
  },
  editorialImageWrap: {
    height: 115,
    position: "relative",
    backgroundColor: Palette.mintMist,
  },
  editorialImage: {
    width: "100%",
    height: "100%",
  },
  editorialTagOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.accentAmber,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  editorialTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.textOnAmber,
  },
  editorialBody: {
    padding: 14,
  },
  editorialDate: {
    fontSize: 10.5,
    color: Palette.textMuted,
    fontWeight: "600",
    marginBottom: 2,
  },
  editorialTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.2,
    marginBottom: 6,
    fontFamily: AppFonts.displaySans,
  },
  editorialDedicatedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  editorialMiniAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Palette.turquoise,
  },
  editorialAvatarPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
  },
  editorialDedicatedText: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    flex: 1,
  },
  editorialMentorBold: {
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  editorialStory: {
    fontSize: 12,
    lineHeight: 17,
    color: Palette.deepTeal,
    fontStyle: "italic",
    opacity: 0.88,
    marginBottom: 10,
  },
  editorialFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 8,
  },
  editorialHighlightPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  editorialHighlightText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },

  // =========================================================================
  // 3. Luxe Variant Styles
  // =========================================================================
  luxeContainer: {
    width: 260,
    borderRadius: 22,
    marginRight: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255, 240, 154, 0.45)",
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.18)",
  },
  luxeGradient: {
    padding: 14,
  },
  luxeTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  luxeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 240, 154, 0.16)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  luxeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.turquoise,
    textTransform: "uppercase",
  },
  luxeDate: {
    fontSize: 10.5,
    color: Palette.textSecondary,
    opacity: 0.85,
  },
  luxeImageFrame: {
    height: 105,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 240, 154, 0.3)",
    marginBottom: 10,
  },
  luxeImage: {
    width: "100%",
    height: "100%",
  },
  luxeWaxSeal: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.turquoise,
    justifyContent: "center",
    alignItems: "center",
  },
  luxeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  luxeDedicated: {
    fontSize: 11.5,
    color: Palette.mintMist,
    marginBottom: 6,
  },
  luxeMentorName: {
    color: Palette.turquoise,
    fontWeight: "800",
  },
  luxeStory: {
    fontSize: 12,
    lineHeight: 17,
    color: "rgba(255, 255, 255, 0.9)",
    fontStyle: "italic",
  },

  // =========================================================================
  // 4. Polaroid Variant Styles
  // =========================================================================
  polaroidContainer: {
    width: 250,
    borderRadius: 18,
    marginRight: 16,
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1.2,
    borderColor: "rgba(177, 167, 166, 0.4)",
    padding: 12,
    paddingTop: 14,
    position: "relative",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  },
  polaroidTape: {
    position: "absolute",
    top: -6,
    alignSelf: "center",
    width: 44,
    height: 12,
    backgroundColor: "rgba(255, 184, 153, 0.4)",
    borderRadius: 2,
    zIndex: 3,
  },
  polaroidPhotoFrame: {
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Palette.pureWhite,
    borderWidth: 1,
    borderColor: "rgba(177, 167, 166, 0.2)",
    marginBottom: 10,
  },
  polaroidImage: {
    width: "100%",
    height: "100%",
  },
  polaroidDateStamp: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  polaroidDateText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  polaroidBody: {
    paddingHorizontal: 2,
  },
  polaroidTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  polaroidDedicated: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  polaroidMentorName: {
    color: Palette.oceanTeal,
    fontWeight: "800",
  },
  polaroidStory: {
    fontSize: 12,
    lineHeight: 17,
    color: Palette.deepTeal,
    fontStyle: "italic",
    opacity: 0.9,
    marginBottom: 8,
  },
  polaroidFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  polaroidBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  polaroidBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },

  // =========================================================================
  // 5. Showcase Variant Styles
  // =========================================================================
  showcaseContainer: {
    width: 255,
    borderRadius: 20,
    marginRight: 16,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    overflow: "hidden",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
  },
  showcaseImageWrap: {
    height: 110,
    position: "relative",
  },
  showcaseImage: {
    width: "100%",
    height: "100%",
  },
  showcaseCategoryPill: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Palette.accentAmber,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  showcaseCategoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.textOnAmber,
    textTransform: "uppercase",
  },
  showcaseBody: {
    padding: 14,
  },
  showcaseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  showcaseIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
  },
  showcaseDate: {
    fontSize: 10.5,
    color: Palette.textMuted,
    fontWeight: "600",
  },
  showcaseTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  showcaseDedicated: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  showcaseMentorName: {
    color: Palette.turquoise,
    fontWeight: "800",
  },
  showcaseStory: {
    fontSize: 12,
    lineHeight: 17,
    color: Palette.deepTeal,
    fontStyle: "italic",
    opacity: 0.88,
    marginBottom: 10,
  },
  showcaseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 8,
  },
  showcaseTapLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },
});
