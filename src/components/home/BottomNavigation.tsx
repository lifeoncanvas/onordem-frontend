import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Layout, SystemColors } from "@/constants/theme";
import { useT, type StringKey } from "@/i18n";

export type NavTab =
  | "home"
  | "discover"
  | "create"
  | "saved"
  | "profile"
  | "wall"
  | "mentors"
  | "gratitude";

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange?: (tab: NavTab) => void;
  onCreatePress?: () => void;
}

interface TabItem {
  key: NavTab;
  labelKey: StringKey;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  activeColor: string;
}

// HIG › Tab bars: filled symbols, single-word labels, one tint for the selection.
const ACTIVE = SystemColors.blue;
const INACTIVE = SystemColors.tabInactive;

const FIVE_TABS: TabItem[] = [
  { key: "home", labelKey: "nav.home", icon: "home-outline", activeIcon: "home", activeColor: ACTIVE },
  { key: "discover", labelKey: "nav.discover", icon: "compass-outline", activeIcon: "compass", activeColor: ACTIVE },
  { key: "create", labelKey: "nav.create", icon: "add-circle-outline", activeIcon: "add-circle", activeColor: ACTIVE },
  { key: "saved", labelKey: "nav.saved", icon: "bookmark-outline", activeIcon: "bookmark", activeColor: ACTIVE },
  { key: "profile", labelKey: "nav.profile", icon: "person-circle-outline", activeIcon: "person-circle", activeColor: ACTIVE },
];

export default function BottomNavigation({
  activeTab,
  onTabChange,
  onCreatePress,
}: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const t = useT();

  const handleTabPress = (tabKey: NavTab) => {
    if (onTabChange) {
      onTabChange(tabKey);
    }

    if (tabKey === "create") {
      if (onCreatePress) {
        onCreatePress();
        return;
      }
      if (activeTab !== "create") {
        router.push("/create");
      }
      return;
    }

    if (tabKey === "home" && activeTab !== "home") {
      router.push("/home");
    } else if (tabKey === "discover" && activeTab !== "discover") {
      router.push("/discover");
    } else if (tabKey === "saved" && activeTab !== "saved") {
      router.push("/saved-items");
    } else if (tabKey === "profile" && activeTab !== "profile") {
      router.push("/profile");
    }
  };

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, Platform.OS === "web" ? 10 : 8) },
      ]}
      accessibilityRole="tablist"
    >
      <View style={styles.container}>
        {FIVE_TABS.map((tab) => {
          const isActive =
            activeTab === tab.key ||
            (activeTab === "wall" && tab.key === "home") ||
            (activeTab === "mentors" && tab.key === "discover") ||
            (activeTab === "gratitude" && tab.key === "saved");

          const iconColor = isActive ? tab.activeColor : INACTIVE;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.6}
              onPress={() => handleTabPress(tab.key)}
              style={styles.tabButton}
              accessibilityRole="tab"
              accessibilityLabel={t(tab.labelKey)}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={25}
                color={iconColor}
              />
              <Text
                style={[styles.tabLabel, { color: iconColor }]}
                numberOfLines={1}
              >
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: (Platform.OS === "web" ? "fixed" : "absolute") as any,
    bottom: 0,
    left: 0,
    right: 0,
    // Dark material: sleek grey background matching dark canvas
    backgroundColor: "#161618",
    zIndex: 9999,
    elevation: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 49,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    backgroundColor: "#161618",
  },
  tabButton: {
    flex: 1,
    minHeight: Layout.minTouch,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "500",
    marginTop: 2,
  },
});
