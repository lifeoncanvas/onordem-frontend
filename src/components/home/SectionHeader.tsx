import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Layout, SystemColors, TextStyles } from "@/constants/theme";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  badge?: string;
  isDark?: boolean;
}

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  badge,
  isDark = false,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.textWrapper}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isDark && styles.titleDark]} accessibilityRole="header">
            {title}
          </Text>
          {badge ? (
            <View style={[styles.badge, isDark && styles.badgeDark]}>
              <Text style={[styles.badgeText, isDark && styles.badgeTextDark]}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionLabel && onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.6}
          style={styles.actionButton}
          accessibilityRole="button"
        >
          <Text style={[styles.actionText, isDark && styles.actionTextDark]}>
            {actionLabel}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={SystemColors.blue}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: Layout.margin,
    marginBottom: 12,
    marginTop: 32,
  },
  containerDark: {},
  textWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    ...TextStyles.title2,
    color: SystemColors.label,
    fontFamily: AppFonts.displaySans,
    flexShrink: 1,
  },
  titleDark: {},
  badge: {
    backgroundColor: SystemColors.tertiarySystemFill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeDark: {},
  badgeText: {
    ...TextStyles.caption1,
    fontWeight: "600",
    color: SystemColors.secondaryLabel,
    fontFamily: AppFonts.body,
  },
  badgeTextDark: {},
  subtitle: {
    ...TextStyles.subheadline,
    color: SystemColors.secondaryLabel,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  subtitleDark: {},
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: Layout.minTouch,
    paddingLeft: 8,
  },
  actionText: {
    ...TextStyles.body,
    color: SystemColors.blue,
  },
  actionTextDark: {},
});
