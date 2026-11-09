import React, { useEffect } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WallCategory, WallFilterTab } from "@/types/memoryWall";
import { AppFonts, Palette } from "@/constants/theme";

interface FilterTabsProps {
  tabs: WallFilterTab[];
  active: WallCategory;
  onSelect: (key: WallCategory) => void;
}

interface FilterChipProps {
  tab: WallFilterTab;
  isActive: boolean;
  onSelect: (key: WallCategory) => void;
}

// Fallback category color mapping
const CATEGORY_COLORS: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  all: { color: Palette.accentSky, icon: "sparkles-outline" },
  school: { color: Palette.accentLavender, icon: "school-outline" },
  study: { color: Palette.accentMint, icon: "book-outline" },
  work: { color: Palette.accentPeach, icon: "briefcase-outline" },
  life: { color: Palette.accentPink, icon: "heart-outline" },
  tributes: { color: Palette.accentPink, icon: "heart-outline" },
  memories: { color: Palette.accentSky, icon: "camera-outline" },
  letters: { color: Palette.accentPeach, icon: "mail-open-outline" },
  lessons: { color: Palette.accentLavender, icon: "bulb-outline" },
  milestones: { color: Palette.accentMint, icon: "trophy-outline" },
};

function FilterChip({ tab, isActive, onSelect }: FilterChipProps) {
  const scale = React.useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.03 : 1,
      speed: 24,
      bounciness: 4,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [isActive, scale]);

  const config = CATEGORY_COLORS[tab.key] || { color: Palette.accentSky, icon: "sparkles-outline" };
  const pastelColor = tab.color || config.color;
  const iconName = (tab.icon as keyof typeof Ionicons.glyphMap) || config.icon;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={() => onSelect(tab.key)}
        activeOpacity={0.78}
        style={[
          styles.chip,
          isActive && styles.chipActive,
        ]}
        accessibilityRole="tab"
        accessibilityLabel={`${tab.label} filter`}
        accessibilityState={{ selected: isActive }}
      >
        <Ionicons
          name={iconName}
          size={14}
          color={isActive ? "#000000" : pastelColor}
        />
        <Text
          style={[
            styles.chipText,
            { color: isActive ? "#000000" : pastelColor },
            isActive && styles.chipTextActive,
          ]}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function FilterTabs({ tabs, active, onSelect }: FilterTabsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <FilterChip
              key={tab.key}
              tab={tab}
              isActive={isActive}
              onSelect={onSelect}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 6,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#161616",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)",
  },
  chipActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
  },
  chipText: {
    fontSize: 13.5,
    fontWeight: "700",
    fontFamily: AppFonts.body,
    letterSpacing: 0.2,
  },
  chipTextActive: {
    color: "#000000",
    fontWeight: "800",
  },
});
