import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "@/components/home/BottomNavigation";
import { AppFonts, MaxContentWidth, Palette, SystemColors, TextStyles, Layout } from "@/constants/theme";
import { memoryService } from "@/services/memoryService";
import { storyBookmarkService } from "@/services/storyBookmarkService";
import { tributeDraftService } from "@/services/tributeDraftService";
import { UserProfile, userProfileService } from "@/services/userProfileService";
import { followService } from "@/services/followService";
import ConnectionsModal, { type ConnectionsTab } from "@/components/profile/ConnectionsModal";
import VideoUploadModal from "@/components/Create/VideoUploadModal";
import { signOut } from "@/services/auth";
import MemoryCollage from "@/components/home/MemoryCollage";
import { wallItemToMemory } from "@/services/feedService";
import type { WallItem } from "@/types/memoryWall";
import { useT } from "@/i18n";

export default function ProfileScreen() {
  const t = useT();
  const [profile, setProfile] = useState<UserProfile>(() =>
    userProfileService.getProfile()
  );
  const [items, setItems] = useState<WallItem[]>(() =>
    memoryService.getUserCreatedItems()
  );
  const [isLoading, setIsLoading] = useState(true);
  // Falls back to initials if the photo can't load (e.g. an expired browser blob: link).
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Social Connections & Video Modals
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [connectionsTab, setConnectionsTab] = useState<ConnectionsTab>("followers");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const unsub = userProfileService.subscribe((nextProfile) => setProfile(nextProfile));
    return () => unsub();
  }, []);

  const refreshConnections = () => {
    setFollowersCount(followService.getFollowers().length);
    setFollowingCount(followService.getFollowing().length);
  };

  useEffect(() => {
    const syncItems = () => setItems(memoryService.getUserCreatedItems());
    const unsubscribeMemory = memoryService.subscribe(syncItems);
    const unsubscribeTributes = tributeDraftService.subscribe(syncItems);
    const unsubscribeFollow = followService.subscribe(refreshConnections);

    let mounted = true;
    Promise.all([
      memoryService.initialize(),
      userProfileService.initialize(),
      tributeDraftService.initialize(),
      storyBookmarkService.initialize(),
      followService.initialize(),
    ])
      .then(() => {
        if (!mounted) return;
        setProfile(userProfileService.getProfile());
        memoryService.getAllMemories();
        syncItems();
        refreshConnections();
        setLoadError(null);
      })
      .catch((error: unknown) => {
        console.error("Unable to load profile data:", error);
        if (mounted) setLoadError("Some profile information could not be loaded.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
      unsubscribeMemory();
      unsubscribeTributes();
      unsubscribeFollow();
    };
  }, []);

  // Everything you have posted, newest first (the same posts your followers see).
  const myPosts = useMemo(
    () => items.map(wallItemToMemory).sort((x, y) => (y.createdAt ?? "").localeCompare(x.createdAt ?? "")),
    [items]
  );

  const draftsCount = useMemo(() => {
    return tributeDraftService.getDrafts().length;
  }, [items]);

  const [selectedPost, setSelectedPost] = useState<{ id: string; title: string; mentorName?: string } | null>(null);

  const openMemoryById = (id: string) => {
    const found = items.find((i) => i.id === id);
    const title = found?.mentorName ? `Keepsake for ${found.mentorName}` : "Your keepsake post";
    setSelectedPost({ id, title, mentorName: found?.mentorName });
  };

  const handleDeletePost = (id: string) => {
    const doDelete = () => {
      memoryService.deleteMemory(id);
      setItems(memoryService.getUserCreatedItems());
      setSelectedPost(null);
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm) {
        if (window.confirm("Are you sure you want to permanently delete this post?")) {
          doDelete();
        }
      } else {
        doDelete();
      }
    } else {
      Alert.alert(
        "Delete Post",
        "Are you sure you want to permanently delete this post?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: doDelete },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={SystemColors.systemBackground} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))}
          style={styles.headerIcon}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={SystemColors.blue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">{t("profile.title")}</Text>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={styles.headerIcon}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Ionicons name="settings-outline" size={22} color={SystemColors.blue} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loadError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={SystemColors.red} />
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        )}

        {/* ======================================================== */}
        {/* 1. IDENTITY: photo, counts, name, bio, actions           */}
        {/* ======================================================== */}
        <View style={styles.igHeader}>
          <TouchableOpacity
            onPress={() => router.push("/profile-edit")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
          >
            {profile.avatarUri && !avatarFailed ? (
              <Image
                source={{ uri: profile.avatarUri }}
                style={styles.igAvatar}
                resizeMode="cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <View style={[styles.igAvatar, styles.igAvatarFallback]}>
                <Text style={styles.igAvatarInitials}>{getInitials(profile.name)}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.igStats}>
            <ProfileStat value={myPosts.length} label={myPosts.length === 1 ? t("profile.post") : t("profile.posts")} />
            <ProfileStat
              value={followersCount}
              label={t("profile.followers")}
              onPress={() => {
                setConnectionsTab("followers");
                setIsConnectionsOpen(true);
              }}
            />
            <ProfileStat
              value={followingCount}
              label={t("profile.following")}
              onPress={() => {
                setConnectionsTab("following");
                setIsConnectionsOpen(true);
              }}
            />
          </View>
        </View>

        <Text style={styles.igName} numberOfLines={1}>
          {profile.name}
        </Text>
        <Text style={styles.igUsername}>@{profile.username}</Text>
        {profile.bio ? <Text style={styles.igBio}>{profile.bio}</Text> : null}

        <View style={styles.igButtons}>
          <TouchableOpacity
            style={styles.igButton}
            onPress={() => router.push("/profile-edit")}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.igButtonText}>{t("profile.editProfile")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.igButton}
            onPress={() => router.push("/settings")}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={16} color={SystemColors.label} />
            <Text style={styles.igButtonText}>{t("profile.settings")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.igIconButton}
            onPress={() => {
              setConnectionsTab("suggested");
              setIsConnectionsOpen(true);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t("profile.findPeople")}
          >
            <Ionicons name="person-add-outline" size={18} color={SystemColors.label} />
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* 2. YOUR POSTS                                            */}
        {/* ======================================================== */}
        <View style={styles.postsHeader}>
          <Text style={styles.sectionHeaderTitle}>{t("profile.yourPosts")}</Text>
          <TouchableOpacity
            onPress={() => router.push("/upload-memory")}
            style={styles.quickCreateBtn}
            accessibilityRole="button"
            accessibilityLabel="New post"
          >
            <Ionicons name="add" size={18} color={SystemColors.blue} />
            <Text style={styles.quickCreateText}>{t("common.new")}</Text>
          </TouchableOpacity>
        </View>
        {myPosts.length > 0 ? (
          <View style={styles.postsCollage}>
            <MemoryCollage memories={myPosts} onOpen={(m) => openMemoryById(m.id)} />
          </View>
        ) : (
          <View style={styles.postsEmpty}>
            <Ionicons name="images-outline" size={30} color={Palette.textMuted} />
            <Text style={styles.postsEmptyTitle}>{t("profile.empty.title")}</Text>
            <Text style={styles.postsEmptyBody}>
              {t("profile.empty.body")}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/upload-memory")}
              style={styles.postsEmptyButton}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Ionicons name="add" size={18} color={SystemColors.inverseLabel} />
              <Text style={styles.postsEmptyButtonText}>{t("profile.empty.action")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Menu Navigation items */}
        <View style={styles.menuCardsContainer}>
          <View style={styles.menuGroup}>
          <PastelMenuCard
            badgeBg={SystemColors.yellow}
            icon="time"
            title={draftsCount ? t("profile.draftsCount", { count: draftsCount }) : t("profile.drafts")}
            subtitle={t("profile.drafts.sub")}
            onPress={() => router.push("/saved-items")}
          />
          <View style={styles.menuSeparator} />
          <PastelMenuCard
            badgeBg={Palette.accentMint}
            icon="bookmark"
            title={t("profile.savedItems")}
            subtitle={t("profile.savedItems.sub")}
            onPress={() => router.push("/saved-items")}
          />
          <View style={styles.menuSeparator} />
          <PastelMenuCard
            badgeBg={Palette.accentSky}
            icon="settings-outline"
            title={t("profile.settings")}
            subtitle={t("profile.settings.sub")}
            onPress={() => router.push("/settings")}
          />
          </View>

          {/* Quick Sign Out Action */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={async () => {
              try {
                await signOut();
                router.replace("/login");
              } catch (err) {
                console.warn("Sign out:", err);
                router.replace("/login");
              }
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sign out of account"
          >
            <Ionicons name="log-out-outline" size={20} color={SystemColors.red} />
            <Text style={styles.signOutText}>{t("profile.signOut")}</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <ActivityIndicator color={SystemColors.secondaryLabel} style={{ marginTop: 20 }} />
        )}
      </ScrollView>

      {/* Floating Bottom Navigation Bar (Active: Profile) */}
      <BottomNavigation activeTab="profile" />

      {/* Connections Modal */}
      <ConnectionsModal
        visible={isConnectionsOpen}
        initialTab={connectionsTab}
        onClose={() => setIsConnectionsOpen(false)}
        onConnectionsChanged={refreshConnections}
      />

      {/* Video Upload Modal */}
      <VideoUploadModal
        visible={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSuccess={() => setItems(memoryService.getUserCreatedItems())}
      />

      {/* Post Action Sheet Modal */}
      <Modal
        visible={!!selectedPost}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPost(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedPost(null)}
        >
          <View style={styles.actionSheetCard}>
            <View style={styles.sheetHandle} />
            <Text style={styles.actionSheetTitle} numberOfLines={1}>
              {selectedPost?.title || "Post Options"}
            </Text>
            {selectedPost?.mentorName ? (
              <Text style={styles.actionSheetSub}>For {selectedPost.mentorName}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.actionSheetBtn}
              onPress={() => {
                const id = selectedPost?.id;
                setSelectedPost(null);
                if (id) router.push({ pathname: "/memory-detail/[id]", params: { id } });
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View post"
            >
              <Ionicons name="eye-outline" size={20} color={SystemColors.label} />
              <Text style={styles.actionSheetBtnText}>View Post</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionSheetBtn, styles.actionSheetDeleteBtn]}
              onPress={() => {
                if (selectedPost) handleDeletePost(selectedPost.id);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Delete post"
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.actionSheetBtnText, { color: "#EF4444", fontWeight: "700" }]}>
                Delete Post
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionSheetBtn, styles.actionSheetCancelBtn]}
              onPress={() => setSelectedPost(null)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.actionSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function ProfileStat({
  value,
  label,
  onPress,
}: {
  value: number;
  label: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={styles.igStatValue}>{value}</Text>
      <Text style={styles.igStatLabel}>{label}</Text>
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.igStat} accessible accessibilityLabel={`${value} ${label}`}>
        {content}
      </View>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.igStat}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${value} ${label}`}
      accessibilityHint={`Shows your ${label.toLowerCase()}`}
    >
      {content}
    </TouchableOpacity>
  );
}

function PastelMenuCard({
  badgeBg,
  icon,
  title,
  subtitle,
  onPress,
}: {
  badgeBg: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.pastelMenuCard}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
    >
      <View style={[styles.pastelBadge, { backgroundColor: badgeBg }]}>
        <Ionicons name={icon} size={17} color="#000000" />
      </View>
      <View style={styles.pastelCardCopy}>
        <Text style={styles.pastelCardTitle}>{title}</Text>
        <Text style={styles.pastelCardSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={SystemColors.tertiaryLabel} />
    </TouchableOpacity>
  );
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

const styles = StyleSheet.create({
  igHeader: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 8 },
  igAvatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: SystemColors.tertiarySystemBackground },
  igAvatarFallback: { alignItems: "center", justifyContent: "center" },
  igAvatarInitials: { fontSize: 32, fontWeight: "700", color: SystemColors.secondaryLabel, fontFamily: AppFonts.displaySans },
  igStats: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  igStat: { alignItems: "center", minWidth: 64, minHeight: Layout.minTouch, justifyContent: "center" },
  igStatValue: { ...TextStyles.title3, fontFamily: AppFonts.displaySans, color: SystemColors.label, fontVariant: ["tabular-nums"] },
  igStatLabel: { ...TextStyles.footnote, fontFamily: AppFonts.body, color: Palette.textMuted, marginTop: 2 },
  igName: { ...TextStyles.title2, fontFamily: AppFonts.displaySans, color: SystemColors.label, marginTop: 14 },
  igUsername: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: Palette.textMuted, marginTop: 2 },
  igBio: { ...TextStyles.body, fontFamily: AppFonts.body, color: SystemColors.label, marginTop: 8 },
  igButtons: { flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 28 },
  igButton: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 40,
    borderRadius: Layout.radiusSmall,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SystemColors.tertiarySystemBackground,
  },
  igButtonText: { ...TextStyles.subheadline, fontFamily: AppFonts.body, fontWeight: "600", color: SystemColors.label },
  igIconButton: {
    width: 44,
    minHeight: 40,
    borderRadius: Layout.radiusSmall,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SystemColors.tertiarySystemBackground,
  },
  postsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  postsCollage: { marginHorizontal: -Layout.margin, marginBottom: 32 },
  postsEmpty: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: SystemColors.secondarySystemBackground,
    marginBottom: 32,
  },
  postsEmptyTitle: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.label, marginTop: 4 },
  postsEmptyBody: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: Palette.textMuted, textAlign: "center" },
  postsEmptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    minHeight: Layout.minTouch,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: SystemColors.label,
  },
  postsEmptyButtonText: { ...TextStyles.subheadline, fontFamily: AppFonts.body, fontWeight: "600", color: SystemColors.inverseLabel },

  safeArea: {
    flex: 1,
    backgroundColor: SystemColors.systemBackground,
  },
  header: {
    height: 44,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...TextStyles.headline,
    color: SystemColors.label,
    fontFamily: AppFonts.displaySans,
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.margin,
    paddingTop: 8,
    paddingBottom: 130,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginBottom: 16,
    borderRadius: Layout.radiusSmall,
    backgroundColor: "rgba(255, 69, 58, 0.15)",
  },
  errorText: {
    flex: 1,
    ...TextStyles.footnote,
    color: SystemColors.label,
  },
  identityCard: {
    height: 320,
    position: "relative",
    overflow: "hidden",
    borderRadius: Layout.radiusXL,
    backgroundColor: SystemColors.secondarySystemBackground,
    marginBottom: 32,
  },
  profileCoverImage: {
    ...StyleSheet.absoluteFill,
  },
  profileCoverFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SystemColors.tertiarySystemBackground,
  },
  avatarFallback: {
    fontSize: 48,
    fontWeight: "700",
    color: SystemColors.label,
  },
  profileCoverGradient: {
    ...StyleSheet.absoluteFill,
  },
  editIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    width: Layout.minTouch,
    height: Layout.minTouch,
    borderRadius: Layout.minTouch / 2,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileCoverContent: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    gap: 2,
  },
  profileName: {
    ...TextStyles.title1,
    color: SystemColors.label,
    fontFamily: AppFonts.displaySans,
  },
  username: {
    ...TextStyles.subheadline,
    color: SystemColors.secondaryLabel,
    fontFamily: AppFonts.body,
  },
  bio: {
    ...TextStyles.subheadline,
    color: "rgba(235, 235, 245, 0.8)",
    marginTop: 6,
    fontFamily: AppFonts.body,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: SystemColors.label,
    paddingHorizontal: 16,
    minHeight: 36,
    borderRadius: 18,
    marginTop: 12,
  },
  editProfileText: {
    ...TextStyles.subheadline,
    fontWeight: "600",
    color: "#000000",
    fontFamily: AppFonts.body,
  },
  sectionHeaderTitle: {
    ...TextStyles.title3,
    color: SystemColors.label,
    fontFamily: AppFonts.displaySans,
  },
  connectionsSection: {
    marginBottom: 32,
  },
  connectionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  connectionCard: {
    flex: 1,
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusMedium,
    padding: 14,
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  connectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  connectionCount: {
    ...TextStyles.headline,
    color: SystemColors.label,
    fontFamily: AppFonts.body,
  },
  connectionLabel: {
    ...TextStyles.footnote,
    color: Palette.textSecondary,
    fontFamily: AppFonts.body,
  },
  connChevron: {
    marginLeft: "auto",
  },
  findPeopleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Palette.surfaceCard,
  },
  findPeopleText: { flex: 1 },
  findPeopleTitle: { fontSize: 15, fontWeight: "600", color: Palette.textPrimary, fontFamily: AppFonts.body },
  findPeopleSub: { fontSize: 13, color: Palette.textMuted, marginTop: 2, fontFamily: AppFonts.body },
  activitySection: {
    marginBottom: 32,
  },
  activityHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  quickCreateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: Layout.minTouch,
    paddingLeft: 8,
  },
  quickCreateText: {
    ...TextStyles.body,
    color: SystemColors.blue,
    fontFamily: AppFonts.body,
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  activityCard: {
    width: "48.5%",
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusMedium,
    padding: 14,
  },
  activityCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  activityIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  activityCount: {
    ...TextStyles.title2,
    color: SystemColors.label,
    fontFamily: AppFonts.body,
  },
  activityTitle: {
    ...TextStyles.subheadline,
    fontWeight: "600",
    color: SystemColors.label,
    fontFamily: AppFonts.body,
  },
  activitySub: {
    ...TextStyles.footnote,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  menuCardsContainer: {
    gap: 24,
  },
  menuGroup: {
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusMedium,
    overflow: "hidden",
  },
  menuSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SystemColors.separator,
    marginLeft: 16 + 30 + 12,
  },
  pastelMenuCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pastelBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pastelCardCopy: {
    flex: 1,
  },
  pastelCardTitle: {
    ...TextStyles.body,
    color: SystemColors.label,
    fontFamily: AppFonts.body,
  },
  pastelCardSubtitle: {
    ...TextStyles.footnote,
    color: Palette.textSecondary,
    marginTop: 1,
    fontFamily: AppFonts.body,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: Layout.controlHeight,
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.secondarySystemBackground,
  },
  signOutText: {
    ...TextStyles.body,
    color: SystemColors.red,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  actionSheetCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignSelf: "center",
    marginBottom: 16,
  },
  actionSheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  actionSheetSub: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 18,
  },
  actionSheetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 10,
  },
  actionSheetBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  actionSheetDeleteBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  actionSheetCancelBtn: {
    backgroundColor: "transparent",
    marginTop: 4,
  },
  actionSheetCancelText: {
    fontSize: 15,
    color: "#8E8E93",
    fontWeight: "600",
  },
});
