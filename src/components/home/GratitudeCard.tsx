import React, { useState } from "react";
import {
  Alert,
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";
import CommentsModal from "@/components/Comments/CommentsModal";

export interface GratitudePostData {
  id: string;
  authorName: string;
  authorAvatar: string;
  mentorName: string;
  location: string;
  message: string;
  image?: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
}

interface GratitudeCardProps {
  post: GratitudePostData;
  onPress?: () => void;
}

export default function GratitudeCard({ post, onPress }: GratitudeCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${post.message}" — Dedicated to ${post.mentorName} by ${post.authorName} on Honour Your Mentor.`,
      });
    } catch {
      Alert.alert("Share unavailable", "This gratitude post could not be shared.");
    }
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        style={styles.container}
      >
        <View style={styles.cardSurface}>
          {/* Author & Mentor Header */}
          <View style={styles.header}>
            <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
            <View style={styles.headerText}>
              <Text style={styles.authorName}>{post.authorName}</Text>
              <Text style={styles.dedicationText}>
                Honouring <Text style={styles.mentorHighlight}>{post.mentorName}</Text>
              </Text>
            </View>
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
          </View>

          {/* Message */}
          <Text style={styles.messageText}>
            &ldquo;{post.message}&rdquo;
          </Text>

          {/* Optional Media */}
          {post.image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: post.image }} style={styles.postImage} />
            </View>
          ) : null}

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <View style={styles.leftActions}>
              <TouchableOpacity
                onPress={toggleLike}
                activeOpacity={0.7}
                style={styles.actionBtn}
              >
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={18}
                  color={liked ? Palette.accentPink : Palette.textMuted}
                />
                <Text style={[styles.actionCount, liked && styles.actionCountActive]}>
                  {likesCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsCommentsOpen(true)}
                activeOpacity={0.7}
                style={styles.actionBtn}
                accessibilityRole="button"
                accessibilityLabel={`View comments`}
              >
                <Ionicons name="chatbubble-outline" size={17} color={Palette.accentSky} />
                <Text style={styles.actionCount}>{post.commentsCount}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.7}
              style={styles.shareBtn}
            >
              <Ionicons name="share-social-outline" size={18} color={Palette.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <CommentsModal
        visible={isCommentsOpen}
        targetId={post.id}
        targetTitle={`Tribute to ${post.mentorName}`}
        onClose={() => setIsCommentsOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    marginBottom: 16,
    marginHorizontal: 20,
    backgroundColor: "#181818",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
  },
  cardSurface: {
    padding: 16,
    borderRadius: 22,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Palette.accentSky,
    backgroundColor: "#242424",
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  authorName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  dedicationText: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  mentorHighlight: {
    color: Palette.accentSky,
    fontWeight: "700",
    fontFamily: AppFonts.body,
  },
  timeAgo: {
    fontSize: 11,
    color: Palette.textMuted,
    fontFamily: AppFonts.body,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#F1F5F9",
    marginBottom: 12,
    fontFamily: AppFonts.body,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  actionCount: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    fontWeight: "600",
    fontFamily: AppFonts.body,
  },
  actionCountActive: {
    color: Palette.accentPink,
  },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
});
