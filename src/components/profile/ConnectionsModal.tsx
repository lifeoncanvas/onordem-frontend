/**
 * Connections sheet: Followers · Following · Suggested, with search.
 *
 * - Rows open the person's profile; the Follow button is a sibling, not nested.
 * - Followers you don't follow yet get "Follow Back".
 * - The Suggested list is captured when the sheet opens, so following someone
 *   flips their button to "Following" instead of yanking the row away.
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AppFonts, Layout, Palette, SystemColors, TextStyles } from "@/constants/theme";
import { followService, type UserConnection } from "@/services/followService";
import FollowButton from "@/components/FollowButton";
import { useT, type StringKey } from "@/i18n";

export type ConnectionsTab = "followers" | "following" | "suggested";

interface ConnectionsModalProps {
  visible: boolean;
  initialTab?: ConnectionsTab;
  onClose: () => void;
  onConnectionsChanged?: () => void;
}

interface Row {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  /** Shown under the name on Suggested rows ("Follows you", …). */
  reason?: string;
}

const TABS: { id: ConnectionsTab; labelKey: StringKey }[] = [
  { id: "followers", labelKey: "connections.followers" },
  { id: "following", labelKey: "connections.following" },
  { id: "suggested", labelKey: "connections.suggested" },
];

const EMPTY_COPY: Record<ConnectionsTab, { title: StringKey; body: StringKey }> = {
  followers: { title: "connections.empty.followers.title", body: "connections.empty.followers.body" },
  following: { title: "connections.empty.following.title", body: "connections.empty.following.body" },
  suggested: { title: "connections.empty.suggested.title", body: "connections.empty.suggested.body" },
};

const toRow = (u: UserConnection): Row => ({
  id: u.id,
  name: u.name,
  username: u.username,
  avatar: u.avatar,
  role: u.role,
});

export default function ConnectionsModal({
  visible,
  initialTab = "followers",
  onClose,
  onConnectionsChanged,
}: ConnectionsModalProps) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<ConnectionsTab>(initialTab);
  const [query, setQuery] = useState("");
  const [followers, setFollowers] = useState<Row[]>(() => followService.getFollowers().map(toRow));
  const [following, setFollowing] = useState<Row[]>(() => followService.getFollowing().map(toRow));
  const [suggested, setSuggested] = useState<Row[]>([]);

  // Reset to the requested tab and a fresh suggestion list each time the sheet opens.
  // (Adjusting state during render when a prop changes, per React docs.)
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setActiveTab(initialTab);
      setQuery("");
      setSuggested(
        followService.getSuggestions(20).map((p) => ({
          id: p.id,
          name: p.name,
          username: p.username,
          avatar: p.avatar,
          role: p.role,
          reason: p.suggestionReason,
        }))
      );
    }
  }

  useEffect(() => {
    const sync = () => {
      setFollowers(followService.getFollowers().map(toRow));
      setFollowing(followService.getFollowing().map(toRow));
    };
    const unsubscribe = followService.subscribe(() => {
      sync();
      onConnectionsChanged?.();
    });
    followService.initialize().then(sync);
    return unsubscribe;
  }, [onConnectionsChanged]);

  const counts: Record<ConnectionsTab, number> = {
    followers: followers.length,
    following: following.length,
    suggested: suggested.length,
  };

  const rows = useMemo(() => {
    const source =
      activeTab === "followers" ? followers : activeTab === "following" ? following : suggested;
    const uniqueMap = new Map<string, Row>();
    for (const item of source) {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    }
    const uniqueRows = Array.from(uniqueMap.values());
    const q = query.trim().toLowerCase();
    if (!q) return uniqueRows;
    return uniqueRows.filter((r) =>
      [r.name, r.username, r.role].some((field) => field.toLowerCase().includes(q))
    );
  }, [activeTab, followers, following, suggested, query]);

  const openProfile = (row: Row) => {
    onClose();
    // Mentors (m1, m2, …) have their own profile page; everyone else is a community member.
    if (/^m\d+$/.test(row.id)) {
      router.push({ pathname: "/mentor-profile/[id]", params: { id: row.id } });
    } else {
      router.push({ pathname: "/people/[id]", params: { id: row.id } });
    }
  };

  const renderRow = ({ item }: { item: Row }) => (
    <View style={styles.row}>
      <Pressable
        onPress={() => openProfile(item)}
        style={({ pressed }) => [styles.rowOpen, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, @${item.username}, ${item.reason ?? item.role}`}
        accessibilityHint="Opens their profile"
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
        <View style={styles.rowText}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.rowSub} numberOfLines={1}>
            {item.reason ?? `@${item.username} · ${item.role}`}
          </Text>
        </View>
      </Pressable>
      <FollowButton
        person={item}
        size="small"
        followLabel={activeTab === "followers" ? t("follow.followBack") : undefined}
      />
    </View>
  );

  const empty = query.trim()
    ? {
        title: t("connections.noResults.title", { query: query.trim() }),
        body: t("connections.noResults.body"),
      }
    : { title: t(EMPTY_COPY[activeTab].title), body: t(EMPTY_COPY[activeTab].body) };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close connections"
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.grabber} />

          {/* Title bar */}
          <View style={styles.titleBar}>
            <View style={styles.titleSide} />
            <Text style={styles.title} accessibilityRole="header">
              {t("connections.title")}
            </Text>
            <Pressable
              onPress={onClose}
              style={[styles.titleSide, styles.doneButton]}
              accessibilityRole="button"
            >
              <Text style={styles.doneText}>{t("common.done")}</Text>
            </Pressable>
          </View>

          {/* Segmented control */}
          <View style={styles.segmented} accessibilityRole="tablist">
            {TABS.map((tab) => {
              const selected = tab.id === activeTab;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[styles.segment, selected && styles.segmentSelected]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${t(tab.labelKey)}, ${counts[tab.id]}`}
                >
                  <Text style={[styles.segmentText, selected && styles.segmentTextSelected]} numberOfLines={1}>
                    {t(tab.labelKey)}
                    <Text style={styles.segmentCount}> {counts[tab.id]}</Text>
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Search */}
          <View style={styles.search}>
            <Ionicons name="search" size={16} color={SystemColors.secondaryLabel} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t("common.search")}
              placeholderTextColor={SystemColors.secondaryLabel}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel={`Search ${activeTab}`}
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery("")}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={17} color={SystemColors.secondaryLabel} />
              </Pressable>
            )}
          </View>

          <FlatList
            data={rows}
            keyExtractor={(item) => item.id}
            renderItem={renderRow}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons
                  name={query.trim() ? "search" : "people-outline"}
                  size={36}
                  color={Palette.textMuted}
                />
                <Text style={styles.emptyTitle}>{empty.title}</Text>
                <Text style={styles.emptyBody}>{empty.body}</Text>
                {!query.trim() && activeTab === "following" && (
                  <Pressable
                    onPress={() => setActiveTab("suggested")}
                    style={styles.emptyAction}
                    accessibilityRole="button"
                  >
                    <Text style={styles.emptyActionText}>{t("connections.seeSuggested")}</Text>
                  </Pressable>
                )}
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", alignItems: "center" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0, 0, 0, 0.6)" },
  sheet: {
    width: "100%",
    maxWidth: 600,
    height: "86%",
    backgroundColor: SystemColors.secondarySystemBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: SystemColors.tertiaryLabel,
    marginTop: 6,
  },

  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: Layout.margin,
  },
  titleSide: { width: 64 },
  title: {
    ...TextStyles.headline,
    fontFamily: AppFonts.body,
    color: SystemColors.label,
    flex: 1,
    textAlign: "center",
  },
  doneButton: { height: Layout.minTouch, alignItems: "flex-end", justifyContent: "center" },
  doneText: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.blue },

  segmented: {
    flexDirection: "row",
    marginHorizontal: Layout.margin,
    padding: 2,
    borderRadius: 9,
    backgroundColor: SystemColors.tertiarySystemFill,
  },
  segment: {
    flex: 1,
    minHeight: 32,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  segmentSelected: { backgroundColor: "#636366" },
  segmentText: {
    ...TextStyles.footnote,
    fontFamily: AppFonts.body,
    fontWeight: "500",
    color: SystemColors.label,
  },
  segmentTextSelected: { fontWeight: "600" },
  segmentCount: { color: SystemColors.secondaryLabel, fontWeight: "400" },

  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: Layout.margin,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 10,
    backgroundColor: SystemColors.tertiarySystemFill,
  },
  searchInput: {
    flex: 1,
    ...TextStyles.body,
    fontFamily: AppFonts.body,
    color: SystemColors.label,
    paddingVertical: 0,
  },

  listContent: { paddingHorizontal: Layout.margin, paddingTop: 8, paddingBottom: 24, flexGrow: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64 },
  rowOpen: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  pressed: { opacity: 0.7 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SystemColors.tertiarySystemBackground,
  },
  rowText: { flex: 1 },
  rowName: { ...TextStyles.subheadline, fontFamily: AppFonts.body, fontWeight: "600", color: SystemColors.label },
  rowSub: { ...TextStyles.footnote, fontFamily: AppFonts.body, color: Palette.textMuted, marginTop: 1 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: SystemColors.separator, marginLeft: 60 },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 24, gap: 6 },
  emptyTitle: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.label, textAlign: "center", marginTop: 6 },
  emptyBody: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: Palette.textMuted, textAlign: "center" },
  emptyAction: { marginTop: 12, minHeight: Layout.minTouch, justifyContent: "center", paddingHorizontal: 12 },
  emptyActionText: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.blue },
});
