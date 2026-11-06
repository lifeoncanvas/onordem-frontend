import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Design System Tokens
import { Palette } from "@/constants/theme";

// Types & Mock Data
import {
  FeelingThemeId,
  LessonQuote,
  RelationshipType,
  Story,
} from "@/types/story";
import {
  FEELING_PROMPTS,
  FEATURED_STORY,
  RELATIONSHIP_CATEGORIES,
  STORIES_DATA,
  WISDOM_LESSON,
} from "@/data/mockStories";

// Discover Editorial Components
import DiscoverHeader from "@/components/Discover/DiscoverHeader";
import SearchBar from "@/components/Discover/SearchBar";
import FeaturedStory from "@/components/Discover/FeaturedStory";
import CategoryList from "@/components/Discover/CategoryList";
import FeelingPrompts from "@/components/Discover/FeelingPrompts";
import StoryCard from "@/components/Discover/StoryCard";
import LessonHighlight from "@/components/Discover/LessonHighlight";
import StoryDetailModal from "@/components/Discover/StoryDetailModal";
import BottomNavigation from "@/components/home/BottomNavigation";
import { storyBookmarkService } from "@/services/storyBookmarkService";

export default function DiscoverScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const filterSectionY = useRef(0);
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RelationshipType>("all");
  const [selectedThemeId, setSelectedThemeId] = useState<FeelingThemeId | undefined>();

  // Stories and wisdom bookmark states
  const [featuredStoryState, setFeaturedStoryState] = useState<Story>(() => ({
    ...FEATURED_STORY,
    isBookmarked: storyBookmarkService.getBookmark(
      FEATURED_STORY.id,
      FEATURED_STORY.isBookmarked
    ),
  }));
  const [stories, setStories] = useState<Story[]>(() =>
    STORIES_DATA.map((story) => ({
      ...story,
      isBookmarked: storyBookmarkService.getBookmark(story.id, story.isBookmarked),
    }))
  );
  const [wisdomLesson, setWisdomLesson] = useState<LessonQuote>(() => ({
    ...WISDOM_LESSON,
    isSaved: storyBookmarkService.getLessonSaved(
      WISDOM_LESSON.id,
      !!WISDOM_LESSON.isSaved
    ),
  }));

  // Active Story Detail Modal
  const [selectedStoryForModal, setSelectedStoryForModal] = useState<Story | null>(null);

  // Smooth entrance animation
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  React.useEffect(
    () =>
      storyBookmarkService.subscribe((storyId, isBookmarked) => {
        setFeaturedStoryState((story) =>
          story.id === storyId ? { ...story, isBookmarked } : story
        );
        setStories((currentStories) =>
          currentStories.map((story) =>
            story.id === storyId ? { ...story, isBookmarked } : story
          )
        );
        setSelectedStoryForModal((story) =>
          story?.id === storyId ? { ...story, isBookmarked } : story
        );
      }),
    []
  );

  React.useEffect(
    () =>
      storyBookmarkService.subscribeLessons((lessonId, isSaved) => {
        setWisdomLesson((lesson) =>
          lesson.id === lessonId ? { ...lesson, isSaved } : lesson
        );
      }),
    []
  );

  React.useEffect(() => {
    let isMounted = true;
    storyBookmarkService
      .initialize()
      .then(() => {
        if (!isMounted) return;
        setFeaturedStoryState((story) => ({
          ...story,
          isBookmarked: storyBookmarkService.getBookmark(
            story.id,
            !!story.isBookmarked
          ),
        }));
        setStories((currentStories) =>
          currentStories.map((story) => ({
            ...story,
            isBookmarked: storyBookmarkService.getBookmark(
              story.id,
              !!story.isBookmarked
            ),
          }))
        );
        setWisdomLesson((lesson) => ({
          ...lesson,
          isSaved: storyBookmarkService.getLessonSaved(
            lesson.id,
            !!lesson.isSaved
          ),
        }));
      })
      .catch((error: unknown) => {
        console.error("Unable to load saved stories:", error);
        Alert.alert("Saved stories unavailable", "Please reopen Discover and try again.");
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Combined search and filtering logic
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // 1. Search Query filter (title, excerpt, author, relationship, keywords)
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = story.title.toLowerCase().includes(query);
        const matchesExcerpt = story.excerpt.toLowerCase().includes(query);
        const matchesAuthor = story.author.toLowerCase().includes(query);
        const matchesRelationship = story.relationship.toLowerCase().includes(query);
        const matchesKeywords = story.keywords.some((k) =>
          k.toLowerCase().includes(query)
        );

        if (
          !matchesTitle &&
          !matchesExcerpt &&
          !matchesAuthor &&
          !matchesRelationship &&
          !matchesKeywords
        ) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== "all") {
        if (story.relationshipCategory !== selectedCategory) {
          return false;
        }
      }

      // 3. Feeling/Theme filter
      if (selectedThemeId) {
        if (story.feelingThemeId !== selectedThemeId) {
          return false;
        }
      }

      return true;
    });
  }, [stories, searchQuery, selectedCategory, selectedThemeId]);

  // Check if featured story matches the current filter
  const isFeaturedStoryMatching = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        featuredStoryState.title.toLowerCase().includes(q) ||
        featuredStoryState.excerpt.toLowerCase().includes(q) ||
        featuredStoryState.relationship.toLowerCase().includes(q) ||
        featuredStoryState.keywords.some((k) => k.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedCategory !== "all" && featuredStoryState.relationshipCategory !== selectedCategory) {
      return false;
    }
    if (selectedThemeId && featuredStoryState.feelingThemeId !== selectedThemeId) {
      return false;
    }
    return true;
  }, [featuredStoryState, searchQuery, selectedCategory, selectedThemeId]);

  // Toggle bookmark for any story
  const handleToggleBookmark = async (storyId: string) => {
    const currentBookmark =
      storyId === featuredStoryState.id
        ? featuredStoryState.isBookmarked
        : stories.find((story) => story.id === storyId)?.isBookmarked;
    if (currentBookmark !== undefined) {
      try {
        await storyBookmarkService.setBookmark(storyId, !currentBookmark);
      } catch (error) {
        console.error("Unable to update story bookmark:", error);
        Alert.alert("Could not save story", "Please try again.");
      }
    }
  };

  // Toggle wisdom quote save state
  const handleToggleSaveLesson = async (lessonId: string) => {
    const isSaved = storyBookmarkService.getLessonSaved(
      lessonId,
      !!wisdomLesson.isSaved
    );
    try {
      await storyBookmarkService.setLessonSaved(lessonId, !isSaved);
    } catch (error) {
      console.error("Unable to save lesson:", error);
      Alert.alert("Could not save lesson", "Please try again.");
    }
  };

  // Open story details screen
  const handleOpenStory = (story: Story) => {
    router.push({
      pathname: "/stories/[id]",
      params: { id: story.id },
    });
  };

  // Open story from wisdom card link
  const handleOpenStoryFromLesson = (storyId: string) => {
    router.push({
      pathname: "/stories/[id]",
      params: { id: storyId },
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedThemeId(undefined);
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== "all" ||
    selectedThemeId !== undefined;

  const handleFilterPress = () => {
    if (hasActiveFilters) {
      handleResetFilters();
    }
    scrollViewRef.current?.scrollTo({ y: filterSectionY.current, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Pure Cream White Canvas */}
      <View style={styles.paperCanvas} />

      <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ======================================================== */}
          {/* 1. DISCOVER HEADER                                       */}
          {/* ======================================================== */}
          <DiscoverHeader storyCount={filteredStories.length + (isFeaturedStoryMatching ? 1 : 0)} />

          {/* ======================================================== */}
          {/* 1. SEARCH BAR                                            */}
          {/* ======================================================== */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
            isFiltered={hasActiveFilters}
            onFilterPress={handleFilterPress}
          />

          {/* Active Filter Indicators */}
          {hasActiveFilters && (
            <View style={styles.activeFilterRow}>
              <View style={styles.activeFilterPill}>
                <Ionicons name="filter" size={12} color={Palette.turquoise} />
                <Text style={styles.activeFilterText}>
                  {selectedCategory !== "all" ? selectedCategory : "Filtered"}
                  {selectedThemeId ? ` • Emotional Theme` : ""}
                </Text>
              </View>
              <TouchableOpacity onPress={handleResetFilters} activeOpacity={0.7}>
                <Text style={styles.clearAllFiltersText}>Reset All</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ======================================================== */}
          {/* 2. FEATURED STORY: Someone Changed Everything            */}
          {/* ======================================================== */}
          {isFeaturedStoryMatching && (
            <FeaturedStory
              story={featuredStoryState}
              onReadStory={handleOpenStory}
              onToggleBookmark={handleToggleBookmark}
            />
          )}

          {/* ======================================================== */}
          {/* 3. EXPLORE BY RELATIONSHIP                               */}
          {/* ======================================================== */}
          <View onLayout={(event) => {
            filterSectionY.current = event.nativeEvent.layout.y;
          }}>
            <CategoryList
              categories={RELATIONSHIP_CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />

            {/* ======================================================== */}
            {/* 4. DISCOVER BY FEELING (Emotional Prompts)               */}
            {/* ======================================================== */}
            <FeelingPrompts
              prompts={FEELING_PROMPTS}
              selectedThemeId={selectedThemeId}
              onSelectTheme={(id) => {
                setSelectedThemeId((prev) => (prev === id ? undefined : id));
              }}
            />
          </View>

          {/* ======================================================== */}
          {/* 5. STORIES THAT CHANGED A LIFE                           */}
          {/* ======================================================== */}
          <View style={styles.storiesSection}>
            <View style={styles.storiesSectionHeader}>
              <View>
                <Text style={styles.storiesHeading}>Stories That Changed a Life</Text>
                <Text style={styles.storiesSub}>
                  Small moments can leave a lifelong mark.
                </Text>
              </View>
              {filteredStories.length > 0 && (
                <View style={styles.storyCountBadge}>
                  <Text style={styles.storyCountText}>{filteredStories.length}</Text>
                </View>
              )}
            </View>

            {filteredStories.length === 0 ? (
              /* Thoughtful Empty State */
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="search-outline" size={32} color={Palette.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No Stories Found</Text>
                <Text style={styles.emptySubtitle}>
                  We couldn&apos;t find any stories matching your current search or filters.
                </Text>
                <TouchableOpacity
                  onPress={handleResetFilters}
                  activeOpacity={0.8}
                  style={styles.resetFilterBtn}
                >
                  <Text style={styles.resetFilterBtnText}>Show All Stories</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.storyList}>
                {filteredStories.map((story, index) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    index={index}
                    onReadStory={handleOpenStory}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </View>
            )}
          </View>

          {/* ======================================================== */}
          {/* 6. ONE LESSON WORTH KEEPING (Wisdom Card)                */}
          {/* ======================================================== */}
          <LessonHighlight
            lesson={wisdomLesson}
            onSaveToggle={handleToggleSaveLesson}
            onReadStory={handleOpenStoryFromLesson}
          />

          {/* Extra Bottom Padding for floating nav */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </Animated.View>

      {/* Floating Bottom Navigation Bar (Active: Discover) */}
      <BottomNavigation
        activeTab="discover"
        onTabChange={(tab) => {
          // Handled within BottomNavigation component
        }}
      />

      {/* Interactive Story Reading Modal */}
      <StoryDetailModal
        visible={selectedStoryForModal !== null}
        story={selectedStoryForModal}
        onClose={() => setSelectedStoryForModal(null)}
        onToggleBookmark={handleToggleBookmark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  paperCanvas: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Palette.iceWhite,
  },
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  activeFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.3)",
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },
  clearAllFiltersText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.turquoise,
  },
  storiesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  storiesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  storiesHeading: {
    fontSize: 19,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  storiesSub: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginTop: 3,
  },
  storyCountBadge: {
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.25)",
  },
  storyCountText: {
    fontSize: 12,
    fontWeight: "800",
    color: Palette.oceanTeal,
  },
  storyList: {
    marginTop: 4,
  },
  emptyContainer: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 18,
  },
  resetFilterBtn: {
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  resetFilterBtnText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
});
