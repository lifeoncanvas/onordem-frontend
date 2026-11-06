/**
 * Another person's public profile: who they are, their counts, a Follow button,
 * and the tributes they've shared publicly.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Layout, Palette, SystemColors, TextStyles } from "@/constants/theme";
import { followService } from "@/services/followService";
import FollowButton, { useIsFollowing } from "@/components/FollowButton";
import MemoryCollage from "@/components/home/MemoryCollage";

const CONTENT_MAX_WIDTH = 760;

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export default function PersonProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const personId = Array.isArray(id) ? id[0] : id ?? "";

  // Follow state as an explicit input, so the follower count recomputes
  // (the React Compiler would otherwise cache a plain service call).
  const isFollowing = useIsFollowing(personId);

  const person = followService.getPerson(personId);
  const tributes = person ? followService.getPersonTributes(person.id) : [];

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  const topBar = (
    <View style={styles.topBar}>
      <Pressable
        onPress={goBack}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Ionicons name="chevron-back" size={26} color={SystemColors.label} />
      </Pressable>
      <Text style={styles.topBarTitle} numberOfLines={1}>
        {person ? `@${person.username}` : ""}
      </Text>
      <View style={styles.iconButton} />
    </View>
  );

  if (!person) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {topBar}
        <View style={styles.missing}>
          <Ionicons name="person-outline" size={36} color={Palette.textMuted} />
          <Text style={styles.missingTitle}>This profile isn&apos;t available</Text>
          <Text style={styles.missingBody}>The account may have been removed or made private.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = [
    { label: tributes.length === 1 ? "Tribute" : "Tributes", value: tributes.length },
    { label: "Followers", value: person.followerCount + (isFollowing ? 1 : 0) },
    { label: "Following", value: person.followingCount },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {topBar}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          {/* Identity */}
          <View style={styles.header}>
            <Image
              source={{ uri: person.avatar }}
              style={styles.avatar}
              contentFit="cover"
              accessibilityLabel={`${person.name}'s profile photo`}
            />
            <View style={styles.stats}>
              {stats.map((stat) => (
                <View
                  key={stat.label}
                  style={styles.stat}
                  accessible
                  accessibilityLabel={`${stat.value} ${stat.label}`}
                >
                  <Text style={styles.statValue}>{formatCount(stat.value)}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.name} accessibilityRole="header">
            {person.name}
          </Text>
          <Text style={styles.role}>{person.role}</Text>
          {person.bio ? <Text style={styles.bio}>{person.bio}</Text> : null}

          <FollowButton person={person} block style={styles.followButton} />

          {/* Tributes */}
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Tributes
          </Text>
        </View>

        {tributes.length > 0 ? (
          <View style={styles.collageWrap}>
            <MemoryCollage memories={tributes} />
          </View>
        ) : (
          <View style={[styles.content, styles.emptyWrap]}>
            <View style={styles.empty}>
              <Ionicons name="images-outline" size={28} color={Palette.textMuted} />
              <Text style={styles.emptyText}>
                {person.name.split(" ")[0]} hasn&apos;t shared any public tributes yet.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: SystemColors.systemBackground },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: Layout.margin / 2,
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH + Layout.margin * 2,
    alignSelf: "center",
  },
  iconButton: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.label, flex: 1, textAlign: "center" },

  scroll: { paddingBottom: 48 },
  content: {
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: Layout.margin,
  },
  collageWrap: { width: "100%", maxWidth: CONTENT_MAX_WIDTH + Layout.margin * 2, alignSelf: "center" },

  header: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 8 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: SystemColors.tertiarySystemBackground,
  },
  stats: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  stat: { alignItems: "center", minWidth: 64 },
  statValue: { ...TextStyles.title3, fontFamily: AppFonts.displaySans, color: SystemColors.label, fontVariant: ["tabular-nums"] },
  statLabel: { ...TextStyles.footnote, fontFamily: AppFonts.body, color: Palette.textMuted, marginTop: 2 },

  name: { ...TextStyles.title2, fontFamily: AppFonts.displaySans, color: SystemColors.label, marginTop: 16 },
  role: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: Palette.textMuted, marginTop: 2 },
  bio: { ...TextStyles.body, fontFamily: AppFonts.body, color: SystemColors.label, marginTop: 10 },
  followButton: { marginTop: 16, minHeight: 44 },

  sectionTitle: {
    ...TextStyles.title3,
    fontFamily: AppFonts.displaySans,
    color: SystemColors.label,
    marginTop: 32,
    marginBottom: 12,
  },

  emptyWrap: { paddingHorizontal: Layout.margin },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: SystemColors.secondarySystemBackground,
  },
  emptyText: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: Palette.textMuted, textAlign: "center" },

  missing: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 32 },
  missingTitle: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.label },
  missingBody: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: Palette.textMuted, textAlign: "center" },
});
