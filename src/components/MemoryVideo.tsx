/**
 * Inline video for a memory, with the platform's native playback controls.
 * Never autoplays (HIG playing-video: let people choose when to play).
 */
import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { SystemColors } from "@/constants/theme";

interface MemoryVideoProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export default function MemoryVideo({ uri, style, accessibilityLabel }: MemoryVideoProps) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  return (
    <View style={[styles.frame, style]} accessibilityLabel={accessibilityLabel}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls
        fullscreenOptions={{ enable: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: SystemColors.secondarySystemBackground,
  },
});
