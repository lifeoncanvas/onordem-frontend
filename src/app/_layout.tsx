import React, { useEffect } from "react";
import { Stack, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { Platform, View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Caveat_400Regular } from "@expo-google-fonts/caveat";
import "@/global.css";
import { memoryService } from "@/services/memoryService";
import { creationDraftService } from "@/services/creationDraftService";
import { storyBookmarkService } from "@/services/storyBookmarkService";
import { tributeDraftService } from "@/services/tributeDraftService";
import { userProfileService } from "@/services/userProfileService";
import { QrModalProvider, useQrModal } from "@/context/QrModalContext";
import ResponsiveHeader from "@/components/web/ResponsiveHeader";
import PwaInstallBanner from "@/components/web/PwaInstallBanner";
import { useResponsive } from "@/hooks/useResponsive";
import { themeService } from "@/services/themeService";
import { languageService } from "@/i18n";
import { SystemColors } from "@/constants/theme";

/** Routes that hide the web header and install banner. */
const FOCUSED_ROUTES = new Set(["/profile-setup"]);

function LayoutContent() {
  const { isDesktop, isTablet, isWeb, isMounted } = useResponsive();
  const { openQrModal } = useQrModal();

  const pathname = usePathname();

  const isWide = isMounted && isWeb && (isDesktop || isTablet);
  // Focused flows: no site navigation or install banner, so people finish before wandering off.
  const showWebChrome = isWeb && !FOCUSED_ROUTES.has(pathname);

  return (
    <View style={styles.rootWrapper}>
      {showWebChrome && <PwaInstallBanner onOpenQrModal={() => openQrModal("https://onodem.com")} />}
      {showWebChrome && <ResponsiveHeader onOpenQrModal={() => openQrModal("https://onodem.com")} />}
      <View style={[styles.mainShell, isWide && styles.desktopShell]}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="profile-setup" options={{ gestureEnabled: false }} />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="home" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="profile-edit" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="tributes" />
          <Stack.Screen name="saved-items" />
          <Stack.Screen name="memories" />
          <Stack.Screen name="create-mentor" />
          <Stack.Screen name="discover" />
          <Stack.Screen name="create" />
          <Stack.Screen name="creation-studio" />
          <Stack.Screen name="memo" />
          <Stack.Screen name="note" />
          <Stack.Screen name="open-letter" />
          <Stack.Screen name="create-tribute" />
          <Stack.Screen name="tribute-design" />
          <Stack.Screen name="tribute-preview" />
          <Stack.Screen name="memory-wall" />
          <Stack.Screen name="journey-timeline" />
          <Stack.Screen name="memory-detail/[id]" />
          <Stack.Screen name="mentor-profile/[id]" />
          <Stack.Screen name="stories/[id]" />
          <Stack.Screen name="people/[id]" />
          <Stack.Screen name="upload-memory" options={{ presentation: "modal" }} />
        </Stack>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...(Platform.OS === "web" ? {} : { Caveat_400Regular }),
  });

  useEffect(() => {
    // Appearance + language first, so the app paints in the saved theme.
    themeService.initialize();
    languageService.initialize();
    Promise.all([
      memoryService.initialize(),
      creationDraftService.initialize(),
      storyBookmarkService.initialize(),
      tributeDraftService.initialize(),
      userProfileService.initialize(),
    ]).catch((error: unknown) => {
      console.error("Unable to initialize local app data:", error);
    });
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error("Unable to load the Open Letter handwriting font:", fontError);
    }
  }, [fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <QrModalProvider>
        <LayoutContent />
      </QrModalProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: SystemColors.systemBackground,
  },
  mainShell: {
    flex: 1,
    backgroundColor: SystemColors.systemBackground,
  },
  desktopShell: {
    maxWidth: 1240,
    width: "100%",
    marginHorizontal: "auto",
    backgroundColor: SystemColors.systemBackground,
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
  },
});
