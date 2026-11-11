import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppFonts, MaxContentWidth, Palette, alphaColor } from "@/constants/theme";
import BottomNavigation from "@/components/home/BottomNavigation";
import { getAllStories, WISDOM_LESSON } from "@/data/mockStories";
import { memoryService } from "@/services/memoryService";
import { storyBookmarkService } from "@/services/storyBookmarkService";
import { tributeDraftService } from "@/services/tributeDraftService";
import type { Story } from "@/types/story";
import type { WallItem } from "@/types/memoryWall";

type TabFilter = "all" | "memories" | "lessons" | "stories";

export default function SavedItemsScreen() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const [items, setItems] = useState<WallItem[]>(() => getUserItems());
  const [stories, setStories] = useState<Story[]>([]);
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeTab, setActiveTab] = useState<TabFilter>(() => {
    if (section === "stories") return "stories";
    if (section === "memories") return "memories";
    if (section === "lessons") return "lessons";
    return "all";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sampleHeartSaved, setSampleHeartSaved] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);

  const syncStories = () => {
    const savedIds = new Set(storyBookmarkService.getBookmarkedStoryIds());
    setStories(getAllStories().filter((story) => savedIds.has(story.id)));
  };

  const syncLessons = () => {
    const savedIds = new Set(storyBookmarkService.getSavedLessonIds());
    const lessons: SavedLesson[] = [
      {
        id: WISDOM_LESSON.id,
        title: WISDOM_LESSON.storyTitle,
        quote: WISDOM_LESSON.quote,
        storyId: WISDOM_LESSON.storyId,
      },
      ...getAllStories()
        .filter((story) => !!story.keyLesson)
        .map((story) => ({
          id: story.id,
          title: story.title,
          quote: story.keyLesson || "",
          storyId: story.id,
        })),
    ];
    setSavedLessons(lessons.filter((lesson) => savedIds.has(lesson.id)));
  };

  useEffect(() => {
    const syncMemories = () => {
      memoryService.getAllMemories();
      setItems(getUserItems());
    };
    const unsubscribeMemory = memoryService.subscribe(syncMemories);
    const unsubscribeTributes = tributeDraftService.subscribe(syncMemories);
    const unsubscribeBookmarks = storyBookmarkService.subscribe(syncStories);
    const unsubscribeLessons = storyBookmarkService.subscribeLessons(syncLessons);
    let mounted = true;

    Promise.all([
      memoryService.initialize(),
      tributeDraftService.initialize(),
      storyBookmarkService.initialize(),
    ])
      .then(() => {
        if (!mounted) return;
        syncMemories();
        syncStories();
        syncLessons();
        setLoadError("");
      })
      .catch((error: unknown) => {
        console.error("Unable to load saved items:", error);
        if (mounted) setLoadError("Your saved collection could not be loaded.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
      unsubscribeMemory();
      unsubscribeTributes();
      unsubscribeBookmarks();
      unsubscribeLessons();
    };
  }, []);

  const pinnedItems = useMemo(() => items.filter((item) => item.isPinned), [items]);

  // Collection completion calculation
  const startedCount = useMemo(() => {
    let count = 0;
    if (pinnedItems.length > 0) count++;
    if (savedLessons.length > 0 || sampleHeartSaved) count++;
    if (stories.length > 0) count++;
    return count;
  }, [pinnedItems.length, savedLessons.length, sampleHeartSaved, stories.length]);

  // Search filtering
  const query = searchQuery.trim().toLowerCase();

  const filteredPinnedItems = useMemo(() => {
    const list = query
      ? pinnedItems.filter((item) => {
          const title = getItemTitle(item).toLowerCase();
          const mentor = (item.mentorName || "").toLowerCase();
          return title.includes(query) || mentor.includes(query);
        })
      : pinnedItems;
    return sortAscending ? [...list].reverse() : list;
  }, [pinnedItems, query, sortAscending]);

  const filteredLessons = useMemo(() => {
    const list = query
      ? savedLessons.filter((lesson) => {
          return (
            lesson.title.toLowerCase().includes(query) ||
            lesson.quote.toLowerCase().includes(query)
          );
        })
      : savedLessons;
    return sortAscending ? [...list].reverse() : list;
  }, [savedLessons, query, sortAscending]);

  const filteredStories = useMemo(() => {
    const list = query
      ? stories.filter((story) => {
          return (
            story.title.toLowerCase().includes(query) ||
            (story.relationship || "").toLowerCase().includes(query)
          );
        })
      : stories;
    return sortAscending ? [...list].reverse() : list;
  }, [stories, query, sortAscending]);

  const removeBookmark = (story: Story) => {
    Alert.alert("Remove saved story?", story.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        onPress: async () => {
          try {
            await storyBookmarkService.setBookmark(story.id, false);
          } catch (error) {
            console.error("Unable to remove saved story:", error);
            Alert.alert("Could not update saved items", "Please try again.");
          }
        },
      },
    ]);
  };

  const removeLesson = (lesson: SavedLesson) => {
    Alert.alert("Remove saved lesson?", lesson.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        onPress: async () => {
          try {
            await storyBookmarkService.setLessonSaved(lesson.id, false);
          } catch (error) {
            console.error("Unable to remove saved lesson:", error);
            Alert.alert("Could not update saved items", "Please try again.");
          }
        },
      },
    ]);
  };

  const unpinMemory = (item: WallItem) => {
    Alert.alert("Unpin this memory?", getItemTitle(item), [
      { text: "Cancel", style: "cancel" },
      { text: "Unpin", onPress: () => memoryService.togglePin(item.id) },
    ]);
  };

  const showMemories = activeTab === "all" || activeTab === "memories";
  const showLessons = activeTab === "all" || activeTab === "lessons";
  const showStories = activeTab === "all" || activeTab === "stories";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={Palette.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Saved for later</Text>
          <Text style={styles.headerSubtitle}>
            Stories and memories you want to revisit
          </Text>
        </View>

        {/* Balance layout */}
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Collection Tracker Card */}
        <View style={styles.collectionCard}>
          <View style={styles.collectionCardRow}>
            <Text style={styles.collectionCardTitle}>Start your collection</Text>
            <Text style={styles.collectionCardCounter}>
              {startedCount} of 3 started
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                {
                  width:
                    startedCount === 0
                      ? "6%"
                      : startedCount === 1
                      ? "33%"
                      : startedCount === 2
                      ? "66%"
                      : "100%",
                },
              ]}
            />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Palette.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your saved items"
            placeholderTextColor={Palette.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={Palette.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills and Sort Icon */}
        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScroll}
          >
            {(
              [
                { id: "all", label: "All", icon: "sparkles", iconColor: Palette.accentGold },
                { id: "memories", label: "Memories", icon: "camera-outline", iconColor: Palette.accentPink },
                { id: "lessons", label: "Lessons", icon: "bulb-outline", iconColor: Palette.accentSky },
                { id: "stories", label: "Stories", icon: "bookmark-outline", iconColor: Palette.accentMint },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.pillIconBadge,
                      isActive ? styles.pillIconBadgeActive : styles.pillIconBadgeInactive,
                    ]}
                  >
                    <Ionicons
                      name={tab.icon as any}
                      size={14}
                      color={isActive ? "#3B0B14" : tab.iconColor}
                    />
                  </View>
                  <Text
                    style={[
                      styles.pillText,
                      isActive ? styles.pillTextActive : styles.pillTextInactive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortAscending((prev) => !prev)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Sort saved items"
          >
            <Ionicons
              name={sortAscending ? "arrow-up" : "swap-vertical"}
              size={17}
              color={Palette.accentSky}
            />
          </TouchableOpacity>
        </View>

        {loadError ? (
          <View style={styles.messageCard}>
            <Ionicons name="alert-circle-outline" size={22} color={Palette.accentCoral} />
            <Text style={styles.messageText}>{loadError}</Text>
          </View>
        ) : isLoading ? (
          <ActivityIndicator color={Palette.accentSky} style={styles.loader} />
        ) : (
          <>
            {/* Section 1: Pinned Memories */}
            {showMemories && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionTitle}>Pinned memories</Text>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {filteredPinnedItems.length}
                    </Text>
                  </View>
                </View>

                {filteredPinnedItems.length > 0 ? (
                  filteredPinnedItems.map((item) => (
                    <SavedContentRow
                      key={`memory-${item.id}`}
                      title={getItemTitle(item)}
                      subtitle={`${item.mentorName || "Memory"} · ${item.kind}`}
                      imageUri={getItemImage(item)}
                      icon="pin"
                      onPress={() =>
                        router.push({
                          pathname: "/memory-detail/[id]",
                          params: { id: item.id },
                        })
                      }
                      onRemove={() => unpinMemory(item)}
                      removeLabel="Unpin memory"
                    />
                  ))
                ) : (
                  <View style={[styles.card, styles.memoryKeepsakeCard]}>
                    {/* Background Memory Images Grid/Collage */}
                    <View style={[styles.memoryGridBackground, { pointerEvents: "none" }]}>
                      <View style={styles.memoryGridRow}>
                        <Image
                          source={{ uri: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80" }}
                          style={styles.bgMemoryTile}
                          resizeMode="cover"
                        />
                        <Image
                          source={{ uri: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&auto=format&fit=crop&q=80" }}
                          style={styles.bgMemoryTile}
                          resizeMode="cover"
                        />
                        <Image
                          source={{ uri: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80" }}
                          style={styles.bgMemoryTile}
                          resizeMode="cover"
                        />
                      </View>
                      <View style={styles.memoryGridRow}>
                        <Image
                          source={{ uri: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=500&auto=format&fit=crop&q=80" }}
                          style={styles.bgMemoryTile}
                          resizeMode="cover"
                        />
                        <Image
                          source={{ uri: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=500&auto=format&fit=crop&q=80" }}
                          style={styles.bgMemoryTile}
                          resizeMode="cover"
                        />
                        <Image
                          source={{ uri: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80" }}
                          style={styles.bgMemoryTile}
                          resizeMode="cover"
                        />
                      </View>
                      {/* Gradient Overlay for warm contrast & legibility */}
                      <LinearGradient
                        colors={[
                          "rgba(26, 4, 9, 0.72)",
                          "rgba(38, 7, 14, 0.88)",
                          "#1A0409",
                        ]}
                        locations={[0, 0.45, 1]}
                        style={StyleSheet.absoluteFill}
                      />
                    </View>

                    {/* Foreground Visual Keepsake Photos */}
                    <View style={styles.keepsakeRow}>
                      <View
                        style={[
                          styles.keepsakePhotoCard,
                          { transform: [{ rotate: "-6deg" }], marginRight: 6 },
                        ]}
                      >
                        <Image
                          source={{ uri: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&auto=format&fit=crop&q=80" }}
                          style={styles.keepsakePhotoImage}
                        />
                        <View style={styles.keepsakePin}>
                          <Ionicons name="pin" size={11} color={Palette.accentAmber} />
                        </View>
                      </View>
                      <View
                        style={[
                          styles.keepsakePhotoCard,
                          { marginHorizontal: 4, zIndex: 2 },
                        ]}
                      >
                        <Image
                          source={{ uri: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80" }}
                          style={styles.keepsakePhotoImage}
                        />
                        <View style={styles.keepsakePin}>
                          <Ionicons name="sparkles" size={11} color={Palette.accentAmber} />
                        </View>
                      </View>
                      <View
                        style={[
                          styles.keepsakePhotoCard,
                          { transform: [{ rotate: "6deg" }], marginLeft: 6 },
                        ]}
                      >
                        <Image
                          source={{ uri: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&auto=format&fit=crop&q=80" }}
                          style={styles.keepsakePhotoImage}
                        />
                        <View style={styles.keepsakePin}>
                          <Ionicons name="heart" size={11} color={Palette.accentCoral} />
                        </View>
                      </View>
                    </View>

                    <Text style={styles.cardHeading}>
                      Your first keepsake is waiting
                    </Text>
                    <Text style={styles.cardDescription}>
                      Pin a photo or note on your Memory Wall and it will live here.
                    </Text>
                    <TouchableOpacity
                      style={styles.cardButton}
                      onPress={() => router.push("/memory-wall")}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cardButtonText}>Visit Memory Wall</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={15}
                        color={Palette.textOnPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Section 2: Saved Lessons & Quotations */}
            {showLessons && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionTitle}>
                    Saved lessons & quotations
                  </Text>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {filteredLessons.length + (sampleHeartSaved ? 1 : 0)}
                    </Text>
                  </View>
                </View>

                {filteredLessons.length > 0 ? (
                  filteredLessons.map((lesson) => (
                    <SavedContentRow
                      key={`lesson-${lesson.id}`}
                      title={lesson.title}
                      subtitle={lesson.quote}
                      icon="bookmark"
                      onPress={() =>
                        router.push({
                          pathname: "/stories/[id]",
                          params: { id: lesson.storyId },
                        })
                      }
                      onRemove={() => removeLesson(lesson)}
                      removeLabel="Remove saved lesson"
                    />
                  ))
                ) : (
                  <View style={styles.card}>
                    {/* Inner Sample Box */}
                    <View style={styles.sampleBox}>
                      <Text style={styles.sampleTag}>
                        SAMPLE · TAP THE HEART TO SAVE
                      </Text>
                      <Text style={styles.sampleQuote}>
                        Small steps still move you forward.
                      </Text>
                      <TouchableOpacity
                        style={styles.sampleHeartButton}
                        onPress={() => setSampleHeartSaved((prev) => !prev)}
                        activeOpacity={0.8}
                        accessibilityLabel="Save sample lesson"
                      >
                        <Ionicons
                          name={sampleHeartSaved ? "heart" : "heart-outline"}
                          size={18}
                          color={sampleHeartSaved ? Palette.accentCoral : Palette.textPrimary}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.cardHeading}>
                      Collect words worth keeping
                    </Text>
                    <Text style={styles.cardDescription}>
                      Save a guiding lesson or quotation from a story to return to
                      it.
                    </Text>
                    <TouchableOpacity
                      style={styles.cardButton}
                      onPress={() => router.push("/discover")}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cardButtonText}>Explore lessons</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={15}
                        color={Palette.textOnPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Section 3: Saved Discover Stories */}
            {showStories && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionTitle}>Saved Discover stories</Text>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{filteredStories.length}</Text>
                  </View>
                </View>

                {filteredStories.length > 0 ? (
                  filteredStories.map((story) => (
                    <SavedContentRow
                      key={`story-${story.id}`}
                      title={story.title}
                      subtitle={`${story.relationship} · ${story.readTime}`}
                      imageUri={story.imageUrl}
                      icon="bookmark"
                      onPress={() =>
                        router.push({
                          pathname: "/stories/[id]",
                          params: { id: story.id },
                        })
                      }
                      onRemove={() => removeBookmark(story)}
                      removeLabel="Remove saved story"
                    />
                  ))
                ) : (
                  <View style={styles.card}>
                    {/* Inner Sample Discover Box */}
                    <View style={styles.sampleDiscoverBox}>
                      <View style={styles.sampleBookIconBox}>
                        <Ionicons
                          name="book-outline"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.sampleDiscoverCopy}>
                        <Text style={styles.sampleTag}>START WITH THIS</Text>
                        <Text style={styles.sampleDiscoverTitle}>
                          A story picked for you from Discover
                        </Text>
                        <Text style={styles.sampleDiscoverSubtitle}>
                          Open it, then tap save.
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.cardHeading}>
                      Stories will wait for you
                    </Text>
                    <Text style={styles.cardDescription}>
                      Save a story from Discover and it will be waiting here.
                    </Text>
                    <TouchableOpacity
                      style={styles.cardButton}
                      onPress={() => router.push("/discover")}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cardButtonText}>Explore stories</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={15}
                        color={Palette.textOnPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Bottom Card: Gentle Reminders Banner */}
            <View style={styles.reminderCard}>
              <View style={styles.reminderIconCircle}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={Palette.textPrimary}
                />
              </View>
              <View style={styles.reminderCopy}>
                <Text style={styles.reminderTitle}>Gentle reminders</Text>
                <Text style={styles.reminderSubtitle}>
                  A weekly nudge to revisit what you saved.
                </Text>
              </View>
              <Pressable
                onPress={() => setRemindersEnabled((prev) => !prev)}
                style={[
                  styles.toggleTrack,
                  remindersEnabled && styles.toggleTrackActive,
                ]}
                accessibilityRole="switch"
                accessibilityState={{ checked: remindersEnabled }}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    remindersEnabled && styles.toggleThumbActive,
                  ]}
                />
              </Pressable>
            </View>
          </>
        )}
        {/* Extra Bottom Padding for floating nav */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Bottom Navigation Bar (Active: Saved) */}
      <BottomNavigation activeTab="saved" />
    </SafeAreaView>
  );
}

interface SavedLesson {
  id: string;
  title: string;
  quote: string;
  storyId: string;
}

function SavedContentRow({
  title,
  subtitle,
  imageUri,
  icon,
  onPress,
  onRemove,
  removeLabel,
}: {
  title: string;
  subtitle: string;
  imageUri?: string;
  icon: "pin" | "bookmark";
  onPress: () => void;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.rowMain}
        onPress={onPress}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel={`Open ${title}`}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailFallback}>
            <Ionicons
              name={icon === "pin" ? "pin-outline" : "book-outline"}
              size={20}
              color={Palette.textPrimary}
            />
          </View>
        )}
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={17} color={Palette.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onRemove}
        style={styles.removeButton}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={removeLabel}
      >
        <Ionicons name="bookmark" size={18} color={Palette.accentMint} />
      </TouchableOpacity>
    </View>
  );
}

function getItemTitle(item: WallItem): string {
  if (item.kind === "lesson") return item.lessonTitle;
  return "title" in item && item.title ? item.title : "Saved memory";
}

function getItemImage(item: WallItem): string | undefined {
  if (item.kind === "tribute") return item.photoUri || undefined;
  return "imageUri" in item ? item.imageUri : undefined;
}

function getUserItems(): WallItem[] {
  const savedTributes = tributeDraftService
    .getSavedKeepsakes()
    .flatMap((keepsake) => {
      const current = memoryService.getMemoryById(keepsake.id);
      return current?.kind === "tribute" ? [current] : [];
    });
  return [...memoryService.getUserSavedItems(), ...savedTributes];
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    ...Platform.select({
      ios: {
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.08)",
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      },
    }),
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontFamily: AppFonts.displaySans,
    fontSize: 24,
    fontWeight: "800",
    color: Palette.textPrimary,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: Palette.textSecondary,
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 44,
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Collection Tracker Card
  collectionCard: {
    backgroundColor: Palette.surfaceCard,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    marginTop: 4,
  },
  collectionCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  collectionCardTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  collectionCardCounter: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: "500",
  },
  progressTrack: {
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Palette.surfaceElevated,
    marginTop: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3.5,
    backgroundColor: Palette.accentSky,
  },

  // Search Bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceElevated,
    borderRadius: 25,
    height: 46,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    marginTop: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13.5,
    color: Palette.textPrimary,
    paddingVertical: 0,
  },

  // Filters & Sort
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
    justifyContent: "space-between",
  },
  pillsScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 6,
    paddingRight: 15,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillInactive: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  pillActive: {
    backgroundColor: Palette.accentMint,
    borderWidth: 1,
    borderColor: Palette.accentMint,
    boxShadow: `0px 2px 6px ${alphaColor(Palette.accentMint, 0.25)}`,
  },
  pillIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  pillIconBadgeInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  pillIconBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.28)",
  },
  pillText: {
    fontSize: 13.5,
    fontFamily: AppFonts.body,
  },
  pillTextInactive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  pillTextActive: {
    color: "#111111",
    fontWeight: "800",
  },
  sortButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // Section Headers
  sectionContainer: {
    marginTop: 18,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: AppFonts.displaySans,
    fontSize: 21,
    fontWeight: "800",
    color: Palette.textPrimary,
    letterSpacing: -0.2,
  },
  badgeContainer: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: Palette.accentSky,
  },

  // Big White Cards
  card: {
    backgroundColor: Palette.surfaceCard,
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    alignItems: "center",
  },
  memoryKeepsakeCard: {
    overflow: "hidden",
    position: "relative",
    borderColor: "rgba(239, 162, 91, 0.28)",
  },
  memoryGridBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.95,
  },
  memoryGridRow: {
    flex: 1,
    flexDirection: "row",
  },
  bgMemoryTile: {
    flex: 1,
    height: "100%",
    opacity: 0.25,
  },
  keepsakePhotoCard: {
    width: 68,
    height: 82,
    borderRadius: 14,
    backgroundColor: "#202020",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.45)",
  },
  keepsakePhotoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  keepsakePin: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  cardHeading: {
    fontSize: 16.5,
    fontWeight: "800",
    color: Palette.textPrimary,
    marginTop: 18,
    textAlign: "center",
    fontFamily: AppFonts.displaySans,
  },
  cardDescription: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 270,
    fontFamily: AppFonts.body,
  },
  cardButton: {
    backgroundColor: Palette.accentMint,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  cardButtonText: {
    color: "#111111",
    fontSize: 13.5,
    fontWeight: "800",
    fontFamily: AppFonts.body,
  },

  // Keepsake placeholders
  keepsakeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  keepsakePlaceholder: {
    width: 66,
    height: 78,
    borderRadius: 14,
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Palette.borderSubtle,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },

  // Sample Lesson Box
  sampleBox: {
    width: "100%",
    backgroundColor: Palette.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Palette.borderSubtle,
    borderStyle: "dashed",
    padding: 16,
  },
  sampleTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: Palette.accentSky,
  },
  sampleQuote: {
    fontFamily: AppFonts.body,
    fontSize: 18,
    fontWeight: "800",
    color: Palette.textPrimary,
    marginTop: 8,
    lineHeight: 24,
    maxWidth: "88%",
  },
  sampleHeartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.surfaceCard,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginTop: 8,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    ...Platform.select({
      ios: {
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
      },
      android: {
        elevation: 1,
      },
    }),
  },

  // Sample Discover Box
  sampleDiscoverBox: {
    width: "100%",
    backgroundColor: Palette.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Palette.borderSubtle,
    borderStyle: "dashed",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  sampleBookIconBox: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: Palette.surfaceCard,
    alignItems: "center",
    justifyContent: "center",
  },
  sampleDiscoverCopy: {
    flex: 1,
  },
  sampleDiscoverTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: Palette.textPrimary,
    marginTop: 3,
  },
  sampleDiscoverSubtitle: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    marginTop: 2,
  },

  // Reminders Card
  reminderCard: {
    backgroundColor: Palette.surfaceCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  reminderIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.accentMint,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderCopy: {
    flex: 1,
  },
  reminderTitle: {
    color: Palette.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  reminderSubtitle: {
    color: Palette.textSecondary,
    fontSize: 11.5,
    marginTop: 3,
    lineHeight: 16,
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Palette.textSecondary,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: Palette.accentMint,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Palette.textOnPrimary,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },

  // Populated Saved Items List
  row: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.surfaceCard,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumbnail: {
    width: 56,
    height: 60,
    borderRadius: 12,
    backgroundColor: Palette.surfaceElevated,
  },
  thumbnailFallback: {
    width: 56,
    height: 60,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.surfaceElevated,
  },
  rowCopy: {
    flex: 1,
    paddingVertical: 10,
  },
  rowTitle: {
    color: Palette.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  rowSubtitle: {
    marginTop: 4,
    color: Palette.textSecondary,
    fontSize: 11,
  },
  removeButton: {
    width: 42,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    marginVertical: 36,
  },
  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Palette.surfaceElevated,
    marginTop: 16,
  },
  messageText: {
    flex: 1,
    color: Palette.textPrimary,
    fontSize: 13,
  },
});
