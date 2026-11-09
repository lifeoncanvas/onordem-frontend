import React from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, getCategoryAccent, Palette, SystemColors } from "@/constants/theme";

export interface MentorData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;            // Short inspiring quote
  memoriesCount: number;
  yearsKnown: string;       // e.g. "3 years together"
  isBookmarked?: boolean;
  coverImage?: string;      // Optional separate header image
  trait?: string;           // e.g. "Patient guide"
  traitIcon?: string;       // Ionicons name for trait
  lessonCarried?: string;   // The italic lesson shown on card
  coverColor?: string;      // Optional override
}

interface MentorCardProps {
  mentor: MentorData;
  index?: number;
  cardWidth?: number;
  isSelected?: boolean;
  onPress?: () => void;
  onBookmarkToggle?: (id: string) => void;
}

// Tasteful colourful stacked dots for memory count indicators
const COLORFUL_DOTS = [
  [Palette.accentPink, Palette.accentAmber, Palette.accentSky],
  [Palette.accentSky, Palette.accentLavender, Palette.accentAmber],
  [Palette.accentMint, Palette.accentSky, Palette.accentCoral],
  [Palette.accentAmber, Palette.accentPink, Palette.accentMint],
];

export default function MentorCard({
  mentor,
  index = 0,
  cardWidth = 228,
  isSelected = false,
  onPress,
  onBookmarkToggle,
}: MentorCardProps) {
  // Animated scale for subtle card press feedback
  const scaleAnim = React.useMemo(() => new Animated.Value(1), []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      speed: 30,
      bounciness: 0,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      speed: 25,
      bounciness: 6,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const dots = COLORFUL_DOTS[index % COLORFUL_DOTS.length];

  // Two-letter initials fallback
  const initials = mentor.name
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const lessonText = mentor.lessonCarried || mentor.quote;
  const traitLabel = mentor.trait || "Mentor";
  const traitIconName = (mentor.traitIcon as any) || "sparkles";
  const yearsLabel = mentor.yearsKnown;

  const headerPhotoUri = mentor.coverImage || mentor.avatar;
  const avatarUri = mentor.avatar;

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        {
          width: cardWidth,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        // On web a "button" role renders a <button>, and the bookmark/avatar
        // buttons inside it would then be invalid nested <button>s.
        accessibilityRole={Platform.OS === "web" ? undefined : "button"}
        accessibilityLabel={`Open ${mentor.name}'s mentor profile`}
        style={[
          styles.card,
          isSelected && styles.cardSelected,
        ]}
      >
        {/* ──────────────────────────────────────
            Natural-color photo with a subtle contrast overlay
        ────────────────────────────────────── */}
        <View style={styles.header}>
          {/* Mentor photo */}
          {!!headerPhotoUri && (
            <Image
              source={{ uri: headerPhotoUri }}
              style={styles.headerPhoto}
              resizeMode="cover"
            />
          )}

          {/* Deep charcoal gradient overlay for contrast */}
          <View style={styles.headerOverlay} />

          {/* Subtle decorative circles for depth */}
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />

          {/* "X years together" pill — top right (subtle dark grey layer) */}
          <View style={styles.yearsPill}>
            <View style={styles.yearsDot} />
            <Text style={styles.yearsText}>{yearsLabel}</Text>
          </View>

          {/* Bookmark — top left with vivid colourful active state */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onBookmarkToggle?.(mentor.id);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.bookmarkBtn,
              mentor.isBookmarked && styles.bookmarkBtnActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              mentor.isBookmarked
                ? `Remove bookmark for ${mentor.name}`
                : `Bookmark ${mentor.name}`
            }
          >
            <Ionicons
              name={mentor.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={15}
              color={mentor.isBookmarked ? Palette.accentMint : "rgba(255,255,255,0.75)"}
            />
          </TouchableOpacity>
        </View>

        {/* ──────────────────────────────────────
            AVATAR CIRCLE — overlapping header / body boundary
            Natural-color portrait
        ────────────────────────────────────── */}
        <View style={styles.avatarWrap}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onPress}
            style={[
              styles.avatarRing,
              isSelected && styles.avatarRingSelected,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${mentor.name}'s photograph`}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarInitialsBg}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ──────────────────────────────────────
            BODY — White name, grey role, colourful icon accents
        ────────────────────────────────────── */}
        <View style={styles.body}>
          {/* Name — Bright white elegant italic serif */}
          <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
            <Text style={styles.name} numberOfLines={1}>
              {mentor.name}
            </Text>
          </TouchableOpacity>

          {/* Role — Soft light grey uppercase caption */}
          <Text style={styles.role}>{mentor.role.toUpperCase()}</Text>

          {/* Trait Pill — Subtle dark surface with colourful icon */}
          <View style={styles.traitPill}>
            <Ionicons name={traitIconName} size={13} color={getCategoryAccent(mentor.role)} />
            <Text style={styles.traitText}>{traitLabel}</Text>
          </View>

          {/* Lesson Block — Subtle dark-grey layer with amber quote glyph */}
          <View style={styles.lessonBlock}>
            <View style={styles.lessonHeaderRow}>
              <Text style={styles.quoteGlyph}>{"\u201C"}</Text>
              <Text style={styles.lessonLabel}>THE LESSON I CARRY</Text>
            </View>
            <Text style={styles.lessonText} numberOfLines={3}>
              {lessonText}
            </Text>
          </View>

          {/* Thin divider */}
          <View style={styles.divider} />

          {/* Memory count row with colourful dots & clearly visible count */}
          <View style={styles.memoryRow}>
            <View style={styles.dotsRow}>
              {dots.map((col, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: col,
                      marginLeft: i === 0 ? 0 : -6,
                      zIndex: dots.length - i,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.memoryCount}>
              {mentor.memoriesCount} memories
            </Text>
          </View>

          {/* Action Button — Subtle dark surface with colourful heart icon */}
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={styles.ctaBtn}
          >
            <Ionicons name="heart" size={13} color={Palette.accentPink} />
            <Text style={styles.ctaText}>Send Thanks</Text>
            <Ionicons name="chevron-forward" size={12} color={Palette.accentSky} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const AVATAR_SIZE = 72;
const HEADER_HEIGHT = 112;
const AVATAR_OVERLAP = AVATAR_SIZE / 2;

const styles = StyleSheet.create({
  animatedContainer: {
    marginRight: 14,
  },
  card: {
    backgroundColor: Palette.surfaceCard,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 8px 14px rgba(0, 0, 0, 0.45)",
    overflow: "visible",
  },
  cardSelected: {
    borderColor: Palette.accentSky,
    boxShadow: "0px 8px 10px rgba(0, 0, 0, 0.2)",
  },

  /* ── HEADER ── */
  header: {
    height: HEADER_HEIGHT,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Palette.iceWhite,
  },
  headerPhoto: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  decoCircle1: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    bottom: -25,
    left: -15,
  },
  decoCircle2: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    top: 10,
    right: -10,
  },

  yearsPill: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  yearsDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Palette.accentAmber,
  },
  yearsText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  bookmarkBtn: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  bookmarkBtnActive: {
    borderColor: "rgba(143, 240, 198, 0.5)",
    backgroundColor: "rgba(143, 240, 198, 0.12)",
  },

  /* ── AVATAR ── */
  avatarWrap: {
    alignItems: "center",
    marginTop: -AVATAR_OVERLAP,
    zIndex: 10,
  },
  avatarRing: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    backgroundColor: Palette.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: SystemColors.hairline,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.4)",
  },
  avatarRingSelected: {
    borderColor: Palette.accentSky,
  },
  avatarPhoto: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarInitialsBg: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: SystemColors.tertiarySystemBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: SystemColors.hairline,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: "800",
    color: SystemColors.label,
    letterSpacing: -0.5,
  },

  /* ── BODY ── */
  body: {
    paddingHorizontal: 15,
    paddingBottom: 16,
    paddingTop: 8,
    alignItems: "center",
  },
  name: {
    fontSize: 18.5,
    fontWeight: "800",
    color: SystemColors.label,
    letterSpacing: -0.3,
    textAlign: "center",
    fontFamily: AppFonts.displaySerif,
    fontStyle: "italic",
    marginBottom: 3,
  },
  role: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.textMuted,
    letterSpacing: 1.2,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  traitPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SystemColors.tertiarySystemFill,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: SystemColors.hairline,
  },
  traitText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: SystemColors.label,
  },

  /* Lesson block */
  lessonBlock: {
    width: "100%",
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: SystemColors.hairline,
  },
  lessonHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  quoteGlyph: {
    fontSize: 22,
    lineHeight: 22,
    color: Palette.accentAmber,
    fontWeight: "900",
  },
  lessonLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  lessonText: {
    fontSize: 12,
    lineHeight: 18,
    color: SystemColors.label,
    fontStyle: "italic",
    fontFamily: AppFonts.displaySerif,
  },

  /* Footer */
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: SystemColors.separator,
    marginBottom: 10,
  },
  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    width: "100%",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: SystemColors.systemBackground,
  },
  memoryCount: {
    fontSize: 12,
    fontWeight: "700",
    color: SystemColors.label,
    letterSpacing: 0.2,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: SystemColors.hairline,
  },
  ctaText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: SystemColors.label,
  },
});
