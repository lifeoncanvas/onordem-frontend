import React, { useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { CreationOptionItem } from "@/types/create";

interface CreationStudioCardProps {
  item: CreationOptionItem;
  isSelected?: boolean;
  onPress: () => void;
}

export default function CreationStudioCard({
  item,
  isSelected,
  onPress,
}: CreationStudioCardProps) {
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  const liftAnim = useMemo(() => new Animated.Value(0), []);
  const isHovered = useRef(false);
  const isPressed = useRef(false);

  const animateCard = (hovered: boolean, pressed: boolean) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: pressed ? 0.96 : hovered ? 1.025 : 1,
        useNativeDriver: true,
        speed: pressed ? 30 : 20,
        bounciness: pressed ? 3 : 5,
      }),
      Animated.spring(liftAnim, {
        toValue: pressed ? -5 : hovered ? -3 : 0,
        useNativeDriver: true,
        speed: pressed ? 30 : 20,
        bounciness: pressed ? 3 : 5,
      }),
    ]).start();
  };

  const handleHoverIn = () => {
    isHovered.current = true;
    animateCard(true, isPressed.current);
  };

  const handleHoverOut = () => {
    isHovered.current = false;
    animateCard(false, isPressed.current);
  };

  const handlePressIn = () => {
    isPressed.current = true;
    animateCard(isHovered.current, true);
  };

  const handlePressOut = () => {
    isPressed.current = false;
    animateCard(isHovered.current, false);
  };

  const isFeatureCard = item.id === "tribute";
  const isFullWidthCard = isFeatureCard;

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        isFullWidthCard && styles.cardOuterFullWidth,
        { transform: [{ translateY: liftAnim }, { scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        style={({ pressed }) => [
          styles.cardInner,
          getSpecificCardStyle(item.id),
          isFeatureCard && styles.featureCardLayout,
          (isSelected || pressed) && styles.cardActiveState,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}: ${item.subtitle}`}
        accessibilityHint={item.purpose}
      >
        {isFeatureCard ? (
          <View style={styles.tributeContainer}>
            <View style={styles.tributeTopRow}>
              <View style={[styles.iconWrapperLarge, getIconWrapperStyle(item.id)]}>
                <Ionicons name={item.icon} size={24} color={getIconColor(item.id)} />
              </View>
              <View style={styles.tributeHeadingBlock}>
                <Text style={styles.tributeBadgeText}>{item.badgeLabel.toUpperCase()}</Text>
                <Text style={styles.tributeTitle}>{item.title}</Text>
                <Text style={styles.tributeSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <View style={styles.tributeBottomRow}>
              <Text style={styles.tributePurpose}>{item.purpose}</Text>
              <View style={styles.actionArrowCircleLarge}>
                <Ionicons name="arrow-forward" size={16} color="#000000" />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.splitCardContent}>
            <View style={styles.topMetaRow}>
              <View style={[styles.iconWrapper, getIconWrapperStyle(item.id)]}>
                <Ionicons name={item.icon} size={20} color={getIconColor(item.id)} />
              </View>
              <Text style={styles.splitBadgeText}>{item.badgeLabel.toUpperCase()}</Text>
            </View>
            <View style={styles.contentWrap}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={[styles.cardSubtitle, { color: item.accentColor }]}>
                {item.subtitle}
              </Text>
              <Text style={styles.cardPurpose} numberOfLines={3}>
                {item.purpose}
              </Text>
            </View>
            <View style={styles.splitActionRow}>
              <View style={styles.actionArrowCircle}>
                <Ionicons name="arrow-forward" size={13} color="#000000" />
              </View>
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function getSpecificCardStyle(type: string) {
  switch (type) {
    case "tribute":
      return styles.tributeCard;
    case "appreciation":
      return styles.memoryCard;
    case "memo":
    case "memory":
      return styles.memoryCard;
    case "letter":
      return styles.letterCard;
    case "note":
    case "lesson":
      return styles.lessonCard;
    default:
      return {};
  }
}

function getIconWrapperStyle(type: string) {
  switch (type) {
    case "tribute":
      return { backgroundColor: "rgba(255, 158, 207, 0.14)" };
    case "appreciation":
      return { backgroundColor: "rgba(143, 240, 198, 0.16)" };
    case "memo":
    case "memory":
      return { backgroundColor: "rgba(143, 211, 255, 0.14)" };
    case "letter":
      return { backgroundColor: "rgba(255, 184, 153, 0.14)" };
    case "note":
    case "lesson":
      return { backgroundColor: "rgba(216, 180, 254, 0.16)" };
    default:
      return { backgroundColor: Palette.mintMist };
  }
}

function getIconColor(type: string) {
  switch (type) {
    case "tribute":
      return Palette.accentPink;
    case "appreciation":
      return Palette.accentMint;
    case "memo":
    case "memory":
      return Palette.accentSky;
    case "letter":
      return Palette.accentPeach;
    case "note":
    case "lesson":
      return Palette.accentLavender;
    default:
      return Palette.deepTeal;
  }
}

const styles = StyleSheet.create({
  cardOuter: {
    width: "48.2%",
    marginBottom: 12,
  },
  cardOuterFullWidth: {
    width: "100%",
  },
  cardInner: {
    backgroundColor: "#161616",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
    minHeight: 196,
    justifyContent: "space-between",
  },
  cardActiveState: {
    borderColor: Palette.accentSky,
    shadowColor: Palette.accentSky,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },

  // Bespoke styles per card
  tributeCard: {
    backgroundColor: "#1B1518",
    borderColor: "rgba(255, 158, 207, 0.24)",
  },
  memoryCard: {
    backgroundColor: "#141718",
    borderColor: "rgba(143, 211, 255, 0.22)",
  },
  letterCard: {
    backgroundColor: "#1A1715",
    borderColor: "rgba(255, 184, 153, 0.22)",
  },
  lessonCard: {
    backgroundColor: "#18151A",
    borderColor: "rgba(216, 180, 254, 0.22)",
  },
  featureCardLayout: {
    minHeight: 148,
    padding: 18,
  },
  lessonCardLayout: {
    minHeight: 82,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  // Tribute card layout
  tributeContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  tributeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  tributeHeadingBlock: {
    flex: 1,
  },
  tributeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FF9ECF",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  tributeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  tributeSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8FD3FF",
    marginTop: 2,
  },
  tributeBottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  tributePurpose: {
    fontSize: 12,
    color: "#B89E99",
    lineHeight: 17,
    flex: 1,
  },

  // Lesson card layout
  lessonContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lessonTextContent: {
    flex: 1,
  },
  lessonTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  lessonBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#B89E99",
    letterSpacing: 1,
  },

  // Split cards layout (Memory & Letter)
  splitCardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  topMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  splitBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#B89E99",
    letterSpacing: 1.1,
  },
  splitActionRow: {
    alignItems: "flex-end",
    marginTop: 8,
  },

  // Common Header & Meta
  iconWrapperLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  // Content
  contentWrap: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12.5,
    fontWeight: "600",
    marginTop: 3,
    marginBottom: 6,
  },
  cardPurpose: {
    fontSize: 11.5,
    color: "#B89E99",
    lineHeight: 16,
  },

  // Action Buttons
  actionArrowCircleLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionArrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
});
