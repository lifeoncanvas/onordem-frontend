import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface PwaInstallBannerProps {
  onOpenQrModal?: () => void;
}

function checkIsStandalone(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export default function PwaInstallBanner({ onOpenQrModal }: PwaInstallBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    if (checkIsStandalone()) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsVisible(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (onOpenQrModal) onOpenQrModal();
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isMounted || isInstalled || !isVisible) {
    return null;
  }

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerInner}>
        <View style={styles.iconCircle}>
          <Ionicons name="download-outline" size={17} color="#000000" />
        </View>

        <View style={styles.textColumn}>
          <Text style={styles.title}>Install Honour Your Mentor</Text>
          <Text style={styles.subtitle}>
            Add to your home screen or desktop for fast, offline access.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.installBtn} onPress={handleInstallClick} activeOpacity={0.85}>
            <Ionicons name="sparkles" size={13} color="#000000" />
            <Text style={styles.installBtnText}>Install PWA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissBtn} onPress={() => setIsVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={18} color={Palette.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    width: "100%",
    backgroundColor: "#111111",
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 99,
  },
  bannerInner: {
    maxWidth: 1240,
    marginHorizontal: "auto",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  installBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 8,
  },
  installBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
  },
  dismissBtn: {
    padding: 4,
  },
});
