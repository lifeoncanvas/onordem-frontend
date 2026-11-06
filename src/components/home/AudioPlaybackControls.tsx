import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { Palette } from "@/constants/theme";

interface AudioPlaybackControlsProps {
  uri: string;
  title: string;
  durationSeconds?: number;
  compact?: boolean;
}

export default function AudioPlaybackControls({
  uri,
  title,
  durationSeconds,
  compact = false,
}: AudioPlaybackControlsProps) {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);

  const togglePlayback = async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
      if (status.playing) {
        player.pause();
      } else {
        if (status.didJustFinish) player.seekTo(0);
        player.play();
      }
    } catch (error) {
      console.error("Unable to play voice memory:", error);
      Alert.alert("Playback unavailable", "This voice memory could not be played.");
    }
  };

  const duration = durationSeconds ?? status.duration;
  const progress = duration > 0 ? status.currentTime / duration : 0;
  const waveformHeights = [
    12, 19, 25, 16, 29, 21, 14, 27, 34, 20, 13, 24, 31, 18, 12, 28, 36, 22,
    16, 30, 20, 13, 26, 34, 18, 12, 23, 31, 19, 14, 27, 35, 21, 15, 29, 18,
  ];

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={togglePlayback}
        style={[styles.playButton, compact && styles.compactPlayButton]}
        accessibilityRole="button"
        accessibilityLabel={`${status.playing ? "Pause" : "Play"} ${title}`}
      >
        <Ionicons
          name={status.playing ? "pause" : "play"}
          size={compact ? 15 : 18}
          color={Palette.pureWhite}
        />
      </TouchableOpacity>
      {compact ? (
      <View style={styles.waveform}>
        {waveformHeights.map((height, index) => (
          <View
            key={`wave-${index}`}
            style={[
              styles.waveformBar,
              { height },
              duration > 0 && (index + 1) / waveformHeights.length <= progress
                ? styles.waveformBarPlayed
                : null,
            ]}
          />
        ))}
      </View>
      ) : (
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progress,
            {
              width: `${Math.min(progress * 100, 100)}%`,
            },
          ]}
        />
      </View>
      )}
      <Text style={styles.duration}>
        {formatTime(status.playing ? status.currentTime : duration)}
      </Text>
    </View>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const wholeSeconds = Math.floor(seconds);
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: "rgba(84, 0, 14, 0.05)",
  },
  compactContainer: {
    minHeight: 44,
    padding: 6,
    gap: 8,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  playButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: Palette.oceanTeal,
  },
  compactPlayButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  progressTrack: {
    height: 4,
    flex: 1,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: "rgba(84, 0, 14, 0.16)",
  },
  progress: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: Palette.turquoise,
  },
  waveform: {
    flex: 1,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    overflow: "hidden",
  },
  waveformBar: {
    width: 3,
    maxHeight: 32,
    borderRadius: 2,
    backgroundColor: "rgba(84, 0, 14, 0.22)",
  },
  waveformBarPlayed: {
    backgroundColor: Palette.turquoise,
  },
  duration: {
    minWidth: 34,
    color: Palette.deepTeal,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
  },
});
