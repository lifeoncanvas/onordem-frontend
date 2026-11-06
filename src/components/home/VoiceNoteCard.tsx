import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import AudioPlaybackControls from "./AudioPlaybackControls";
import DemoWaveformPlayer from "@/components/DemoWaveformPlayer";

export interface VoiceNoteData {
  id: string;
  title: string;
  mentorName: string;
  duration: string;
  date: string;
  category: string;
  audioUri?: string;
  durationSeconds?: number;
}

interface VoiceNoteCardProps {
  voiceNote: VoiceNoteData;
}

function getCategoryStyle(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("career")) {
    return { icon: "briefcase-outline" as const };
  }

  if (normalized.includes("creative")) {
    return { icon: "sparkles-outline" as const };
  }

  if (normalized.includes("philosophy")) {
    return { icon: "bulb-outline" as const };
  }

  return { icon: "mic-outline" as const };
}

export default function VoiceNoteCard({ voiceNote }: VoiceNoteCardProps) {
  const categoryStyle = getCategoryStyle(voiceNote.category);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardSurface}>
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Ionicons name={categoryStyle.icon} size={12} color={Palette.oceanTeal} />
            <Text style={styles.categoryText}>{voiceNote.category}</Text>
          </View>
          <Text style={styles.dateText}>{voiceNote.date}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          &ldquo;{voiceNote.title}&rdquo;
        </Text>

        <Text style={styles.mentorDedicated}>
          To: <Text style={styles.mentorNameHighlight}>{voiceNote.mentorName}</Text>
        </Text>

        {/* Audio Player Row */}
        {voiceNote.audioUri ? (
          <AudioPlaybackControls
            uri={voiceNote.audioUri}
            title={voiceNote.title}
            durationSeconds={voiceNote.durationSeconds}
            compact
          />
        ) : (
          // Sample notes have no recording: play the shared demo tribute.
          <DemoWaveformPlayer ownerId={`voice-note-${voiceNote.id}`} title={voiceNote.title} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 300,
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardSurface: {
    padding: 16,
    borderRadius: 22,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    color: Palette.oceanTeal,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  dateText: {
    color: Palette.textMuted,
    fontSize: 11,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.deepTeal,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  mentorDedicated: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 4,
    marginBottom: 14,
  },
  mentorNameHighlight: {
    color: Palette.oceanTeal,
    fontWeight: "700",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#202020",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(239, 162, 91, 0.32)",
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.accentAmber,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2.5,
    height: 32,
  },
  waveformBar: {
    width: 3,
    backgroundColor: "rgba(239, 162, 91, 0.7)",
    borderRadius: 2,
  },
  waveformBarAccent: {
    backgroundColor: Palette.accentCoral,
  },
  durationText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
});
