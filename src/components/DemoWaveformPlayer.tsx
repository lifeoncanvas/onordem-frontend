/**
 * Waveform voice-note player that plays the shared demo tribute
 * (services/demoAudio.ts). The waveform fills in as the clip plays; the time
 * shows elapsed while playing and the clip length otherwise.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, SystemColors, TextStyles, alphaColor } from "@/constants/theme";
import { formatClock, useDemoAudio } from "@/services/demoAudio";

const DEFAULT_BARS = [8, 16, 26, 14, 18, 30, 22, 12, 28, 32, 18, 10, 24, 28, 16, 12, 22, 30, 18, 14, 26, 20, 12, 18, 24, 10];
const COMPACT_BARS = [6, 12, 18, 10, 16, 22, 12, 19, 14, 8, 15, 20, 11];

interface DemoWaveformPlayerProps {
  /** Unique per card, so only the card you tapped shows progress. */
  ownerId: string;
  /** Used for the accessibility label, e.g. "Advice for my first startup pitch". */
  title: string;
  accent?: string;
  /** Smaller button and fewer bars, for tiles. */
  compact?: boolean;
  /** Draw the dark rounded container behind the player. */
  framed?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function DemoWaveformPlayer({
  ownerId,
  title,
  accent = SystemColors.orange,
  compact = false,
  framed = true,
  style,
}: DemoWaveformPlayerProps) {
  const audio = useDemoAudio(ownerId);
  const bars = compact ? COMPACT_BARS : DEFAULT_BARS;
  const played = Math.round(audio.progress * bars.length);
  const active = audio.isPlaying || audio.currentTime > 0;
  const size = compact ? 34 : 38;

  return (
    <View style={[styles.row, framed && styles.framed, framed && { borderColor: alphaColor(accent, 0.32) }, style]}>
      <Pressable
        onPress={audio.toggle}
        hitSlop={6}
        style={({ pressed }) => [
          styles.button,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: accent },
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${audio.isPlaying ? "Pause" : "Play"} voice note: ${title}`}
        accessibilityValue={{ text: `${formatClock(audio.currentTime)} of ${formatClock(audio.duration)}` }}
      >
        <Ionicons
          name={audio.isPlaying ? "pause" : "play"}
          size={compact ? 15 : 18}
          color={SystemColors.inverseLabel}
          style={audio.isPlaying ? undefined : styles.playNudge}
        />
      </Pressable>

      <View style={[styles.wave, compact && styles.waveCompact]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {bars.map((h, i) => (
          <View
            key={`bar-${i}`}
            style={[
              styles.bar,
              {
                height: compact ? Math.round(h * 0.85) : h,
                backgroundColor: i < played ? accent : alphaColor(accent, active ? 0.3 : 0.55),
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.time, compact && styles.timeCompact]}>
        {active ? formatClock(audio.currentTime) : formatClock(audio.duration)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  framed: {
    backgroundColor: SystemColors.tertiarySystemFill,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  button: { alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.8 },
  playNudge: { marginLeft: 2 },
  wave: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 32, overflow: "hidden" },
  waveCompact: { height: 24 },
  bar: { width: 3, borderRadius: 1.5 },
  time: {
    ...TextStyles.footnote,
    fontFamily: AppFonts.body,
    fontWeight: "600",
    color: SystemColors.label,
    fontVariant: ["tabular-nums"],
    minWidth: 34,
    textAlign: "right",
  },
  timeCompact: { ...TextStyles.caption1, minWidth: 30 },
});
