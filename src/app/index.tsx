import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppFonts, Layout, SystemColors, TextStyles } from "@/constants/theme";
import { getAuthToken } from "@/services/api";
import { useReduceMotion } from "@/hooks/useReduceMotion";

// HIG › Onboarding: show a splash "just long enough for people to absorb the
// information at a glance". Tap anywhere to skip.
const SPLASH_DURATION = Platform.OS === "web" ? 1000 : 1500;

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const hasNavigated = useRef(false);
  const useNative = Platform.OS !== "web";
  const reduceMotion = useReduceMotion();

  const logoOpacity = useMemo(() => new Animated.Value(0), []);
  const logoScale = useMemo(() => new Animated.Value(0.92), []);
  const contentFade = useMemo(() => new Animated.Value(0), []);
  const contentSlide = useMemo(() => new Animated.Value(8), []);
  const progressAnim = useMemo(() => new Animated.Value(0), []);

  const navigateNext = React.useCallback(async () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    const token = await getAuthToken().catch(() => null);
    router.replace(token ? "/home" : "/onboarding");
  }, []);

  useEffect(() => {
    // Resume immediately when already signed in.
    getAuthToken()
      .then((token) => {
        if (token && !hasNavigated.current) {
          hasNavigated.current = true;
          router.replace("/home");
        }
      })
      .catch(() => {});

    if (reduceMotion) {
      logoOpacity.setValue(1);
      logoScale.setValue(1);
      contentFade.setValue(1);
      contentSlide.setValue(0);
    } else {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoOpacity, { toValue: 1, duration: 350, useNativeDriver: useNative }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
        ]),
        Animated.parallel([
          Animated.timing(contentFade, { toValue: 1, duration: 300, useNativeDriver: useNative }),
          Animated.timing(contentSlide, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
        ]),
      ]).start();
    }

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: SPLASH_DURATION,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start(() => navigateNext());
  }, [contentFade, contentSlide, logoOpacity, logoScale, navigateNext, progressAnim, reduceMotion, useNative]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Pressable
      onPress={navigateNext}
      style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom + 24, 40) }]}
      accessibilityRole="button"
      accessibilityLabel="Honour Your Mentor. Tap to continue."
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.center}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Image
            source={require("../../assets/images/logo_transparent.png")}
            style={styles.logoImg}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>

        <Animated.View
          style={[styles.headingSection, { opacity: contentFade, transform: [{ translateY: contentSlide }] }]}
        >
          <Text style={styles.eyebrow}>Honour</Text>
          <Text style={styles.titleMain}>Your Mentor</Text>
          <Text style={styles.tagline}>
            Celebrate the mentors, teachers, and guides who helped you become who you are.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.progressTrack} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SystemColors.systemBackground,
    alignItems: "center",
    paddingHorizontal: Layout.marginWide,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 400,
  },
  logoImg: {
    width: 112,
    height: 112,
    marginBottom: 24,
  },
  headingSection: {
    alignItems: "center",
    width: "100%",
  },
  eyebrow: {
    fontFamily: AppFonts.displaySans,
    ...TextStyles.title3,
    fontWeight: "400",
    color: SystemColors.secondaryLabel,
  },
  titleMain: {
    fontFamily: AppFonts.displaySans,
    ...TextStyles.largeTitle,
    color: SystemColors.label,
    marginBottom: 12,
  },
  tagline: {
    fontFamily: AppFonts.body,
    ...TextStyles.body,
    color: SystemColors.secondaryLabel,
    textAlign: "center",
  },
  progressTrack: {
    width: 120,
    height: 4,
    backgroundColor: SystemColors.tertiarySystemFill,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: SystemColors.label,
    borderRadius: 2,
  },
});
