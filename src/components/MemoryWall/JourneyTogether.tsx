import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Palette } from "@/constants/theme";

export const JOURNEY_COLORS = {
  panelStart: "#000000",
  panelMiddle: "#111111",
  panelEnd: "#171717",
  cream: "#FFFFFF",
  paper: "#171717",
  gold: Palette.accentAmber,
  mutedText: "#BDBDBD",
  cardText: "#FFFFFF",
  yearText: Palette.accentSky,
  mentorText: Palette.accentPeach,
  snippetText: "#D1D1D1",
  card: "#171717",
  cardBorder: "#303030",
  milestoneCard: "#202020",
  milestoneBorder: "rgba(143, 211, 255, 0.35)",
} as const;

export interface JourneyNode {
  id: string;
  memoryId: string;
  year: string;
  title: string;
  mentorName: string;
  snippet: string;
  isMilestone?: boolean;
}

interface JourneyTogetherProps {
  nodes: JourneyNode[];
  onStoryPress?: (memoryId: string) => void;
  onFullTimelinePress?: () => void;
  showFullTimelineButton?: boolean;
}

export default function JourneyTogether({
  nodes,
  onStoryPress,
  onFullTimelinePress,
  showFullTimelineButton = true,
}: JourneyTogetherProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  return (
    <View style={styles.panel}>
      <LinearGradient
        colors={[
          JOURNEY_COLORS.panelStart,
          JOURNEY_COLORS.panelMiddle,
          JOURNEY_COLORS.panelEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.glow} />

      <View style={styles.header}>
        <View style={styles.headerActions}>
          <View style={styles.labelPill}>
            <Ionicons
              name="git-branch-outline"
              size={14}
              color={JOURNEY_COLORS.gold}
            />
            <Text style={styles.labelText}>Your journey</Text>
          </View>
          {showFullTimelineButton && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open full timeline"
              onPress={
                onFullTimelinePress ?? (() => router.push("/journey-timeline"))
              }
              style={({ pressed }) => [
                styles.fullButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.fullButtonText}>Full Timeline</Text>
              <Ionicons
                name="arrow-forward"
                size={17}
                color={JOURNEY_COLORS.cream}
              />
            </Pressable>
          )}
        </View>
        <Text style={styles.title}>Journey Together</Text>
        <Text style={styles.subtitle}>
          Turning points &amp; growth across the years
        </Text>
      </View>

      {nodes.length === 0 ? (
        <Text style={styles.emptyText}>
          Your journey stories will appear here.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timelineScroll}
          snapToInterval={250}
          decelerationRate="fast"
          disableIntervalMomentum
        >
          {nodes.map((node, index) => {
            const milestone = Boolean(node.isMilestone);
            return (
              <View key={node.id} style={styles.item}>
                <View style={styles.rail}>
                  <View
                    style={[
                      styles.nodeRing,
                      milestone && styles.milestoneNodeRing,
                    ]}
                  >
                    {milestone && <View style={styles.milestoneNodeCore} />}
                  </View>
                  {index < nodes.length - 1 && (
                    <View style={styles.dashedLine}>
                      {Array.from({ length: 7 }, (_, dashIndex) => (
                        <View key={dashIndex} style={styles.dash} />
                      ))}
                    </View>
                  )}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${node.year}, ${node.title}, with ${node.mentorName}. Read story`}
                  onPress={() => onStoryPress?.(node.memoryId)}
                  onFocus={() => setFocusedId(node.id)}
                  onBlur={() =>
                    setFocusedId((current) =>
                      current === node.id ? null : current
                    )
                  }
                  style={({ pressed }) => [
                    styles.card,
                    milestone && styles.milestoneCard,
                    focusedId === node.id && styles.focused,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.yearBadge,
                      milestone && styles.milestoneYearBadge,
                    ]}
                  >
                    {milestone && (
                      <Ionicons
                        name="star"
                        size={14}
                        color={JOURNEY_COLORS.gold}
                      />
                    )}
                    <Text
                      style={[
                        styles.year,
                        milestone && styles.milestoneYear,
                      ]}
                    >
                      {node.year}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {node.title}
                  </Text>
                  <View style={styles.mentorRow}>
                    <Ionicons
                      name="person-circle-outline"
                      size={17}
                      color={JOURNEY_COLORS.mentorText}
                    />
                    <Text style={styles.mentorName} numberOfLines={1}>
                      {node.mentorName}
                    </Text>
                  </View>
                  <Text style={styles.snippet} numberOfLines={2}>
                    {node.snippet}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    paddingTop: 24,
    paddingBottom: 24,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: JOURNEY_COLORS.panelStart,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8,
  },
  glow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 240, 154, 0.1)",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 2,
  },
  labelPill: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 240, 154, 0.35)",
    backgroundColor: "rgba(255, 240, 154, 0.14)",
  },
  labelText: {
    color: JOURNEY_COLORS.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  fullButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  fullButtonText: {
    color: JOURNEY_COLORS.cream,
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    maxWidth: 220,
    color: JOURNEY_COLORS.cream,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 40,
    marginTop: 4,
  },
  subtitle: {
    maxWidth: 245,
    color: JOURNEY_COLORS.mutedText,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 2,
  },
  timelineScroll: {
    paddingHorizontal: 20,
    paddingBottom: 2,
  },
  item: {
    width: 236,
    marginRight: 14,
  },
  rail: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  nodeRing: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  milestoneNodeRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderColor: "rgba(255, 240, 154, 0.4)",
    backgroundColor: "rgba(255, 240, 154, 0.14)",
    shadowColor: JOURNEY_COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
    elevation: 5,
  },
  milestoneNodeCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: JOURNEY_COLORS.gold,
  },
  dashedLine: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginLeft: 14,
  },
  dash: {
    width: 7,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  card: {
    minHeight: 188,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: JOURNEY_COLORS.cardBorder,
    backgroundColor: JOURNEY_COLORS.card,
    overflow: "hidden",
  },
  milestoneCard: {
    borderColor: JOURNEY_COLORS.milestoneBorder,
    borderTopWidth: 4,
    borderTopColor: JOURNEY_COLORS.gold,
    backgroundColor: JOURNEY_COLORS.milestoneCard,
  },
  focused: {
    borderWidth: 3,
    borderColor: JOURNEY_COLORS.gold,
  },
  pressed: {
    opacity: 0.84,
  },
  yearBadge: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(143, 211, 255, 0.12)",
    marginBottom: 10,
  },
  milestoneYearBadge: {
    backgroundColor: "rgba(255, 240, 154, 0.14)",
  },
  year: {
    color: JOURNEY_COLORS.yearText,
    fontSize: 15,
    fontWeight: "800",
  },
  milestoneYear: {
    color: JOURNEY_COLORS.gold,
  },
  cardTitle: {
    color: JOURNEY_COLORS.cardText,
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 24,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  mentorRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  mentorName: {
    flex: 1,
    color: JOURNEY_COLORS.mentorText,
    fontSize: 14,
    fontWeight: "700",
  },
  snippet: {
    color: JOURNEY_COLORS.snippetText,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  emptyText: {
    color: JOURNEY_COLORS.mutedText,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
});
