import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Alert,
  Animated,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { AppFonts, Palette } from "@/constants/theme";
import type { WallMentorProfile } from "@/types/memoryWall";

interface YearGratitudeCardProps {
  year: number;
  mentors: WallMentorProfile[];
  userName: string;
}

const STAR_POSITIONS = [
  { x: 0.16, y: 0.32 },
  { x: 0.5, y: 0.12 },
  { x: 0.84, y: 0.34 },
  { x: 0.3, y: 0.82 },
  { x: 0.74, y: 0.86 },
];
const CONSTELLATION_HEIGHT = 210;

export default function YearGratitudeCard({
  year,
  mentors,
  userName,
}: YearGratitudeCardProps) {
  const [width, setWidth] = useState(0);
  const [starAnimations] = useState(() =>
    STAR_POSITIONS.map(() => new Animated.Value(0))
  );

  useEffect(() => {
    let mounted = true;
    let shouldReduceMotion = false;
    let stopAnimation: (() => void) | undefined;

    const showStars = (reduceMotion: boolean) => {
      if (!mounted) return;
      if (reduceMotion) {
        starAnimations.forEach((value) => value.setValue(1));
        return;
      }

      const animation = Animated.stagger(
        110,
        starAnimations.map((value) =>
          Animated.spring(value, {
            toValue: 1,
            useNativeDriver: Platform.OS !== "web",
            friction: 5,
            tension: 65,
          })
        )
      );
      animation.start();
      stopAnimation = () => animation.stop();
    };

    const motionSubscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (reduceMotion) => {
        shouldReduceMotion = reduceMotion;
        if (reduceMotion) {
          stopAnimation?.();
          showStars(true);
        }
      }
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => showStars(reduceMotion || shouldReduceMotion))
      .catch((error: unknown) => {
        console.error("Unable to read the reduced-motion setting:", error);
        showStars(true);
      });

    return () => {
      mounted = false;
      stopAnimation?.();
      motionSubscription.remove();
    };
  }, [starAnimations]);

  const handleShare = async () => {
    const names = mentors.map((mentor) => mentor.name);
    const peopleText =
      names.length > 0 ? `: ${names.join(", ")}` : " through every small act";

    try {
      await Share.share({
        title: `${year} in gratitude`,
        message: `I've honoured ${mentors.length} ${
          mentors.length === 1 ? "person" : "people"
        } this year${peopleText}. Every tribute, memory, and letter is a thank you that lasts. — ${userName}`,
      });
    } catch {
      Alert.alert(
        "Sharing unavailable",
        "Your gratitude card could not be shared right now."
      );
    }
  };

  const constellationMentors = mentors.slice(0, STAR_POSITIONS.length);
  const centerX = width / 2;
  const centerY = CONSTELLATION_HEIGHT / 2;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["#5E1022", "#3A0A14"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.heading}>
        You&apos;ve honoured {mentors.length}{" "}
        {mentors.length === 1 ? "person" : "people"} this year
      </Text>
      <Text style={styles.subtitle}>
        Every tribute, memory, and letter is a thank you that lasts.
      </Text>

      <View
        style={styles.constellation}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        accessible
        accessibilityLabel={`${mentors.length} mentors honoured in ${year}`}
      >
        {width > 0 &&
          constellationMentors.map((mentor, index) => {
            const position = STAR_POSITIONS[index];
            const starX = width * position.x;
            const starY = CONSTELLATION_HEIGHT * position.y;
            const deltaX = starX - centerX;
            const deltaY = starY - centerY;
            const lineLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);
            const labelWidth = 108;

            return (
              <React.Fragment key={mentor.id}>
                <View
                  style={[
                    styles.constellationLine,
                    { pointerEvents: "none" },
                    {
                      left: centerX,
                      top: centerY,
                      width: lineLength,
                      transform: [{ rotate: `${angle}rad` }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.starPoint,
                    {
                      left: starX - 12,
                      top: starY - 12,
                      opacity: starAnimations[index],
                      transform: [
                        {
                          scale: starAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.35, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="star" size={21} color={Palette.iceWhite} />
                </Animated.View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.starLabel,
                    {
                      left: Math.max(
                        0,
                        Math.min(width - labelWidth, starX - labelWidth / 2)
                      ),
                      top:
                        position.y < 0.5 ? starY + 14 : starY - 30,
                    },
                  ]}
                >
                  {mentor.name}
                </Text>
              </React.Fragment>
            );
          })}

        <View
          style={[
            styles.centerAura,
            { left: centerX - 42, top: centerY - 42 },
          ]}
        />
        <View
          style={[
            styles.centerPoint,
            { left: centerX - 22, top: centerY - 22 },
          ]}
        >
          <Text style={styles.centerInitials}>{getInitials(userName)}</Text>
        </View>
      </View>

      <Pressable
        onPress={handleShare}
        accessibilityRole="button"
        accessibilityLabel="Share your year in gratitude card"
        style={({ pressed }) => [
          styles.shareButton,
          pressed && styles.shareButtonPressed,
        ]}
      >
        <Ionicons name="share-outline" size={23} color="#3A0A14" />
        <Text style={styles.shareText}>Share your card</Text>
      </Pressable>
    </View>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const styles = StyleSheet.create({
  card: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderRadius: 28,
    overflow: "hidden",
  },
  heading: {
    color: Palette.iceWhite,
    fontFamily: AppFonts.displaySans,
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 34,
  },
  subtitle: {
    color: "rgba(255, 248, 240, 0.85)",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 4,
  },
  constellation: {
    height: CONSTELLATION_HEIGHT,
    marginTop: 4,
    marginBottom: 8,
    position: "relative",
  },
  constellationLine: {
    position: "absolute",
    height: 0,
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(236, 143, 62, 0.55)",
    transformOrigin: "left center",
  },
  starPoint: {
    position: "absolute",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  starLabel: {
    position: "absolute",
    width: 108,
    color: "rgba(255, 248, 240, 0.9)",
    textAlign: "center",
    fontSize: 9,
    fontWeight: "700",
    zIndex: 3,
  },
  centerAura: {
    position: "absolute",
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 42,
    backgroundColor: "rgba(236, 143, 62, 0.22)",
  },
  centerPoint: {
    position: "absolute",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: Palette.turquoise,
  },
  centerInitials: {
    color: "#3A0A14",
    fontSize: 15,
    fontWeight: "900",
  },
  shareButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: 32,
    backgroundColor: "#F4A23A",
  },
  shareButtonPressed: {
    opacity: 0.82,
  },
  shareText: {
    color: "#3A0A14",
    fontSize: 17,
    fontWeight: "800",
  },
});
