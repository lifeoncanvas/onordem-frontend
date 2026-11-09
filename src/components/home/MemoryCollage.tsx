/**
 * MemoryCollage — the Home "Your Memory Wall" as a photo-album style collage.
 *
 * Layout: the first photo memory becomes a full-width hero; everything else flows
 * into a masonry grid (2 columns on phones, 3 on wide screens) so tiles of different
 * heights interlock like an album page. Each memory type gets its own tile:
 *   - photo       → full-bleed image, text on a soft bottom gradient
 *   - gratitude / lesson / tribute → tinted quote tile with a large quotation mark
 *   - voice       → tinted tile with a play button and waveform
 *   - achievement → tinted milestone tile
 *
 * The like button is a sibling of the tile's open button (never nested inside it),
 * so the web build doesn't render <button> inside <button>.
 */
import React, { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Layout, Palette, SystemColors, TextStyles , alphaColor } from "@/constants/theme";
import type { MemoryData, MemoryType } from "./MemoryCard";
import DemoWaveformPlayer from "@/components/DemoWaveformPlayer";
import AudioPlaybackControls from "./AudioPlaybackControls";

const GAP = 10;
const RADIUS = 22;
const WIDE_BREAKPOINT = 720;

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TYPE_META: Record<MemoryType, { label: string; icon: IconName; tint: string }> = {
  photo: { label: "Photo", icon: "camera", tint: SystemColors.blue },
  gratitude: { label: "Gratitude", icon: "chatbubble-ellipses", tint: SystemColors.pink },
  voice: { label: "Voice Note", icon: "mic", tint: SystemColors.orange },
  achievement: { label: "Milestone", icon: "trophy", tint: SystemColors.yellow },
  lesson: { label: "Lesson", icon: "bookmark", tint: SystemColors.teal },
  tribute: { label: "Appreciation", icon: "heart", tint: SystemColors.pink },
  video: { label: "Video", icon: "videocam", tint: SystemColors.mint },
};

/** Rough tile height used only to balance the masonry columns. */
function estimateHeight(memory: MemoryData, columnWidth: number): number {
  if (memory.image) return columnWidth * 1.3;
  // Voice tiles show title + player, not the description.
  if (memory.type === "voice" || memory.type === "video") return 175;
  const charsPerLine = Math.max(14, columnWidth / 8.5);
  const lines = Math.min(7, Math.ceil(memory.content.length / charsPerLine));
  return 110 + lines * 21;
}

interface MemoryCollageProps {
  memories: MemoryData[];
  /** Omit for read-only collages (e.g. another person's public tributes). */
  onOpen?: (memory: MemoryData) => void;
}

export default function MemoryCollage({ memories, onOpen }: MemoryCollageProps) {
  const [width, setWidth] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const onLayout = (event: LayoutChangeEvent) => {
    // Measured width includes the container's horizontal padding.
    const next = Math.round(event.nativeEvent.layout.width - Layout.margin * 2);
    if (next !== width) setWidth(next);
  };

  const columns = width >= WIDE_BREAKPOINT ? 3 : 2;
  const columnWidth = width > 0 ? (width - GAP * (columns - 1)) / columns : 0;

  const { hero, columnItems } = useMemo(() => {
    const heroItem = memories.find((m) => !!m.image) ?? null;
    const rest = memories.filter((m) => m !== heroItem);
    const cols: MemoryData[][] = Array.from({ length: columns }, () => []);
    const heights = new Array(columns).fill(0);
    for (const memory of rest) {
      const shortest = heights.indexOf(Math.min(...heights));
      cols[shortest].push(memory);
      heights[shortest] += estimateHeight(memory, columnWidth || 160) + GAP;
    }
    return { hero: heroItem, columnItems: cols };
  }, [memories, columns, columnWidth]);

  const toggleLike = (id: string) => setLiked((current) => ({ ...current, [id]: !current[id] }));

  if (memories.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="images-outline" size={28} color={Palette.textMuted} />
        <Text style={styles.emptyText}>No memories of this kind yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      {width > 0 && (
        <>
          {hero && (
            <MemoryTile
              memory={hero}
              variant="hero"
              height={Math.min(380, Math.max(240, width * (columns === 3 ? 0.42 : 0.72)))}
              liked={!!liked[hero.id]}
              onOpen={onOpen ? () => onOpen(hero) : undefined}
              onToggleLike={() => toggleLike(hero.id)}
            />
          )}
          <View style={styles.columns}>
            {columnItems.map((items, columnIndex) => (
              <View key={`col-${columnIndex}`} style={[styles.column, { width: columnWidth }]}>
                {items.map((memory) => (
                  <MemoryTile
                    key={memory.id}
                    memory={memory}
                    variant="tile"
                    height={memory.image ? columnWidth * 1.3 : undefined}
                    liked={!!liked[memory.id]}
                    onOpen={onOpen ? () => onOpen(memory) : undefined}
                    onToggleLike={() => toggleLike(memory.id)}
                  />
                ))}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ─── Tile ─────────────────────────────────────────────────────────────────────

interface MemoryTileProps {
  memory: MemoryData;
  variant: "hero" | "tile";
  height?: number;
  liked: boolean;
  onOpen?: () => void;
  onToggleLike: () => void;
}

function MemoryTile({ memory, variant, height, liked, onOpen, onToggleLike }: MemoryTileProps) {
  const meta = TYPE_META[memory.type];
  // A photo that fails to load (e.g. an expired browser blob: link) falls back to the text tile.
  const [imageFailed, setImageFailed] = useState(false);
  const isPhoto = !!memory.image && !imageFailed;
  const isQuote = memory.type === "gratitude" || memory.type === "lesson" || memory.type === "tribute";
  const likeCount = memory.likes + (liked ? 1 : 0);
  const isHero = variant === "hero";
  const isVoice = !isPhoto && memory.type === "voice";

  return (
    <View
      style={[
        styles.tile,
        isHero && styles.heroTile,
        height !== undefined && isPhoto && { height },
        !isPhoto && { backgroundColor: alphaColor(meta.tint, 0.13) },
      ]}
    >
      <Pressable
        onPress={onOpen}
        disabled={!onOpen}
        style={({ pressed }) => [styles.tilePressable, pressed && !!onOpen && styles.pressed]}
        accessibilityRole={onOpen ? "button" : undefined}
        accessibilityLabel={`${memory.byline ? `${memory.byline}, ` : ""}${meta.label}: ${memory.title}, for ${memory.mentorName}, ${memory.date}`}
        accessibilityHint={onOpen ? "Opens this memory" : undefined}
      >
        {isPhoto ? (
          <>
            <Image
              source={{ uri: memory.image }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              onError={() => setImageFailed(true)}
              accessibilityIgnoresInvertColors
            />
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.82)"]}
              locations={[0, 0.45, 1]}
              style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
            />
            <View style={[styles.photoText, isHero && styles.heroText]}>
              <Text style={styles.photoEyebrow} numberOfLines={1}>
                {memory.byline ? `${memory.byline} · ${meta.label}` : `${meta.label} · ${memory.date}`}
              </Text>
              <Text style={[styles.photoTitle, isHero && styles.heroTitle]} numberOfLines={2}>
                {memory.title}
              </Text>
              {isHero && (
                <Text style={styles.heroExcerpt} numberOfLines={2}>
                  {memory.content}
                </Text>
              )}
              <Text style={styles.photoMentor} numberOfLines={1}>
                {memory.mentorName}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.textTile}>
            <View style={[styles.typeIcon, { backgroundColor: alphaColor(meta.tint, 0.22) }]}>
              <Ionicons name={meta.icon} size={15} color={meta.tint} />
            </View>

            {isQuote ? (
              <>
                <Text style={[styles.quoteMark, { color: meta.tint }]} accessibilityElementsHidden>
                  {"“"}
                </Text>
                <Text style={styles.quoteText} numberOfLines={7}>
                  {memory.content}
                </Text>
                <Text style={styles.tileTitle} numberOfLines={2}>
                  {memory.title}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.tileTitle, styles.tileTitleTop]} numberOfLines={3}>
                  {memory.title}
                </Text>
                {isVoice ? null : memory.type === "video" ? (
                  <View style={styles.voiceRow}>
                    <View style={[styles.playButton, { backgroundColor: meta.tint }]}>
                      <Ionicons name="play" size={16} color="#000" style={styles.playIcon} />
                    </View>
                    <View style={styles.waveform} accessibilityElementsHidden>
                      {[6, 12, 18, 10, 16, 22, 12, 19, 14, 8, 15].map((h, i) => (
                        <View
                          key={`w-${i}`}
                          style={[styles.waveBar, { height: h, backgroundColor: alphaColor(meta.tint, 0.85) }]}
                        />
                      ))}
                    </View>
                    {memory.audioDuration ? (
                      <Text style={styles.duration}>{memory.audioDuration}</Text>
                    ) : null}
                  </View>
                ) : (
                  <Text style={styles.bodyText} numberOfLines={5}>
                    {memory.content}
                  </Text>
                )}
              </>
            )}

            {!isVoice && (
              <Text style={styles.tileMeta} numberOfLines={1}>
                {memory.byline ? `${memory.byline} · for ${memory.mentorName}` : `${memory.mentorName} · ${memory.date}`}
              </Text>
            )}
          </View>
        )}
      </Pressable>

      {isVoice && (
        <View style={styles.voicePlayer}>
          {memory.audioUri ? (
            <AudioPlaybackControls
              uri={memory.audioUri}
              title={memory.title}
              durationSeconds={memory.audioSeconds}
              compact
            />
          ) : (
            <DemoWaveformPlayer
              ownerId={`tile-${memory.id}`}
              title={memory.title}
              accent={meta.tint}
              compact
              framed={false}
            />
          )}
          <Text style={styles.tileMeta} numberOfLines={1}>
            {memory.byline ? `${memory.byline} · for ${memory.mentorName}` : `${memory.mentorName} · ${memory.date}`}
          </Text>
        </View>
      )}

      {/* Sibling of the open button, not inside it. */}
      <Pressable
        onPress={onToggleLike}
        style={[styles.likeButton, isPhoto ? styles.likeOnPhoto : styles.likeOnTint]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={liked ? "Unlike" : "Like"}
        accessibilityState={{ selected: liked }}
        accessibilityValue={{ text: `${likeCount} likes` }}
      >
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={15}
          color={liked ? SystemColors.pink : SystemColors.label}
        />
        <Text style={styles.likeCount}>{likeCount}</Text>
      </Pressable>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { paddingHorizontal: Layout.margin, gap: GAP },
  columns: { flexDirection: "row", gap: GAP, alignItems: "flex-start" },
  column: { gap: GAP },

  tile: {
    borderRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: SystemColors.secondarySystemBackground,
  },
  heroTile: { width: "100%" },
  tilePressable: { flex: 1 },
  pressed: { opacity: 0.85 },

  // Photo tiles
  photoText: { flex: 1, justifyContent: "flex-end", padding: 14, paddingTop: 48 },
  heroText: { padding: 20 },
  photoEyebrow: {
    ...TextStyles.caption1,
    fontFamily: AppFonts.body,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  photoTitle: { ...TextStyles.headline, fontFamily: AppFonts.displaySans, color: "#FFFFFF" },
  heroTitle: { ...TextStyles.title1, fontFamily: AppFonts.displaySans, color: "#FFFFFF" },
  heroExcerpt: {
    ...TextStyles.subheadline,
    fontFamily: AppFonts.body,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    maxWidth: 560,
  },
  photoMentor: {
    ...TextStyles.footnote,
    fontFamily: AppFonts.body,
    color: "rgba(255,255,255,0.78)",
    marginTop: 6,
  },

  // Text tiles
  textTile: { padding: 16, paddingTop: 14 },
  typeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  quoteMark: {
    fontSize: 54,
    lineHeight: 54,
    fontWeight: "700",
    fontFamily: AppFonts.displaySerif,
    marginTop: 8,
    marginBottom: -18,
  },
  quoteText: {
    ...TextStyles.callout,
    fontFamily: AppFonts.body,
    fontWeight: "500",
    color: SystemColors.label,
    lineHeight: 22,
  },
  tileTitle: {
    ...TextStyles.footnote,
    fontFamily: AppFonts.body,
    fontWeight: "600",
    color: SystemColors.label,
    marginTop: 12,
  },
  tileTitleTop: { ...TextStyles.headline, marginTop: 12 },
  bodyText: {
    ...TextStyles.subheadline,
    fontFamily: AppFonts.body,
    color: SystemColors.secondaryLabel,
    marginTop: 6,
  },
  tileMeta: {
    ...TextStyles.caption1,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    marginTop: 10,
  },

  // Voice
  voicePlayer: { paddingHorizontal: 16, paddingBottom: 16, marginTop: -4 },
  voiceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { marginLeft: 2 },
  waveform: { flex: 1, flexDirection: "row", alignItems: "center", gap: 3, height: 24, overflow: "hidden" },
  waveBar: { width: 3, borderRadius: 1.5 },
  duration: {
    ...TextStyles.caption1,
    fontFamily: AppFonts.body,
    fontWeight: "600",
    color: SystemColors.secondaryLabel,
    fontVariant: ["tabular-nums"],
  },

  // Like
  likeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeOnPhoto: { backgroundColor: "rgba(0,0,0,0.45)" },
  likeOnTint: { backgroundColor: "rgba(0,0,0,0.25)" },
  likeCount: {
    ...TextStyles.caption1,
    fontFamily: AppFonts.body,
    fontWeight: "600",
    color: SystemColors.label,
    fontVariant: ["tabular-nums"],
  },

  // Empty
  empty: {
    marginHorizontal: Layout.margin,
    paddingVertical: 32,
    alignItems: "center",
    gap: 8,
    borderRadius: RADIUS,
    backgroundColor: SystemColors.secondarySystemBackground,
  },
  emptyText: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: Palette.textMuted },
});
