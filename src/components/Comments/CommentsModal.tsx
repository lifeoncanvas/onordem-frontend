import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";
import {
  CommentItem,
  commentService,
} from "@/services/commentService";

interface CommentsModalProps {
  visible: boolean;
  targetId?: string;
  targetTitle?: string;
  onClose: () => void;
}

export default function CommentsModal({
  visible,
  targetId = "default",
  targetTitle = "Comments",
  onClose,
}: CommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const [editingComment, setEditingComment] = useState<CommentItem | null>(null);

  useEffect(() => {
    commentService.initialize().then(() => {
      setComments(commentService.getComments(targetId));
    });

    const unsubscribe = commentService.subscribe(() => {
      setComments(commentService.getComments(targetId));
    });

    return () => unsubscribe();
  }, [targetId]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    if (editingComment) {
      commentService.editComment(editingComment.id, inputText.trim());
      setEditingComment(null);
    } else {
      commentService.addComment({
        targetId,
        text: inputText.trim(),
        parentId: replyingTo?.id,
        replyToName: replyingTo?.authorName,
      });
      setReplyingTo(null);
    }
    setInputText("");
  };

  const handleStartReply = (comment: CommentItem) => {
    setReplyingTo(comment);
    setEditingComment(null);
  };

  const handleStartEdit = (comment: CommentItem) => {
    setEditingComment(comment);
    setReplyingTo(null);
    setInputText(comment.text);
  };

  const handleDelete = (commentId: string) => {
    Alert.alert("Delete Comment", "Are you sure you want to delete your comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => commentService.deleteComment(commentId),
      },
    ]);
  };

  const handleReport = (comment: CommentItem) => {
    Alert.alert(
      "Report Inappropriate Comment",
      `Would you like to report this comment by ${comment.authorName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report as Spam",
          onPress: () => {
            commentService.reportComment(comment.id, "Spam");
            Alert.alert("Thank you", "The comment has been submitted for moderation review.");
          },
        },
        {
          text: "Report as Inappropriate",
          style: "destructive",
          onPress: () => {
            commentService.reportComment(comment.id, "Inappropriate content");
            Alert.alert("Thank you", "The comment has been flagged and submitted for review.");
          },
        },
      ]
    );
  };

  const renderComment = ({ item }: { item: CommentItem }) => {
    const isReply = Boolean(item.parentId);

    return (
      <View style={[styles.commentRow, isReply && styles.commentReplyRow]}>
        <Image source={{ uri: item.authorAvatar }} style={styles.avatar} />
        <View style={styles.contentWrap}>
          {/* Header */}
          <View style={styles.commentHeader}>
            <View style={styles.nameGroup}>
              <Text style={styles.authorName}>{item.authorName}</Text>
              {item.isOwner && (
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>YOU</Text>
                </View>
              )}
              {item.replyToName && (
                <Text style={styles.replyingToText}>
                  Replying to <Text style={styles.replyingToHighlight}>@{item.replyToName}</Text>
                </Text>
              )}
            </View>
            <Text style={styles.timeText}>{item.createdAt}</Text>
          </View>

          {/* Comment Text */}
          <Text style={styles.commentText}>
            {item.text}
            {item.isEdited && <Text style={styles.editedTag}> (edited)</Text>}
          </Text>

          {/* Action Row */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              onPress={() => commentService.toggleLike(item.id)}
              style={styles.actionBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.isLiked ? "heart" : "heart-outline"}
                size={14}
                color={item.isLiked ? Palette.accentPink : Palette.textMuted}
              />
              <Text style={[styles.actionLabel, item.isLiked && styles.actionLabelActive]}>
                {item.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStartReply(item)}
              style={styles.actionBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="return-down-forward-outline" size={14} color={Palette.accentSky} />
              <Text style={styles.actionLabel}>Reply</Text>
            </TouchableOpacity>

            {item.isOwner ? (
              <>
                <TouchableOpacity
                  onPress={() => handleStartEdit(item)}
                  style={styles.actionBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil-outline" size={13} color={Palette.textSecondary} />
                  <Text style={styles.actionLabel}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={styles.actionBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={13} color="#FF6B6B" />
                  <Text style={[styles.actionLabel, { color: "#FF6B6B" }]}>Delete</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => handleReport(item)}
                style={styles.actionBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="flag-outline" size={13} color={Palette.textMuted} />
                <Text style={styles.actionLabel}>Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <View style={styles.headerTitleRow}>
              <View>
                <Text style={styles.sheetTitle}>Comments</Text>
                <Text style={styles.sheetSubtitle} numberOfLines={1}>
                  {targetTitle}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Comment List */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={40} color={Palette.borderSubtle} />
                <Text style={styles.emptyTitle}>No comments yet</Text>
                <Text style={styles.emptySub}>Be the first to share your gratitude.</Text>
              </View>
            }
          />

          {/* Reply / Edit Indicator */}
          {(replyingTo || editingComment) && (
            <View style={styles.contextBanner}>
              <View style={styles.contextTextGroup}>
                <Ionicons
                  name={editingComment ? "pencil" : "return-down-forward"}
                  size={14}
                  color={editingComment ? Palette.accentSky : Palette.accentPink}
                />
                <Text style={styles.contextText}>
                  {editingComment
                    ? "Editing your comment"
                    : `Replying to ${replyingTo?.authorName}`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setReplyingTo(null);
                  setEditingComment(null);
                  setInputText("");
                }}
              >
                <Ionicons name="close-circle" size={18} color={Palette.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Comment Input */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.inputField}
              placeholder={
                editingComment
                  ? "Update your comment..."
                  : replyingTo
                  ? `Reply to @${replyingTo.authorName}...`
                  : "Write a comment..."
              }
              placeholderTextColor={Palette.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim()}
              style={[
                styles.sendBtn,
                inputText.trim() ? styles.sendBtnActive : styles.sendBtnDisabled,
              ]}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={inputText.trim() ? "#111111" : Palette.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  modalSheet: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    minHeight: "55%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignSelf: "center",
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
    maxWidth: 260,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  commentReplyRow: {
    paddingLeft: 36,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#222222",
  },
  contentWrap: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  nameGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  authorName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  youBadge: {
    backgroundColor: "rgba(143, 211, 255, 0.18)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.accentSky,
  },
  replyingToText: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  replyingToHighlight: {
    color: Palette.accentSky,
    fontWeight: "600",
  },
  timeText: {
    fontSize: 11,
    color: Palette.textMuted,
  },
  commentText: {
    fontSize: 13.5,
    lineHeight: 19,
    color: "#E2E8F0",
    fontFamily: AppFonts.body,
  },
  editedTag: {
    fontSize: 11,
    color: Palette.textMuted,
    fontStyle: "italic",
  },
  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.04)",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionLabel: {
    fontSize: 12,
    color: Palette.textMuted,
    fontWeight: "600",
  },
  actionLabelActive: {
    color: Palette.accentPink,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptySub: {
    fontSize: 13,
    color: Palette.textSecondary,
  },
  contextBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 10,
  },
  contextTextGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contextText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputField: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: {
    backgroundColor: Palette.accentMint,
  },
  sendBtnDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
});
