import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Design System Tokens
import { Palette } from "@/constants/theme";

// Types & Data
import { Story } from "@/types/story";
import { getAllStories, getStoryById } from "@/data/mockStories";

// Shared Navigation
import BottomNavigation from "@/components/home/BottomNavigation";
import { storyBookmarkService } from "@/services/storyBookmarkService";
import FollowButton from "@/components/FollowButton";
import { storyAuthorTarget } from "@/utils/followTargets";

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  // Load current story
  const story: Story = useMemo(() => {
    return getStoryById(id);
  }, [id]);

  // Load related stories
  const relatedStories: Story[] = useMemo(() => {
    const all = getAllStories();
    if (story.relatedStoryIds && story.relatedStoryIds.length > 0) {
      return story.relatedStoryIds
        .map((relId) => all.find((s) => s.id === relId))
        .filter((s): s is Story => s !== undefined)
        .slice(0, 3);
    }
    return all.filter((s) => s.id !== story.id).slice(0, 3);
  }, [story]);

  // Local interactive states
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() =>
    storyBookmarkService.getBookmark(story.id, !!story.isBookmarked)
  );
  const [isLessonSaved, setIsLessonSaved] = useState<boolean>(() =>
    storyBookmarkService.getLessonSaved(story.id)
  );
  const [reflectionInput, setReflectionInput] = useState<string>("");
  const [savedReflection, setSavedReflection] = useState<string | null>(null);
  const [isEditingReflection, setIsEditingReflection] = useState<boolean>(false);

  // Express Gratitude modal / sheet state
  const [showGratitudeModal, setShowGratitudeModal] = useState<boolean>(false);
  const [mentorNameInput, setMentorNameInput] = useState<string>("");
  const [gratitudeNoteInput, setGratitudeNoteInput] = useState<string>("");
  const [hasSentGratitude, setHasSentGratitude] = useState<boolean>(false);

  // Toggle story bookmark
  React.useEffect(() => {
    let isMounted = true;
    storyBookmarkService
      .initialize()
      .then(() => {
        if (isMounted) {
          setIsBookmarked(
            storyBookmarkService.getBookmark(story.id, !!story.isBookmarked)
          );
          setIsLessonSaved(storyBookmarkService.getLessonSaved(story.id));
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to load story bookmark:", error);
        Alert.alert("Saved stories unavailable", "Please reopen this story and try again.");
      });
    return () => {
      isMounted = false;
    };
  }, [story.id, story.isBookmarked]);

  const handleToggleBookmark = async () => {
    const nextValue = !isBookmarked;
    try {
      await storyBookmarkService.setBookmark(story.id, nextValue);
      setIsBookmarked(nextValue);
    } catch (error) {
      console.error("Unable to update story bookmark:", error);
      Alert.alert("Could not save story", "Please try again.");
    }
  };

  // Toggle lesson saved state
  const handleToggleLesson = async () => {
    try {
      await storyBookmarkService.setLessonSaved(story.id, !isLessonSaved);
      setIsLessonSaved(!isLessonSaved);
    } catch (error) {
      console.error("Unable to save story lesson:", error);
      Alert.alert("Could not save lesson", "Please try again.");
    }
  };

  // Save personal reflection locally
  const handleSaveReflection = () => {
    if (!reflectionInput.trim()) return;
    setSavedReflection(reflectionInput.trim());
    setIsEditingReflection(false);
  };

  // Native share functionality
  const handleShareStory = async () => {
    try {
      await Share.share({
        message: `"${story.title}"\n\n${story.excerpt}\n\nA meaningful story about the people who shape us on Honour Your Mentor.`,
        title: story.title,
      });
    } catch {
      Alert.alert("Share Story", "Unable to share story at this time.");
    }
  };

  // Submit appreciation message
  const handleSendGratitude = () => {
    if (!mentorNameInput.trim() || !gratitudeNoteInput.trim()) return;
    setHasSentGratitude(true);
    setTimeout(() => {
      setShowGratitudeModal(false);
      setHasSentGratitude(false);
      setMentorNameInput("");
      setGratitudeNoteInput("");
      Alert.alert(
        "Appreciation Saved",
        "Your message of gratitude has been safely placed in your memory journal."
      );
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Pure Cream White Canvas */}
      <View style={styles.paperCanvas} />

      {/* ======================================================== */}
      {/* A. MINIMAL NAVIGATION HEADER                             */}
      {/* ======================================================== */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to Discover"
        >
          <Ionicons name="arrow-back" size={20} color={Palette.deepTeal} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerLabel}>Story</Text>
          <Text style={styles.headerSub}>A STORY WORTH REMEMBERING</Text>
        </View>

        <TouchableOpacity
          onPress={handleToggleBookmark}
          activeOpacity={0.75}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerBookmarkBtn}
          accessibilityRole="button"
          accessibilityLabel={
            isBookmarked ? "Remove bookmark" : "Bookmark this story"
          }
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isBookmarked ? Palette.turquoise : Palette.deepTeal}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ======================================================== */}
        {/* B. IMMERSIVE STORY COVER                                 */}
        {/* ======================================================== */}
        <View style={styles.coverWrapper}>
          <Image
            source={{ uri: story.imageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />

          {/* Relationship Tag Floating on Image */}
          <View style={styles.coverBadge}>
            <Ionicons name="sparkles" size={11} color={Palette.turquoise} />
            <Text style={styles.coverBadgeText}>
              {story.relationship.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* ======================================================== */}
        {/* C. STORY TITLE AND AUTHOR INFORMATION                    */}
        {/* ======================================================== */}
        <View style={styles.titleSection}>
          <Text style={styles.storyTitle}>{story.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.authorBadgeWrap}>
              <View style={styles.authorDot} />
              <Text style={styles.authorName}>
                {story.author || "A Former Student"}
              </Text>
            </View>

            <View style={styles.metaDivider} />
            <Text style={styles.metaText}>{story.readTime || "5 min read"}</Text>

            {story.publishedDate && (
              <>
                <View style={styles.metaDivider} />
                <Text style={styles.metaText}>{story.publishedDate}</Text>
              </>
            )}
          </View>

          {(story.authorRole || story.author) && (
            <View style={styles.authorFollowRow}>
              <Text style={[styles.authorRoleText, styles.authorFollowText]}>
                {story.authorRole ? `Reflection shared by ${story.authorRole}` : ""}
              </Text>
              {story.author ? (
                <FollowButton person={storyAuthorTarget(story)} size="small" />
              ) : null}
            </View>
          )}
        </View>

        {/* Excerpt Pull Box */}
        <View style={styles.pullExcerptCard}>
          <View style={styles.pullQuoteBar} />
          <Text style={styles.pullExcerptText}>&ldquo;{story.excerpt}&rdquo;</Text>
        </View>

        {/* ======================================================== */}
        {/* D. FULL STORY CONTENT                                    */}
        {/* ======================================================== */}
        <View style={styles.articleBody}>
          {story.paragraphs && story.paragraphs.length > 0 ? (
            story.paragraphs.map((p, idx) => (
              <Text key={idx} style={styles.paragraph}>
                {p}
              </Text>
            ))
          ) : (
            story.fullStory.split("\n\n").map((p, idx) => (
              <Text key={idx} style={styles.paragraph}>
                {p}
              </Text>
            ))
          )}
        </View>

        {/* Subtle Editorial Section Break */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Ionicons name="flower-outline" size={14} color={Palette.turquoise} />
          <View style={styles.dividerLine} />
        </View>

        {/* ======================================================== */}
        {/* E. FEATURED SECTION — “THE LESSON I LEARNED”             */}
        {/* ======================================================== */}
        <View style={styles.lessonSection}>
          <View style={styles.lessonCard}>
            <View style={styles.lessonHeaderRow}>
              <View style={styles.lessonTagPill}>
                <Ionicons name="bulb-outline" size={13} color={Palette.turquoise} />
                <Text style={styles.lessonTagText}>THE LESSON I LEARNED</Text>
              </View>

              <TouchableOpacity
                onPress={handleToggleLesson}
                activeOpacity={0.8}
                style={[
                  styles.saveLessonBtn,
                  isLessonSaved && styles.saveLessonBtnActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  isLessonSaved ? "Lesson saved" : "Save this lesson"
                }
              >
                <Ionicons
                  name={isLessonSaved ? "bookmark" : "bookmark-outline"}
                  size={14}
                  color={isLessonSaved ? Palette.pureWhite : Palette.oceanTeal}
                />
                <Text
                  style={[
                    styles.saveLessonText,
                    isLessonSaved && styles.saveLessonTextActive,
                  ]}
                >
                  {isLessonSaved ? "Saved" : "Save This Lesson"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.lessonQuoteSymbol}>“</Text>
            <Text style={styles.lessonQuoteText}>
              {story.keyLesson ||
                "Sometimes, believing in someone is the first step toward helping them believe in themselves."}
            </Text>

            <Text style={styles.lessonAttribution}>
              — A life lesson from {story.title}
            </Text>
          </View>
        </View>

        {/* ======================================================== */}
        {/* F. REFLECTION SECTION — “WHAT CHANGED BECAUSE OF THEM?”  */}
        {/* ======================================================== */}
        <View style={styles.reflectionSection}>
          <View style={styles.reflectionCard}>
            <View style={styles.reflectionHeader}>
              <Ionicons name="journal-outline" size={18} color={Palette.turquoise} />
              <Text style={styles.reflectionHeading}>
                What Changed Because of Them?
              </Text>
            </View>

            <Text style={styles.reflectionSupportText}>
              {story.reflectionContext ||
                "A moment of encouragement became the beginning of a different future. Sometimes, one person's belief can change the way we see ourselves."}
            </Text>

            <View style={styles.reflectionQuestionBox}>
              <Text style={styles.reflectionPromptLabel}>REFLECT</Text>
              <Text style={styles.reflectionQuestion}>
                &ldquo;
                {story.reflectionQuestion || "Who helped you believe in yourself?"}
                &rdquo;
              </Text>
            </View>

            {savedReflection ? (
              <View style={styles.savedReflectionBox}>
                <View style={styles.savedReflectionHeader}>
                  <Ionicons name="checkmark-circle" size={16} color={Palette.oceanTeal} />
                  <Text style={styles.savedReflectionTitle}>Your Reflection</Text>
                </View>
                <Text style={styles.savedReflectionContent}>{savedReflection}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setReflectionInput(savedReflection);
                    setIsEditingReflection(true);
                  }}
                  activeOpacity={0.7}
                  style={styles.editReflectionBtn}
                >
                  <Text style={styles.editReflectionText}>Edit Thought</Text>
                </TouchableOpacity>
              </View>
            ) : isEditingReflection ? (
              <View style={styles.reflectionEditorBox}>
                <TextInput
                  value={reflectionInput}
                  onChangeText={setReflectionInput}
                  placeholder="Write a thought or a name that comes to heart..."
                  placeholderTextColor={Palette.textMuted}
                  multiline
                  style={styles.reflectionInput}
                />
                <View style={styles.reflectionEditorActions}>
                  <TouchableOpacity
                    onPress={() => setIsEditingReflection(false)}
                    style={styles.cancelReflectionBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelReflectionText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveReflection}
                    style={styles.saveReflectionBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveReflectionText}>Save Thought</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditingReflection(true)}
                activeOpacity={0.85}
                style={styles.writeReflectionBtn}
                accessibilityRole="button"
                accessibilityLabel="Write your reflection"
              >
                <Ionicons name="create-outline" size={16} color={Palette.pureWhite} />
                <Text style={styles.writeReflectionBtnText}>
                  Write Your Reflection
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ======================================================== */}
        {/* G. GRATITUDE ACTIONS                                     */}
        {/* ======================================================== */}
        <View style={styles.gratitudeActionsSection}>
          <Text style={styles.actionsHeading}>Honor This Inspiration</Text>

          {/* Primary Action: Express Gratitude */}
          <TouchableOpacity
            onPress={() => setShowGratitudeModal(true)}
            activeOpacity={0.88}
            style={styles.primaryGratitudeBtn}
            accessibilityRole="button"
            accessibilityLabel="Express gratitude to your mentor"
          >
            <Ionicons name="heart" size={18} color={Palette.pureWhite} />
            <Text style={styles.primaryGratitudeText}>Express Gratitude</Text>
          </TouchableOpacity>

          {/* Secondary Actions: Save Story & Share Story */}
          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity
              onPress={handleToggleBookmark}
              activeOpacity={0.8}
              style={[
                styles.secondaryActionBtn,
                isBookmarked && styles.secondaryActionBtnActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={isBookmarked ? "Story saved" : "Save story"}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={17}
                color={isBookmarked ? Palette.turquoise : Palette.deepTeal}
              />
              <Text
                style={[
                  styles.secondaryActionText,
                  isBookmarked && styles.secondaryActionTextActive,
                ]}
              >
                {isBookmarked ? "Story Saved" : "Save Story"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShareStory}
              activeOpacity={0.8}
              style={styles.secondaryActionBtn}
              accessibilityRole="button"
              accessibilityLabel="Share story"
            >
              <Ionicons name="share-social-outline" size={17} color={Palette.deepTeal} />
              <Text style={styles.secondaryActionText}>Share Story</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* H. RELATED STORIES                                       */}
        {/* ======================================================== */}
        <View style={styles.relatedSection}>
          <View style={styles.relatedHeaderRow}>
            <Text style={styles.relatedHeading}>More Stories That May Inspire You</Text>
            <Ionicons name="book-outline" size={16} color={Palette.turquoise} />
          </View>

          <View style={styles.relatedList}>
            {relatedStories.map((relStory) => (
              <TouchableOpacity
                key={relStory.id}
                onPress={() =>
                  router.push({
                    pathname: "/stories/[id]",
                    params: { id: relStory.id },
                  })
                }
                activeOpacity={0.82}
                style={styles.relatedCard}
                accessibilityRole="button"
                accessibilityLabel={`Read story: ${relStory.title}`}
              >
                <Image
                  source={{ uri: relStory.imageUrl }}
                  style={styles.relatedThumb}
                  resizeMode="cover"
                />

                <View style={styles.relatedBody}>
                  <View style={styles.relatedTag}>
                    <Text style={styles.relatedTagText}>
                      {relStory.relationship}
                    </Text>
                  </View>

                  <Text style={styles.relatedTitle} numberOfLines={2}>
                    {relStory.title}
                  </Text>

                  <View style={styles.relatedFooter}>
                    <Text style={styles.relatedAuthor} numberOfLines={1}>
                      {relStory.author}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={Palette.oceanTeal}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Extra Bottom Padding for floating nav bar */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ======================================================== */}
      {/* I. BOTTOM NAVIGATION                                     */}
      {/* ======================================================== */}
      <BottomNavigation
        activeTab="discover"
        onTabChange={(tab) => {
          if (tab === "home") {
            router.push("/home");
          } else if (tab === "discover") {
            router.push("/discover");
          }
        }}
      />

      {/* ======================================================== */}
      {/* EXPRESS GRATITUDE MODAL                                  */}
      {/* ======================================================== */}
      {showGratitudeModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              { paddingBottom: Math.max(insets.bottom, 20) + 12 },
            ]}
          >
            <View style={styles.modalTopRow}>
              <View style={styles.modalBadge}>
                <Ionicons name="heart" size={13} color={Palette.turquoise} />
                <Text style={styles.modalBadgeText}>HONOUR YOUR MENTOR</Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowGratitudeModal(false)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={18} color={Palette.deepTeal} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHeading}>Express Your Gratitude</Text>
            <Text style={styles.modalSubtitle}>
              Send an appreciation message to the teacher, mentor, or friend who shaped your path.
            </Text>

            {hasSentGratitude ? (
              <View style={styles.modalSuccessBox}>
                <Ionicons name="checkmark-circle" size={36} color={Palette.oceanTeal} />
                <Text style={styles.modalSuccessTitle}>Appreciation Saved</Text>
                <Text style={styles.modalSuccessText}>
                  Your message has been saved to your appreciation collection.
                </Text>
              </View>
            ) : (
              <View style={styles.modalForm}>
                <Text style={styles.modalInputLabel}>Mentor&apos;s Name</Text>
                <TextInput
                  value={mentorNameInput}
                  onChangeText={setMentorNameInput}
                  placeholder="e.g. Mr. Harrison, Coach Alvarez..."
                  placeholderTextColor={Palette.textMuted}
                  style={styles.modalTextInput}
                />

                <Text style={styles.modalInputLabel}>Your Message of Thanks</Text>
                <TextInput
                  value={gratitudeNoteInput}
                  onChangeText={setGratitudeNoteInput}
                  placeholder="Write the words you've always wanted to say..."
                  placeholderTextColor={Palette.textMuted}
                  multiline
                  style={styles.modalTextArea}
                />

                <TouchableOpacity
                  onPress={handleSendGratitude}
                  activeOpacity={0.88}
                  style={[
                    styles.modalSendBtn,
                    (!mentorNameInput.trim() || !gratitudeNoteInput.trim()) &&
                      styles.modalSendBtnDisabled,
                  ]}
                  disabled={!mentorNameInput.trim() || !gratitudeNoteInput.trim()}
                >
                  <Ionicons name="send" size={15} color={Palette.pureWhite} />
                  <Text style={styles.modalSendBtnText}>Save Appreciation</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
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

  /* Header */
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Palette.iceWhite,
    borderBottomWidth: 1,
    borderColor: "rgba(177, 167, 166, 0.2)",
    zIndex: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.pureWhite,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleWrap: {
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  headerSub: {
    fontSize: 9.5,
    fontWeight: "700",
    color: Palette.turquoise,
    letterSpacing: 1.2,
    marginTop: 1,
  },
  headerBookmarkBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.pureWhite,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  /* Scroll Content */
  scrollContent: {
    paddingTop: 14,
  },

  /* B. Immersive Story Cover */
  coverWrapper: {
    marginHorizontal: 20,
    height: 250,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: Palette.mintMist,
    position: "relative",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.pureWhite,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },
  coverBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: 0.8,
  },

  /* C. Story Title & Author Info */
  titleSection: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 14,
  },
  storyTitle: {
    fontSize: 27,
    fontWeight: "900",
    color: Palette.deepTeal,
    letterSpacing: -0.5,
    lineHeight: 33,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  authorBadgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  authorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.turquoise,
  },
  authorName: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Palette.textMuted,
  },
  metaText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: "600",
  },
  authorRoleText: {
    fontSize: 12,
    color: Palette.textMuted,
    fontStyle: "italic",
    marginTop: 6,
  },
  authorFollowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
  },
  authorFollowText: { flex: 1, marginTop: 0 },

  /* Pull Quote Card */
  pullExcerptCard: {
    marginHorizontal: 20,
    backgroundColor: Palette.pureWhite,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    marginBottom: 20,
  },
  pullQuoteBar: {
    width: 3.5,
    backgroundColor: Palette.turquoise,
    borderRadius: 2,
    alignSelf: "stretch",
  },
  pullExcerptText: {
    flex: 1,
    fontSize: 14.5,
    fontStyle: "italic",
    lineHeight: 22,
    color: Palette.deepTeal,
    fontWeight: "600",
  },

  /* D. Full Story Content */
  articleBody: {
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 27,
    color: Palette.textPrimary,
    marginBottom: 18,
    letterSpacing: 0.1,
  },

  /* Editorial Break */
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
    marginBottom: 26,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(177, 167, 166, 0.3)",
  },

  /* E. The Lesson I Learned */
  lessonSection: {
    paddingHorizontal: 20,
    marginBottom: 26,
  },
  lessonCard: {
    backgroundColor: Palette.mintMist, // Mint Mist background
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.2,
    borderColor: "rgba(236, 143, 62, 0.3)",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lessonHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  lessonTagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  lessonTagText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: Palette.turquoise,
    letterSpacing: 1.2,
  },
  saveLessonBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.pureWhite,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  saveLessonBtnActive: {
    backgroundColor: Palette.oceanTeal,
    borderColor: Palette.oceanTeal,
  },
  saveLessonText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },
  saveLessonTextActive: {
    color: Palette.pureWhite,
  },
  lessonQuoteSymbol: {
    fontSize: 52,
    lineHeight: 52,
    fontWeight: "900",
    color: Palette.turquoise,
    opacity: 0.45,
    marginBottom: -16,
  },
  lessonQuoteText: {
    fontSize: 16.5,
    fontWeight: "700",
    color: Palette.deepTeal,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 10,
  },
  lessonAttribution: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: "600",
  },

  /* F. Reflection Section */
  reflectionSection: {
    paddingHorizontal: 20,
    marginBottom: 26,
  },
  reflectionCard: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reflectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  reflectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  reflectionSupportText: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  reflectionQuestionBox: {
    backgroundColor: Palette.mintMist,
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 3.5,
    borderLeftColor: Palette.turquoise,
    marginBottom: 14,
  },
  reflectionPromptLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.turquoise,
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  reflectionQuestion: {
    fontSize: 14.5,
    fontWeight: "700",
    color: Palette.deepTeal,
    lineHeight: 20,
  },
  writeReflectionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Palette.oceanTeal,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  writeReflectionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.pureWhite,
  },
  reflectionEditorBox: {
    marginTop: 4,
  },
  reflectionInput: {
    backgroundColor: Palette.iceWhite,
    borderRadius: 14,
    padding: 12,
    fontSize: 13.5,
    color: Palette.deepTeal,
    minHeight: 80,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    marginBottom: 10,
  },
  reflectionEditorActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  cancelReflectionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cancelReflectionText: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    fontWeight: "600",
  },
  saveReflectionBtn: {
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  saveReflectionText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Palette.pureWhite,
  },
  savedReflectionBox: {
    backgroundColor: Palette.iceWhite,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(84, 0, 14, 0.15)",
  },
  savedReflectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  savedReflectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Palette.oceanTeal,
  },
  savedReflectionContent: {
    fontSize: 13,
    color: Palette.deepTeal,
    lineHeight: 18,
    marginBottom: 8,
  },
  editReflectionBtn: {
    alignSelf: "flex-end",
  },
  editReflectionText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Palette.turquoise,
  },

  /* G. Gratitude Actions */
  gratitudeActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionsHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginBottom: 12,
  },
  primaryGratitudeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal, // Ocean Teal primary
    paddingVertical: 14,
    borderRadius: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  primaryGratitudeText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Palette.pureWhite,
    paddingVertical: 11,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  secondaryActionBtnActive: {
    borderColor: Palette.turquoise,
    backgroundColor: Palette.mintMist,
  },
  secondaryActionText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  secondaryActionTextActive: {
    color: Palette.deepTeal,
  },

  /* H. Related Stories */
  relatedSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  relatedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  relatedHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  relatedList: {
    gap: 10,
  },
  relatedCard: {
    flexDirection: "row",
    backgroundColor: Palette.pureWhite,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  relatedThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  relatedBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  relatedTag: {
    backgroundColor: Palette.mintMist,
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  relatedTagText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  relatedTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: Palette.deepTeal,
    lineHeight: 17,
  },
  relatedFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  relatedAuthor: {
    fontSize: 11,
    color: Palette.textMuted,
    fontWeight: "600",
    maxWidth: "80%",
  },

  /* Modal Sheet */
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
    zIndex: 999,
  },
  modalSheet: {
    backgroundColor: Palette.pureWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  modalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  modalBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: 0.8,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.iceWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeading: {
    fontSize: 21,
    fontWeight: "900",
    color: Palette.deepTeal,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 18,
    marginBottom: 18,
  },
  modalForm: {
    gap: 12,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  modalTextInput: {
    backgroundColor: Palette.iceWhite,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Palette.deepTeal,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  modalTextArea: {
    backgroundColor: Palette.iceWhite,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Palette.deepTeal,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  modalSendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal,
    paddingVertical: 13,
    borderRadius: 20,
    marginTop: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSendBtnDisabled: {
    opacity: 0.5,
  },
  modalSendBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
  modalSuccessBox: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 8,
  },
  modalSuccessTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginTop: 6,
  },
  modalSuccessText: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: "center",
  },
});
