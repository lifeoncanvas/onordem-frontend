import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Palette, SystemColors, TextStyles, Layout } from "@/constants/theme";
import { useReduceMotion } from "@/hooks/useReduceMotion";
import { useResponsive } from "@/hooks/useResponsive";
import { useQrModal } from "@/context/QrModalContext";

export default function OnboardingScreen() {
  const { width: windowWidth, height: windowHeight, isDesktop, isTablet, isMounted } = useResponsive();
  const { openQrModal } = useQrModal();

  const isWideScreen = isMounted && (isDesktop || isTablet);
  const useNative = Platform.OS !== "web";
  const reduceMotion = useReduceMotion();

  // Smooth entrance animation
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(16), []);
  const collageFloat = useMemo(
    () => [new Animated.Value(-5), new Animated.Value(5), new Animated.Value(-5)],
    []
  );

  // Wait until the responsive layout has resolved. The first render uses the mobile layout and
  // then swaps to the desktop one; unmounting an Animated.View stops its animation, which left
  // the hero text frozen at opacity 0. Re-running on every layout swap restarts it.
  useEffect(() => {
    if (!isMounted) return;

    const floatAnimations = collageFloat.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: index === 1 ? -6 : 6,
            duration: 2400 + index * 200,
            useNativeDriver: useNative,
          }),
          Animated.timing(value, {
            toValue: index === 1 ? 6 : -6,
            duration: 2400 + index * 200,
            useNativeDriver: useNative,
          }),
        ])
      )
    );
    // Decorative float is skipped when Reduce Motion is on.
    if (!reduceMotion) floatAnimations.forEach((animation) => animation.start());

    // With Reduce Motion on, show the copy immediately instead of sliding it in.
    const entrance = reduceMotion
      ? null
      : Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: useNative,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: useNative,
          }),
        ]);
    if (entrance) {
      entrance.start();
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }

    return () => {
      floatAnimations.forEach((animation) => animation.stop());
      entrance?.stop();
    };
  }, [collageFloat, fadeAnim, slideAnim, useNative, reduceMotion, isMounted, isWideScreen]);

  // Card dimensions
  const cardWidth = isWideScreen
    ? 155
    : Math.min(136, Math.max(105, Math.floor((windowWidth - 36) / 2.75)));
  const cardHeight = Math.round(cardWidth * 1.38);
  const mobileCollageHeight = Math.round(windowHeight * 0.46);

  // Render the floating 3-column photo collage
  const renderCollage = () => (
    <View style={styles.tiltedWrapper}>
      {/* Column 1 */}
      <Animated.View
        style={[
          styles.column,
          { paddingTop: isWideScreen ? 20 : 24, transform: [{ translateY: collageFloat[0] }] },
        ]}
      >
        <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
          <Image
            source={require("../../assets/images/img4.jpeg")}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>
        <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
          <Image
            source={require("../../assets/images/img1.jpeg")}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>
      </Animated.View>

      {/* Column 2 */}
      <Animated.View
        style={[
          styles.column,
          { paddingTop: isWideScreen ? 0 : 0, transform: [{ translateY: collageFloat[1] }] },
        ]}
      >
        <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
          <Image
            source={require("../../assets/images/img3.jpeg")}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>
        <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
          <Image
            source={require("../../assets/images/img2.jpeg")}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>
      </Animated.View>

      {/* Column 3 */}
      <Animated.View
        style={[
          styles.column,
          { paddingTop: isWideScreen ? 26 : 28, transform: [{ translateY: collageFloat[2] }] },
        ]}
      >
        <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
          <Image
            source={require("../../assets/images/img1.jpeg")}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>
        <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
          <Image
            source={require("../../assets/images/img4.jpeg")}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        {isWideScreen ? (
          /* ======================================================== */
          /* DESKTOP & TABLET: SPLIT 2-COLUMN HERO PRESENTATION        */
          /* ======================================================== */
          <ScrollView
            contentContainerStyle={styles.desktopScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.desktopGrid}>
              {/* Left Column: Hero Copy & Actions */}
              <Animated.View
                style={[
                  styles.desktopLeftCol,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.heroBadge}>
                  <Ionicons name="sparkles" size={13} color={SystemColors.yellow} />
                  <Text style={styles.heroBadgeText}>Honour Your Mentors</Text>
                </View>

                <Text style={styles.desktopMainHeading}>
                  Keep the people who{"\n"}
                  <Text style={styles.desktopHeadingAccent}>shaped you</Text> close.
                </Text>

                <Text style={styles.desktopDescription}>
                  A quiet, beautiful sanctuary to preserve cherished memories,
                  write heartfelt letters, save life-changing advice, and celebrate
                  the mentors who guided your journey.
                </Text>

                {/* 3 Core Value Props */}
                <View style={styles.valueProps}>
                  <View style={styles.propItem}>
                    <View style={styles.propIconBox}>
                      <Ionicons name="heart-outline" size={16} color={SystemColors.pink} />
                    </View>
                    <View style={styles.propTextCol}>
                      <Text style={styles.propTitle}>Gratitude Tributes</Text>
                      <Text style={styles.propDesc}>Create public or private tributes with photos and quotes.</Text>
                    </View>
                  </View>

                  <View style={styles.propItem}>
                    <View style={styles.propIconBox}>
                      <Ionicons name="mic-outline" size={16} color={SystemColors.blue} />
                    </View>
                    <View style={styles.propTextCol}>
                      <Text style={styles.propTitle}>Voice Notes & Lessons</Text>
                      <Text style={styles.propDesc}>Record spoken memories so you always carry their wisdom.</Text>
                    </View>
                  </View>

                  <View style={styles.propItem}>
                    <View style={styles.propIconBox}>
                      <Ionicons name="calendar-outline" size={16} color={SystemColors.yellow} />
                    </View>
                    <View style={styles.propTextCol}>
                      <Text style={styles.propTitle}>Milestones & Reminders</Text>
                      <Text style={styles.propDesc}>Automated notifications for birthdays and anniversaries.</Text>
                    </View>
                  </View>
                </View>

                {/* Desktop Action Buttons */}
                <View style={styles.desktopActionRow}>
                  <TouchableOpacity
                    style={styles.desktopPrimaryBtn}
                    activeOpacity={0.88}
                    onPress={() => router.push("/register")}
                  >
                    <Text style={styles.desktopPrimaryBtnText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={16} color="#000000" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.desktopSecondaryBtn}
                    activeOpacity={0.8}
                    onPress={() => router.push("/login")}
                  >
                    <Text style={styles.desktopSecondaryBtnText}>Log In</Text>
                  </TouchableOpacity>
                </View>

                {/* Phone QR Trigger */}
                <TouchableOpacity
                  style={styles.desktopQrLink}
                  onPress={() => openQrModal("https://onodem.com")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="phone-portrait-outline" size={14} color={Palette.textSecondary} />
                  <Text style={styles.desktopQrLinkText}>
                    Get the app on your phone — Scan QR Code
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Right Column: Floating Collage */}
              <View style={styles.desktopRightCol}>
                <View style={styles.desktopCollageWrapper}>
                  {renderCollage()}
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)", "#000000"]}
                    locations={[0.5, 0.85, 1]}
                    style={[styles.desktopGradientOverlay, { pointerEvents: "none" }]}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
          /* ======================================================== */
          /* MOBILE: COMPACT PORTRAIT PRESENTATION                     */
          /* ======================================================== */
          <ScrollView
            contentContainerStyle={styles.mobileScrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Top Collage */}
            <View style={[styles.mobileCollageContainer, { height: mobileCollageHeight }]}>
              {renderCollage()}
              <LinearGradient
                colors={[
                  "rgba(0, 0, 0, 0)",
                  "rgba(0, 0, 0, 0.65)",
                  "rgba(0, 0, 0, 0.95)",
                  "#000000",
                ]}
                locations={[0, 0.45, 0.8, 1]}
                style={[styles.bottomCollageGradient, { pointerEvents: "none" }]}
              />
            </View>

            {/* Content Area */}
            <Animated.View
              style={[
                styles.mobileContentArea,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.mobileTitle}>
                Honour Your{"\n"}Mentor
              </Text>

              <View style={styles.mobileDescBox}>
                <Text style={styles.mobileDescText}>
                  Keep their memories, lessons, and impact{"\n"}
                  close to your heart.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.mobileGetStartedWrapper}
                activeOpacity={0.7}
                onPress={() => router.push("/register")}
                accessibilityRole="button"
              >
                <View style={styles.mobileGetStartedBtn}>
                  <Text style={styles.mobileGetStartedText}>Get Started</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.mobileLoginRow}>
                <Text style={styles.mobileLoginPrompt}>Already have an account? </Text>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => router.push("/login")}
                  style={styles.mobileLoginTouch}
                  accessibilityRole="link"
                >
                  <Text style={styles.mobileLoginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    backgroundColor: SystemColors.systemBackground,
  },
  safeArea: {
    flex: 1,
    backgroundColor: SystemColors.systemBackground,
  },

  /* ========================================================= */
  /* SHARED COLLAGE STYLES                                     */
  /* ========================================================= */
  tiltedWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    transform: [{ rotate: "-6deg" }],
    marginTop: -10,
    width: "120%",
  },
  column: {
    flexDirection: "column",
    gap: 14,
  },
  card: {
    borderRadius: Layout.radiusXL,
    overflow: "hidden",
    backgroundColor: SystemColors.secondarySystemBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
    boxShadow: "0px 8px 14px rgba(0, 0, 0, 0.35)",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },

  /* ========================================================= */
  /* DESKTOP STYLES                                            */
  /* ========================================================= */
  desktopScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  desktopGrid: {
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 48,
  },
  desktopLeftCol: {
    flex: 1.15,
    paddingRight: 16,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: SystemColors.tertiarySystemFill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 20,
  },
  heroBadgeText: {
    ...TextStyles.footnote,
    fontWeight: "600",
    color: SystemColors.label,
  },
  desktopMainHeading: {
    fontSize: 48,
    fontWeight: "700",
    color: SystemColors.label,
    lineHeight: 54,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  desktopHeadingAccent: {
    color: SystemColors.secondaryLabel,
  },
  desktopDescription: {
    ...TextStyles.title3,
    fontWeight: "400",
    lineHeight: 28,
    color: SystemColors.secondaryLabel,
    marginBottom: 28,
    maxWidth: 520,
  },
  valueProps: {
    gap: 14,
    marginBottom: 32,
    maxWidth: 490,
  },
  propItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  propIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: SystemColors.tertiarySystemFill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  propTextCol: {
    flex: 1,
  },
  propTitle: {
    ...TextStyles.headline,
    color: SystemColors.label,
  },
  propDesc: {
    ...TextStyles.subheadline,
    color: SystemColors.secondaryLabel,
    marginTop: 2,
  },
  desktopActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  desktopPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: SystemColors.label,
    paddingHorizontal: 24,
    minHeight: Layout.controlHeight,
    borderRadius: Layout.radiusMedium,
  },
  desktopPrimaryBtnText: {
    ...TextStyles.headline,
    color: "#000000",
  },
  desktopSecondaryBtn: {
    paddingHorizontal: 24,
    minHeight: Layout.controlHeight,
    justifyContent: "center",
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.tertiarySystemFill,
  },
  desktopSecondaryBtnText: {
    ...TextStyles.headline,
    color: SystemColors.label,
  },
  desktopPhoneHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  desktopPhoneHintText: {
    ...TextStyles.footnote,
    color: SystemColors.secondaryLabel,
  },
  desktopQrLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    minHeight: Layout.minTouch,
  },
  desktopQrLinkText: {
    ...TextStyles.footnote,
    color: SystemColors.blue,
  },
  desktopRightCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    minHeight: 520,
  },
  desktopCollageWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  desktopGradientOverlay: {
    position: "absolute",
    bottom: -30,
    left: 0,
    right: 0,
    height: 140,
  },

  /* ========================================================= */
  /* MOBILE STYLES                                             */
  /* ========================================================= */
  mobileScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 40,
  },
  mobileCollageContainer: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  bottomCollageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  mobileContentArea: {
    paddingHorizontal: Layout.marginWide,
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 8,
  },
  mobileTitle: {
    ...TextStyles.largeTitle,
    color: SystemColors.label,
    textAlign: "center",
    marginBottom: 8,
  },
  mobileDescBox: {
    marginBottom: 32,
    alignItems: "center",
  },
  mobileDescText: {
    ...TextStyles.body,
    color: SystemColors.secondaryLabel,
    textAlign: "center",
  },
  mobileGetStartedWrapper: {
    width: "100%",
    maxWidth: 400,
    borderRadius: Layout.radiusMedium,
    overflow: "hidden",
  },
  mobileGetStartedBtn: {
    height: Layout.controlHeight,
    backgroundColor: SystemColors.label,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Layout.radiusMedium,
  },
  mobileGetStartedText: {
    ...TextStyles.headline,
    color: "#000000",
  },
  mobileLoginRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  mobileLoginPrompt: {
    ...TextStyles.subheadline,
    color: Palette.textSecondary,
  },
  mobileLoginTouch: {
    minHeight: Layout.minTouch,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  mobileLoginLink: {
    ...TextStyles.subheadline,
    color: SystemColors.blue,
    fontWeight: "600",
  },
});
