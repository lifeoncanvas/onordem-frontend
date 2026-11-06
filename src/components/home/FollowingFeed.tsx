/**
 * Home feed: your posts and posts from people you follow, newest first, shown as a
 * short collage (same design as the memory wall). "See All" expands it in place.
 *
 * Tapping a tile opens your own post, or the author's profile for someone else's.
 */
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Layout, Palette, SystemColors, TextStyles } from "@/constants/theme";
import { getFeed, type FeedPost } from "@/services/feedService";
import { followService } from "@/services/followService";
import { memoryService } from "@/services/memoryService";
import { userProfileService } from "@/services/userProfileService";
import { useT } from "@/i18n";
import type { MemoryData } from "./MemoryCard";
import MemoryCollage from "./MemoryCollage";
import SectionHeader from "./SectionHeader";

/** How many posts the compact collage shows before "See All". */
const COMPACT_COUNT = 5;

export default function FollowingFeed() {
  const t = useT();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const refresh = () => setPosts(getFeed(userProfileService.getProfile()));
    const unsubs = [
      followService.subscribe(refresh),
      memoryService.subscribe(refresh),
      userProfileService.subscribe(refresh),
    ];
    Promise.all([followService.initialize(), userProfileService.initialize()])
      .then(refresh)
      .catch(refresh);
    return () => unsubs.forEach((u) => u());
  }, []);

  const shown = expanded ? posts : posts.slice(0, COMPACT_COUNT);
  const youLabel = t("home.feed.you");

  // Collage tiles, each labelled with who posted it.
  const { tiles, byKey } = useMemo(() => {
    const map = new Map<string, FeedPost>();
    const list: MemoryData[] = shown.map((post) => {
      map.set(post.key, post);
      return {
        ...post.memory,
        id: post.key,
        byline: post.author.isMe ? youLabel : post.author.name,
      };
    });
    return { tiles: list, byKey: map };
  }, [shown, youLabel]);

  const open = (tile: MemoryData) => {
    const post = byKey.get(tile.id);
    if (!post) return;
    if (post.wallItemId) {
      router.push({ pathname: "/memory-detail/[id]", params: { id: post.wallItemId } });
    } else {
      router.push({ pathname: "/people/[id]", params: { id: post.author.id } });
    }
  };

  const hasMore = posts.length > COMPACT_COUNT;

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t("home.feed.title")}
        subtitle={t("home.feed.subtitle")}
        actionLabel={hasMore && !expanded ? t("common.seeAll") : undefined}
        onActionPress={hasMore && !expanded ? () => setExpanded(true) : undefined}
        isDark
      />

      {posts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={30} color={Palette.textMuted} />
          <Text style={styles.emptyTitle}>{t("home.feed.empty.title")}</Text>
          <Text style={styles.emptyBody}>{t("home.feed.empty.body")}</Text>
          <Pressable
            onPress={() => router.push("/upload-memory")}
            style={styles.emptyButton}
            accessibilityRole="button"
          >
            <Ionicons name="add" size={18} color={SystemColors.inverseLabel} />
            <Text style={styles.emptyButtonText}>{t("home.feed.empty.action")}</Text>
          </Pressable>
        </View>
      ) : (
        <MemoryCollage memories={tiles} onOpen={open} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 8, marginBottom: 20 },
  empty: {
    marginHorizontal: Layout.margin,
    alignItems: "center",
    gap: 6,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: SystemColors.secondarySystemBackground,
  },
  emptyTitle: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.label, marginTop: 4 },
  emptyBody: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: Palette.textMuted, textAlign: "center" },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    minHeight: Layout.minTouch,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: SystemColors.label,
  },
  emptyButtonText: {
    ...TextStyles.subheadline,
    fontFamily: AppFonts.body,
    fontWeight: "600",
    color: SystemColors.inverseLabel,
  },
});
