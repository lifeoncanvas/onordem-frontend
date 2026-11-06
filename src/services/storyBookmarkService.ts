import AsyncStorage from "@react-native-async-storage/async-storage";

type BookmarkListener = (storyId: string, isBookmarked: boolean) => void;
type LessonListener = (lessonId: string, isSaved: boolean) => void;

const BOOKMARK_STORAGE_KEY = "@honour-your-mentor/story-bookmarks";
const LESSON_STORAGE_KEY = "@honour-your-mentor/saved-lessons";
const bookmarkOverrides = new Map<string, boolean>();
const savedLessonOverrides = new Map<string, boolean>();
const listeners = new Set<BookmarkListener>();
const lessonListeners = new Set<LessonListener>();
let initializePromise: Promise<void> | null = null;
let bookmarkWriteQueue: Promise<void> = Promise.resolve();
let lessonWriteQueue: Promise<void> = Promise.resolve();

export const storyBookmarkService = {
  initialize(): Promise<void> {
    if (!initializePromise) {
      initializePromise = Promise.all([
        AsyncStorage.getItem(BOOKMARK_STORAGE_KEY),
        AsyncStorage.getItem(LESSON_STORAGE_KEY),
      ])
        .then(([savedBookmarks, savedLessons]) => {
          loadFlagMap(savedBookmarks, bookmarkOverrides, "story bookmarks");
          loadFlagMap(savedLessons, savedLessonOverrides, "saved lessons");
        })
        .catch((error: unknown) => {
          initializePromise = null;
          throw error;
        });
    }
    return initializePromise;
  },

  getBookmark(storyId: string, initialValue = false): boolean {
    return bookmarkOverrides.get(storyId) ?? initialValue;
  },

  getBookmarkedStoryIds(): string[] {
    return Array.from(bookmarkOverrides)
      .filter(([, isBookmarked]) => isBookmarked)
      .map(([storyId]) => storyId);
  },

  getLessonSaved(lessonId: string, initialValue = false): boolean {
    return savedLessonOverrides.get(lessonId) ?? initialValue;
  },

  getSavedLessonIds(): string[] {
    return Array.from(savedLessonOverrides)
      .filter(([, isSaved]) => isSaved)
      .map(([lessonId]) => lessonId);
  },

  async setBookmark(storyId: string, isBookmarked: boolean): Promise<void> {
    await this.initialize();
    const operation = bookmarkWriteQueue
      .catch(() => undefined)
      .then(async () => {
        const nextBookmarks = new Map(bookmarkOverrides);
        nextBookmarks.set(storyId, isBookmarked);
        await AsyncStorage.setItem(
          BOOKMARK_STORAGE_KEY,
          JSON.stringify(Object.fromEntries(nextBookmarks))
        );
        bookmarkOverrides.set(storyId, isBookmarked);
        listeners.forEach((listener) => listener(storyId, isBookmarked));
      });
    bookmarkWriteQueue = operation;
    await operation;
  },

  async setLessonSaved(lessonId: string, isSaved: boolean): Promise<void> {
    await this.initialize();
    const operation = lessonWriteQueue
      .catch(() => undefined)
      .then(async () => {
        const nextSavedLessons = new Map(savedLessonOverrides);
        nextSavedLessons.set(lessonId, isSaved);
        await AsyncStorage.setItem(
          LESSON_STORAGE_KEY,
          JSON.stringify(Object.fromEntries(nextSavedLessons))
        );
        savedLessonOverrides.set(lessonId, isSaved);
        lessonListeners.forEach((listener) => listener(lessonId, isSaved));
      });
    lessonWriteQueue = operation;
    await operation;
  },

  subscribe(listener: BookmarkListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  subscribeLessons(listener: LessonListener): () => void {
    lessonListeners.add(listener);
    return () => lessonListeners.delete(listener);
  },
};

function loadFlagMap(
  stored: string | null,
  destination: Map<string, boolean>,
  label: string
): void {
  if (!stored) return;
  const parsed: unknown = JSON.parse(stored);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`The saved ${label} are invalid.`);
  }
  Object.entries(parsed).forEach(([id, value]) => {
    if (typeof value !== "boolean") {
      throw new Error(`The saved ${label} are invalid.`);
    }
    destination.set(id, value);
  });
}
