import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { useQrModal } from "@/context/QrModalContext";
import { Palette, SystemColors, alphaColor } from "@/constants/theme";
import { signOut } from "@/services/auth";
import { useT, type StringKey } from "@/i18n";

interface ResponsiveHeaderProps {
  onOpenQrModal?: () => void;
}

const NAV_LINKS: { labelKey: StringKey; path: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { labelKey: "nav.home", path: "/home", icon: "home-outline" },
  { labelKey: "nav.memoryWall", path: "/memory-wall", icon: "images-outline" },
  { labelKey: "nav.discover", path: "/discover", icon: "compass-outline" },
  { labelKey: "nav.create", path: "/create", icon: "add-circle-outline" },
];

export default function ResponsiveHeader({ onOpenQrModal }: ResponsiveHeaderProps) {
  const { isDesktop, isTablet, isWeb, isMounted } = useResponsive();
  const { openQrModal } = useQrModal();
  const pathname = usePathname();
  const t = useT();

  // Only show desktop top bar on Web when screen is tablet or desktop, and only after client mount
  // to avoid React 19 hydration mismatch (Error #418) during SSR static export
  if (!isWeb || !isMounted || (!isDesktop && !isTablet)) {
    return null;
  }

  const handleOpenQr = () => {
    if (onOpenQrModal) onOpenQrModal();
    else openQrModal("https://onodem.com");
  };

  const isAuthRoute =
    pathname === "/onboarding" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/";

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.container}>
        {/* Left: Brand Identity */}
        <TouchableOpacity
          style={styles.brandRow}
          onPress={() => router.push(isAuthRoute ? "/onboarding" : "/home")}
          activeOpacity={0.8}
          accessibilityRole="link"
          accessibilityLabel="Honour Your Mentor"
        >
          <Image
            source={require("../../../assets/images/logo_transparent.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandName}>Honour Your Mentor</Text>
            <Text style={styles.brandTagline}>{t("brand.tagline")}</Text>
          </View>
        </TouchableOpacity>

        {/* Center: Navigation Links (Only for authenticated internal routes) */}
        {!isAuthRoute && (
          <View style={styles.navLinks} accessibilityRole="tablist">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.path || (link.path === "/home" && pathname === "/");
              return (
                <TouchableOpacity
                  key={link.path}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => router.push(link.path as never)}
                  activeOpacity={0.7}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  <Ionicons
                    name={link.icon}
                    size={16}
                    color={isActive ? SystemColors.label : Palette.textSecondary}
                  />
                  <Text style={[styles.navText, isActive && styles.navTextActive]}>
                    {t(link.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Right: Actions */}
        <View style={styles.rightActions}>
          {isAuthRoute ? (
            <View style={styles.authActionsRow}>
              {pathname !== "/login" && (
                <TouchableOpacity
                  style={styles.authGhostBtn}
                  onPress={() => router.push("/login")}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <Text style={styles.authGhostText}>{t("nav.logIn")}</Text>
                </TouchableOpacity>
              )}

              {pathname !== "/register" && (
                <TouchableOpacity
                  style={styles.authPrimaryBtn}
                  onPress={() => router.push("/register")}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                >
                  <Text style={styles.authPrimaryText}>{t("nav.getStarted")}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.qrButton}
                onPress={handleOpenQr}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <Ionicons name="qr-code-outline" size={15} color={SystemColors.label} />
                <Text style={styles.qrButtonText}>{t("nav.openOnPhone")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.qrButton}
                onPress={handleOpenQr}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <Ionicons name="qr-code-outline" size={15} color={SystemColors.label} />
                <Text style={styles.qrButtonText}>{t("nav.openOnPhone")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push("/settings")}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t("nav.settings")}
              >
                <Ionicons name="settings-outline" size={22} color={SystemColors.label} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push("/profile")}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t("nav.profile")}
              >
                <Ionicons name="person-circle-outline" size={26} color={SystemColors.label} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signOutHeaderBtn}
                onPress={async () => {
                  try {
                    await signOut();
                  } catch (err) {
                    console.warn("Sign out error:", err);
                  } finally {
                    if (Platform.OS === "web" && typeof window !== "undefined") {
                      window.location.href = "/login";
                    } else {
                      router.replace("/login");
                    }
                  }
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t("nav.signOut")}
              >
                <Ionicons name="log-out-outline" size={15} color={SystemColors.red} />
                <Text style={styles.signOutHeaderText}>{t("nav.signOut")}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    width: "100%",
    backgroundColor: SystemColors.barMaterial,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
    zIndex: 100,
  },
  container: {
    maxWidth: 1240,
    marginHorizontal: "auto",
    width: "100%",
    height: 64,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 34, height: 34 },
  brandName: { fontSize: 16, fontWeight: "800", color: SystemColors.label, letterSpacing: -0.3 },
  brandTagline: { fontSize: 11, color: Palette.textMuted },
  navLinks: { flexDirection: "row", alignItems: "center", gap: 6 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  navItemActive: { backgroundColor: SystemColors.tertiarySystemFill },
  navText: { fontSize: 13, fontWeight: "600", color: Palette.textSecondary },
  navTextActive: { color: SystemColors.label, fontWeight: "700" },
  rightActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  authActionsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  authGhostBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  authGhostText: { color: SystemColors.label, fontSize: 13, fontWeight: "600" },
  authPrimaryBtn: {
    backgroundColor: SystemColors.label,
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
  },
  authPrimaryText: { color: SystemColors.inverseLabel, fontSize: 13, fontWeight: "700" },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SystemColors.tertiarySystemFill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  qrButtonText: { fontSize: 12, fontWeight: "700", color: SystemColors.label },
  iconBtn: { padding: 4 },
  signOutHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: alphaColor(SystemColors.red, 0.12),
  },
  signOutHeaderText: { fontSize: 12, fontWeight: "700", color: SystemColors.red },
});
