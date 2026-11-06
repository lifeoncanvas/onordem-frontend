import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Palette } from "@/constants/theme";

const TIMELINE_CARD_COLORS = {
  paper: Palette.surfaceCard,
  border: Palette.borderSubtle,
  title: Palette.textPrimary,
  year: Palette.accentSky,
  mentor: Palette.accentAmber,
  snippet: Palette.textSecondary,
  badge: Palette.surfaceElevated,
} as const;

export interface TimelineNode {
  year: string;
  title: string;
  subtitle: string;
  mentorName: string;
  isMilestone?: boolean;
}

interface TimelinePreviewProps {
  nodes: TimelineNode[];
  onViewFullPress?: () => void;
}

export default function TimelinePreview({
  nodes,
  onViewFullPress,
}: TimelinePreviewProps) {
  return (
    <View style={styles.wrapper}>
      {/* Deep black/charcoal gradient card background */}
      <LinearGradient
        colors={["#161616", "#101010", "#080808"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {/* Label pill with colorful icon */}
          <View style={styles.labelPill}>
            <Ionicons name="git-branch-outline" size={12} color={Palette.accentSky} />
            <Text style={styles.labelText}>YOUR JOURNEY</Text>
          </View>
          <Text style={styles.sectionTitle}>Journey Together</Text>
          <Text style={styles.sectionSubtitle}>
            Turning points &amp; growth across the years
          </Text>
        </View>

        <TouchableOpacity
          onPress={onViewFullPress}
          activeOpacity={0.75}
          style={styles.viewFullBtn}
        >
          <Text style={styles.viewFullText}>Full Timeline</Text>
          <Ionicons name="arrow-forward" size={13} color={Palette.accentSky} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Timeline */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineScroll}
      >
        {nodes.map((node, index) => {
          const isLast = index === nodes.length - 1;
          const isMilestone = node.isMilestone ?? false;

          return (
            <View key={`node-${index}`} style={styles.nodeWrapper}>
              {/* Track row: dot + connector */}
              <View style={styles.trackRow}>
                {/* Milestone outer ring */}
                <View style={[styles.dotRing, isMilestone && styles.dotRingMilestone]}>
                  {isMilestone && <View style={styles.dotPulse} />}
                  <View style={[styles.dotCore, isMilestone && styles.dotCoreMilestone]} />
                </View>

                {/* Connector */}
                {!isLast && (
                  <View style={styles.connectorTrack}>
                    {[...Array(6)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.connectorDash,
                          isMilestone && styles.connectorDashMilestone,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Node Card */}
              <View style={[styles.nodeCard, isMilestone && styles.nodeCardMilestone]}>
                {/* Year badge */}
                <View style={[styles.yearBadge, isMilestone && styles.yearBadgeMilestone]}>
                  {isMilestone && (
                    <Ionicons name="star" size={9} color={Palette.accentAmber} style={{ marginRight: 3 }} />
                  )}
                  <Text style={[styles.yearText, isMilestone && styles.yearTextMilestone]}>
                    {node.year}
                  </Text>
                </View>

                <Text style={styles.nodeTitle} numberOfLines={2}>
                  {node.title}
                </Text>

                <View style={styles.mentorRow}>
                  <Ionicons name="person-circle-outline" size={12} color={Palette.accentSky} />
                  <Text style={styles.nodeMentor} numberOfLines={1}>
                    {node.mentorName}
                  </Text>
                </View>

                <Text style={styles.nodeSubtitle} numberOfLines={2}>
                  {node.subtitle}
                </Text>

                <View
                  style={[
                    styles.cardAccentLine,
                    isMilestone && styles.cardAccentLineMilestone,
                  ]}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  labelPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  labelText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#E5E5E5",
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    lineHeight: 17,
  },
  viewFullBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginTop: 2,
  },
  viewFullText: {
    fontSize: 11.5,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* Timeline Scroll */
  timelineScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nodeWrapper: {
    width: 148,
    marginRight: 8,
  },

  /* Track */
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    height: 22,
  },
  dotRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  dotRingMilestone: {
    borderColor: Palette.accentSky,
    backgroundColor: "rgba(143, 211, 255, 0.12)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  dotPulse: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(143, 211, 255, 0.22)",
  },
  dotCore: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
  },
  dotCoreMilestone: {
    backgroundColor: Palette.accentSky,
  },
  connectorTrack: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginLeft: 4,
  },
  connectorDash: {
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  connectorDashMilestone: {
    backgroundColor: "rgba(0, 210, 211, 0.4)",
  },

  /* Node Card */
  nodeCard: {
    backgroundColor: TIMELINE_CARD_COLORS.paper,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TIMELINE_CARD_COLORS.border,
    padding: 13,
    position: "relative",
    overflow: "hidden",
  },
  nodeCardMilestone: {
    borderColor: "rgba(0, 210, 211, 0.35)",
  },
  yearBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: TIMELINE_CARD_COLORS.badge,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
    marginBottom: 7,
  },
  yearBadgeMilestone: {
    backgroundColor: "rgba(0, 210, 211, 0.15)",
  },
  yearText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: TIMELINE_CARD_COLORS.year,
    letterSpacing: 0.3,
  },
  yearTextMilestone: {
    color: "#00D2D3",
    fontWeight: "800",
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: TIMELINE_CARD_COLORS.title,
    lineHeight: 18,
    marginBottom: 5,
    letterSpacing: -0.1,
  },
  mentorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 5,
  },
  nodeMentor: {
    fontSize: 10.5,
    color: TIMELINE_CARD_COLORS.mentor,
    fontWeight: "700",
    flex: 1,
  },
  nodeSubtitle: {
    fontSize: 11,
    lineHeight: 15.5,
    color: TIMELINE_CARD_COLORS.snippet,
    fontWeight: "500",
  },
  cardAccentLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  cardAccentLineMilestone: {
    backgroundColor: "#00D2D3",
    opacity: 0.7,
  },
});
