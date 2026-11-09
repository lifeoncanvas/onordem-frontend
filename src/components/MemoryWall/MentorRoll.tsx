import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, getCategoryAccent, Palette } from "@/constants/theme";
import { WallMentorProfile } from "@/types/memoryWall";

interface MentorRollProps {
  mentors: WallMentorProfile[];
  onMentorPress: (mentor: WallMentorProfile) => void;
  onAddMentorPress?: () => void;
  onSendThanks?: (mentor: WallMentorProfile) => void;
}

function getInitials(name: string): string {
  const parts = name.replace(/^(Mrs\.|Mr\.|Dr\.|Prof\.)\s+/i, "").trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const PASTEL_ACCENTS = [
  Palette.accentSky,
  Palette.accentMint,
  Palette.accentLavender,
  Palette.accentPink,
  Palette.accentPeach,
];

export default function MentorRoll({
  mentors,
  onMentorPress,
  onAddMentorPress,
  onSendThanks,
}: MentorRollProps) {
  const handleThanks = (mentor: WallMentorProfile) => {
    if (onSendThanks) {
      onSendThanks(mentor);
    } else {
      Alert.alert(
        "Send Thanks",
        `A thank-you note draft to ${mentor.name} has been created.`,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Your Mentors</Text>
          <Text style={styles.sectionSubtitle}>The people who shaped you.</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{mentors.length} people</Text>
        </View>
      </View>

      {/* 2-Column Responsive Grid */}
      <View style={styles.grid}>
        {mentors.map((mentor, idx) => {
          const initials = getInitials(mentor.name);
          const accentColor = PASTEL_ACCENTS[idx % PASTEL_ACCENTS.length];
          const quoteText =
            mentor.meaningfulQuote ||
            mentor.description ||
            "Guiding with patience and unwavering belief.";

          return (
            <TouchableOpacity
              key={mentor.id}
              onPress={() => onMentorPress(mentor)}
              activeOpacity={0.92}
              style={styles.card}
              accessibilityRole="button"
              accessibilityLabel={`${mentor.name} profile card`}
            >
              {/* Header Top Accent Bar */}
              <View style={[styles.cardHeaderAccent, { backgroundColor: `${accentColor}25` }]}>
                <View style={[styles.accentPill, { backgroundColor: `${accentColor}35` }]}>
                  <Ionicons
                    name={(mentor.traitIcon as any) || "sparkles"}
                    size={11}
                    color={accentColor}
                  />
                  <Text style={[styles.traitPillText, { color: accentColor }]} numberOfLines={1}>
                    {mentor.trait || "Mentor"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Memory Cycled", `Showing another memory for ${mentor.name}`)
                  }
                  style={styles.flipBtn}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Cycle memory"
                >
                  <Ionicons name="sync-outline" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Initials Avatar Ring */}
              <View style={styles.avatarWrap}>
                <View style={[styles.avatarHalo, { borderColor: `${accentColor}60` }]}>
                  <View style={[styles.avatarCircle, { backgroundColor: `${accentColor}20` }]}>
                    <Text style={[styles.avatarInitials, { color: accentColor }]}>
                      {initials}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                {/* Mentor Name */}
                <Text style={styles.mentorName} numberOfLines={2}>
                  {mentor.name}
                </Text>

                {/* Role Pill */}
                <View style={styles.rolePill}>
                  <Text style={styles.mentorRole} numberOfLines={1}>
                    {mentor.relationship || "Guide"}
                  </Text>
                </View>

                {/* Duration */}
                <Text style={styles.mentorDuration} numberOfLines={1}>
                  {mentor.duration || "Guided you for years"}
                </Text>

                {/* "The lesson I carry" label */}
                <View style={styles.lessonHeadingRow}>
                  <Ionicons name="bookmark-outline" size={11} color={accentColor} />
                  <Text style={[styles.lessonLabel, { color: accentColor }]}>
                    The lesson I carry
                  </Text>
                </View>

                {/* Quote */}
                <Text style={styles.quote} numberOfLines={3}>
                  “{quoteText}”
                </Text>
              </View>

              {/* Inset Divider */}
              <View style={styles.divider} />

              {/* Memory Counter */}
              <View style={styles.memoryCountRow}>
                <Ionicons name="book-outline" size={12} color={Palette.textSecondary} />
                <Text style={styles.memoryCountText}>
                  {mentor.itemCount || 4} memories
                </Text>
              </View>

              {/* "Send thanks" Button */}
              <TouchableOpacity
                onPress={() => handleThanks(mentor)}
                activeOpacity={0.8}
                style={styles.sendThanksBtn}
                accessibilityRole="button"
                accessibilityLabel={`Send thanks to ${mentor.name}`}
              >
                <Ionicons name="heart" size={12} color="#000000" />
                <Text style={styles.sendThanksText}>Send thanks</Text>
              </TouchableOpacity>

              {/* Last Thanked Footnote */}
              <Text style={styles.lastThankedText}>
                {mentor.lastThanked || "Last thanked recently"}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Dashed "Add a mentor" Card */}
        {onAddMentorPress && (
          <TouchableOpacity
            onPress={onAddMentorPress}
            activeOpacity={0.82}
            style={styles.addCard}
            accessibilityRole="button"
            accessibilityLabel="Add a mentor"
          >
            <View style={styles.addIconCircle}>
              <Ionicons name="add" size={22} color={Palette.accentSky} />
            </View>
            <Text style={styles.addTitle}>Add a mentor</Text>
            <Text style={styles.addSubtitle}>Honor someone who helped you grow</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: AppFonts.displaySans,
    fontSize: 21,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontFamily: AppFonts.body,
    fontSize: 12.5,
    color: Palette.textSecondary,
    fontWeight: "400",
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  countBadgeText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: "600",
  },

  // Responsive 2-column layout
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  card: {
    width: "48.2%",
    borderRadius: 22,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.16)",
    display: "flex",
    flexDirection: "column",
  },
  cardHeaderAccent: {
    height: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  accentPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    maxWidth: "76%",
  },
  traitPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  flipBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: {
    marginTop: -24,
    alignSelf: "center",
    zIndex: 2,
  },
  avatarHalo: {
    padding: 3,
    borderRadius: 34,
    borderWidth: 2,
    backgroundColor: "#161616",
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: AppFonts.displaySans,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
    alignItems: "center",
    flexGrow: 1,
  },
  mentorName: {
    fontFamily: AppFonts.displaySans,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 4,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 4,
  },
  mentorRole: {
    fontFamily: AppFonts.body,
    fontSize: 11,
    color: Palette.textSecondary,
    fontWeight: "600",
    textAlign: "center",
  },
  mentorDuration: {
    fontFamily: AppFonts.body,
    fontSize: 11,
    color: Palette.textMuted,
    textAlign: "center",
    marginBottom: 8,
  },
  lessonHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  lessonLabel: {
    fontFamily: AppFonts.displaySans,
    fontSize: 10.5,
    fontWeight: "700",
    textAlign: "center",
  },
  quote: {
    fontFamily: AppFonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: "#CCCCCC",
    textAlign: "center",
    paddingHorizontal: 2,
  },
  divider: {
    width: "86%",
    alignSelf: "center",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 8,
  },
  memoryCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 8,
  },
  memoryCountText: {
    fontSize: 11,
    color: Palette.textSecondary,
    fontWeight: "500",
  },
  sendThanksBtn: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 10,
    paddingVertical: 7.5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.15)",
  },
  sendThanksText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
  },
  lastThankedText: {
    fontSize: 10,
    color: Palette.textMuted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  addCard: {
    width: "48.2%",
    minHeight: 220,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(255, 255, 255, 0.14)",
    backgroundColor: "#161616",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  addIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(143, 211, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  addTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 3,
    textAlign: "center",
  },
  addSubtitle: {
    fontSize: 10.5,
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 14,
  },
});
