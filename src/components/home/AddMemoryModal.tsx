import React, { useMemo } from "react";
import {
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

// ─── Card data ────────────────────────────────────────────────────────────────

interface StudioCard {
  key: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  cardBg: string;
  iconBg: string;
  /** Accent used for icon, badge text, tagline, and arrow */
  accent: string;
}

const STUDIO_CARDS: StudioCard[] = [
  {
    key: "tribute",
    badge: "Appreciation",
    title: "Appreciation",
    tagline: "Celebrate their impact.",
    description:
      "Create a beautiful recognition card for someone who made a difference.",
    icon: "heart",
    cardBg: Palette.surfaceCard,
    iconBg: "rgba(255, 158, 207, 0.16)",
    accent: Palette.accentPink,
  },
  {
    key: "memory",
    badge: "Journal",
    title: "Write a Memo",
    tagline: "Keep a moment forever.",
    description:
      "Preserve a meaningful moment with your mentor in a personal memory journal.",
    icon: "camera",
    cardBg: Palette.surfaceCard,
    iconBg: "rgba(143, 211, 255, 0.16)",
    accent: Palette.accentSky,
  },
  {
    key: "letter",
    badge: "Personal",
    title: "Open Letter",
    tagline: "Write from the heart.",
    description:
      "Write a personal letter expressing gratitude and appreciation.",
    icon: "mail",
    cardBg: Palette.surfaceCard,
    iconBg: "rgba(255, 184, 153, 0.16)",
    accent: Palette.accentPeach,
  },
  {
    key: "lesson",
    badge: "Stationery",
    title: "Write a Note",
    tagline: "Make it uniquely yours.",
    description:
      "Create a thoughtful note on artistic stationery with expressive details.",
    icon: "color-palette-outline",
    cardBg: Palette.surfaceCard,
    iconBg: "rgba(216, 180, 254, 0.16)",
    accent: Palette.accentLavender,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddMemoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddMemoryModal({
  visible,
  onClose,
  onSelectOption,
}: AddMemoryModalProps) {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(80), []);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 62,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(80);
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleSelect = (card: StudioCard) => {
    onSelectOption(card.key);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableWithoutFeedback>
          <View style={styles.sheet}>
            {/* Drag Handle */}
            <View style={styles.handle} />

            <TouchableOpacity
              onPress={onClose}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={20} color={Palette.textPrimary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={styles.sheetTitle}>
                  What Would You Like to Create?
                </Text>
                <Text style={styles.sheetSubtitle}>
                  Choose a canvas to capture someone meaningful
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={18} color={Palette.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* 2×2 Grid */}
            <ScrollView
              style={styles.gridScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContent}
            >
              {/* Upload photos & videos */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onSelectOption("media");
                  onClose();
                }}
                style={styles.mediaCard}
                accessibilityRole="button"
                accessibilityLabel="Upload photos, videos and audio"
                accessibilityHint="Choose moments from your library or record a voice note"
              >
                <View style={styles.mediaIcons} accessibilityElementsHidden>
                  <View style={[styles.mediaIconTile, { backgroundColor: "#16283D" }]}>
                    <Ionicons name="images" size={17} color={Palette.accentSky} />
                  </View>
                  <View style={[styles.mediaIconTile, styles.mediaIconOverlap, { backgroundColor: "#173434" }]}>
                    <Ionicons name="videocam" size={17} color={Palette.accentMint} />
                  </View>
                  <View style={[styles.mediaIconTile, styles.mediaIconOverlap, { backgroundColor: "#3A2F10" }]}>
                    <Ionicons name="mic" size={17} color={Palette.accentAmber} />
                  </View>
                </View>
                <View style={styles.mediaText}>
                  <Text style={styles.mediaTitle}>Photos, Videos &amp; Audio</Text>
                  <Text style={styles.mediaDesc}>
                    Upload moments from your library, or record a voice note.
                  </Text>
                </View>
                <View style={[styles.arrowCircle, { backgroundColor: "rgba(10, 132, 255, 0.16)" }]}>
                  <Ionicons name="arrow-up" size={15} color={Palette.accentSky} />
                </View>
              </TouchableOpacity>

              <View style={styles.grid}>
                {STUDIO_CARDS.map((card) => (
                  <TouchableOpacity
                    key={card.key}
                    activeOpacity={0.8}
                    onPress={() => handleSelect(card)}
                    style={[styles.card, { backgroundColor: card.cardBg }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Create ${card.title}`}
                  >
                    {/* Top row: icon box + badge pill */}
                    <View style={styles.cardTop}>
                      <View
                        style={[styles.iconBox, { backgroundColor: card.iconBg }]}
                      >
                        <Ionicons
                          name={card.icon}
                          size={22}
                          color={card.accent}
                        />
                      </View>
                      <View style={styles.badgePill}>
                        <Text
                          style={[styles.badgeText, { color: card.accent }]}
                        >
                          {card.badge}
                        </Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.cardTitle}>{card.title}</Text>

                    {/* Tagline */}
                    <Text
                      style={[styles.cardTagline, { color: card.accent }]}
                    >
                      {card.tagline}
                    </Text>

                    {/* Description */}
                    <Text style={styles.cardDesc}>
                      {card.description}
                    </Text>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Footer */}
                    <View style={styles.cardFooter}>
                      <Text
                        style={[styles.craftText, { color: Palette.textPrimary }]}
                      >
                        Craft this
                      </Text>
                      <View
                        style={[
                          styles.arrowCircle,
                          { backgroundColor: card.iconBg },
                        ]}
                      >
                        <Ionicons
                          name="arrow-forward"
                          size={14}
                          color={card.accent}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  sheetWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: Palette.iceWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: "92%",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 14,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.borderSubtle,
    alignSelf: "center",
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  backBtn: {
    position: "absolute",
    top: 10,
    left: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Palette.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  gridContent: {
    paddingBottom: 8,
  },
  gridScroll: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  // ── Photos & Videos card ──────────────────────────────────────────────────
  mediaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  mediaIcons: { flexDirection: "row", alignItems: "center" },
  mediaIconTile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Palette.surfaceCard,
  },
  mediaIconOverlap: { marginLeft: -10 },
  mediaText: { flex: 1 },
  mediaTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.textPrimary,
    letterSpacing: -0.2,
  },
  mediaDesc: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    width: "47.5%",
    borderRadius: 20,
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badgePill: {
    backgroundColor: Palette.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Palette.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardTagline: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    lineHeight: 18,
  },

  divider: {
    height: 1,
    backgroundColor: Palette.borderSubtle,
    marginVertical: 12,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  craftText: {
    fontSize: 14,
    fontWeight: "700",
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});
