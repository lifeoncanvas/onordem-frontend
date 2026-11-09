import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";

export type MemoryType = "photo" | "gratitude" | "voice" | "achievement" | "lesson" | "tribute" | "video";

export interface MemoryData {
  id: string;
  type: MemoryType;
  title: string;
  mentorName: string;
  mentorAvatar?: string;
  date: string;
  content: string;
  image?: string;
  /** Extra photos after the cover image. */
  moreImages?: string[];
  videoUri?: string;
  audioUri?: string;
  audioSeconds?: number;
  /** ISO timestamp, used to order feeds. */
  createdAt?: string;
  /** Who posted it, shown on feed tiles (e.g. "Meera Iyer" or "You"). */
  byline?: string;
  audioDuration?: string;
  achievementBadge?: string;
  likes: number;
  tags?: string[];
}

interface MemoryCardProps {
  memory: MemoryData;
  onPress?: () => void;
  onLikePress?: (id: string) => void;
}

export default function MemoryCard({
  memory,
  onPress,
  onLikePress,
}: MemoryCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(memory.likes);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    onLikePress?.(memory.id);
  };

  const getTypeMeta = () => {
    switch (memory.type) {
      case "photo":
        return { icon: "camera" as const, color: Palette.accentSky, bg: Palette.surfaceElevated, label: "Photo Memory" };
      case "gratitude":
        return { icon: "chatbubble-ellipses" as const, color: Palette.accentPink, bg: Palette.surfaceElevated, label: "Gratitude" };
      case "voice":
        return { icon: "mic" as const, color: Palette.accentPeach, bg: Palette.surfaceElevated, label: "Voice Note" };
      case "achievement":
        return { icon: "trophy" as const, color: Palette.accentAmber, bg: Palette.surfaceElevated, label: "Milestone" };
      case "lesson":
        return { icon: "bookmark" as const, color: Palette.accentSky, bg: Palette.surfaceElevated, label: "Timeless Lesson" };
      case "tribute":
        return { icon: "heart" as const, color: Palette.accentCoral, bg: Palette.surfaceElevated, label: "Appreciation" };
      case "video":
        return { icon: "videocam" as const, color: Palette.accentMint, bg: Palette.surfaceElevated, label: "Video" };
    }
  };

  const meta = getTypeMeta();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.cardContainer}
      accessibilityRole="button"
      accessibilityLabel={`${memory.title} for ${memory.mentorName}`}
    >
      <View style={styles.cardSurface}>
        {/* Top Type & Date Header */}
        <View style={styles.header}>
          <View style={[styles.typeBadge, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={12} color={meta.color} />
            <Text style={[styles.typeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={styles.dateText}>{memory.date}</Text>
        </View>

        {/* Optional image retains its natural colours */}
        {memory.image ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: memory.image }}
              style={styles.memoryImage}
              resizeMode="cover"
            />
          </View>
        ) : null}

        {/* Title */}
        <Text style={styles.title}>{memory.title}</Text>

        {/* Content Body */}
        <Text
          style={[
            styles.bodyText,
            (memory.type === "gratitude" || memory.type === "lesson") && styles.quoteBody,
          ]}
          numberOfLines={memory.image ? 3 : 5}
        >
          {memory.type === "gratitude" || memory.type === "lesson"
            ? `\u201C${memory.content}\u201D`
            : memory.content}
        </Text>

        {/* Voice Note Pill if audio */}
        {memory.type === "voice" && memory.audioDuration ? (
          <View style={styles.voicePreview}>
            <View style={styles.voicePlayBtn}>
              <Ionicons name="play" size={13} color="#000000" />
            </View>
            <View style={styles.miniWaveform}>
              {[8, 14, 18, 10, 16, 22, 12, 19, 14, 8, 16, 12].map((h, i) => (
                <View
                  key={`wave-${i}`}
                  style={[styles.waveBar, { height: h }]}
                />
              ))}
            </View>
            <Text style={styles.durationText}>{memory.audioDuration}</Text>
          </View>
        ) : null}

        {/* Mentor Tag & Like Footer */}
        <View style={styles.footer}>
          <View style={styles.mentorTag}>
            <Ionicons
              name="person-circle-outline"
              size={15}
              color={Palette.accentSky}
            />
            <Text style={styles.mentorName} numberOfLines={1}>
              {memory.mentorName}
            </Text>
          </View>

          <TouchableOpacity
            onPress={toggleLike}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.likeBtn}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={16}
              color={liked ? Palette.accentCoral : Palette.textMuted}
            />
            <Text style={[styles.likeCount, liked && styles.likeCountActive]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    marginBottom: 14,
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.35)",
  },
  cardSurface: {
    padding: 16,
    borderRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  typeText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  dateText: {
    fontSize: 11,
    color: "#737373",
  },
  imageWrapper: {
    width: "100%",
    height: 140,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: Palette.iceWhite,
  },
  memoryImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF", // Bright white title
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: "#D1D5DB", // Soft grey
  },
  quoteBody: {
    fontStyle: "italic",
    color: "#E5E5E5",
    fontFamily: AppFonts.body,
  },
  voicePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1E1E1E",
    padding: 8,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  voicePlayBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  miniWaveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 24,
  },
  waveBar: {
    width: 3,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 2,
  },
  durationText: {
    fontSize: 11,
    color: "#A3A3A3",
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  mentorTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
    backgroundColor: "rgba(143, 211, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(143, 211, 255, 0.2)",
  },
  mentorName: {
    fontSize: 12.5,
    color: "#FFFFFF",
    fontWeight: "700",
    fontFamily: AppFonts.body,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeCount: {
    fontSize: 12,
    color: "#737373",
    fontWeight: "600",
  },
  likeCountActive: {
    color: "#FF4B72",
  },
});
