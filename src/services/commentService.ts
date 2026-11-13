import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CommentItem {
  id: string;
  targetId: string; // memory or post id
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  parentId?: string; // if replying to another comment
  replyToName?: string;
  isOwner?: boolean;
  isEdited?: boolean;
}

const STORAGE_KEY = "@hym_comments_data";

const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: "c1",
    targetId: "default",
    authorName: "Sarah Jenkins",
    authorUsername: "sarah_j",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    text: "This brought tears to my eyes. Mentors like this truly reshape the trajectory of our lives.",
    createdAt: "2h ago",
    likes: 12,
    isLiked: false,
    isOwner: false,
  },
  {
    id: "c2",
    targetId: "default",
    authorName: "Marcus Vance",
    authorUsername: "marcus_v",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    text: "Beautifully expressed. Resilience is indeed the greatest degree anyone can earn.",
    createdAt: "1h ago",
    likes: 8,
    isLiked: true,
    isOwner: false,
  },
  {
    id: "c3",
    targetId: "default",
    authorName: "You",
    authorUsername: "saritabaiga",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    text: "Thank you all for reading and honouring together! It means the world.",
    createdAt: "30m ago",
    likes: 4,
    isLiked: false,
    isOwner: true,
    parentId: "c1",
    replyToName: "Sarah Jenkins",
  },
];

class CommentService {
  private comments: CommentItem[] = [...DEFAULT_COMMENTS];
  private listeners: Array<() => void> = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.comments = JSON.parse(stored);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.comments));
      }
    } catch {
      // fallback to memory
    }
    this.initialized = true;
  }

  private async persist() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.comments));
    } catch {
      // non-fatal
    }
    this.notify();
  }

  getComments(targetId?: string): CommentItem[] {
    if (!targetId || targetId === "default") {
      return this.comments.filter((c) => !c.targetId || c.targetId === "default");
    }
    return this.comments.filter((c) => c.targetId === targetId);
  }

  addComment(params: {
    targetId?: string;
    text: string;
    parentId?: string;
    replyToName?: string;
  }): CommentItem {
    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      targetId: params.targetId || "default",
      authorName: "You",
      authorUsername: "saritabaiga",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      text: params.text.trim(),
      createdAt: "Just now",
      likes: 0,
      isLiked: false,
      isOwner: true,
      parentId: params.parentId,
      replyToName: params.replyToName,
    };
    this.comments = [newComment, ...this.comments];
    this.persist();
    return newComment;
  }

  editComment(id: string, newText: string): boolean {
    const idx = this.comments.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.comments[idx] = {
        ...this.comments[idx],
        text: newText.trim(),
        isEdited: true,
      };
      this.persist();
      return true;
    }
    return false;
  }

  deleteComment(id: string): boolean {
    const prevLen = this.comments.length;
    this.comments = this.comments.filter((c) => c.id !== id && c.parentId !== id);
    if (this.comments.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  toggleLike(id: string): boolean {
    const idx = this.comments.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const current = this.comments[idx];
      const isLiked = !current.isLiked;
      this.comments[idx] = {
        ...current,
        isLiked,
        likes: isLiked ? current.likes + 1 : Math.max(0, current.likes - 1),
      };
      this.persist();
      return true;
    }
    return false;
  }

  reportComment(id: string, reason: string): boolean {
    // In production this would send to moderation API
    // We mark it or filter it locally
    return true;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const commentService = new CommentService();

