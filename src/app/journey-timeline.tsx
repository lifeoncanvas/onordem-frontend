import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import JourneyTogether from "@/components/MemoryWall/JourneyTogether";
import { getJourneyNodes } from "@/data/memoryWallData";
import { Palette } from "@/constants/theme";
import { memoryService } from "@/services/memoryService";
import type { WallItem } from "@/types/memoryWall";

export default function JourneyTimelineScreen() {
  const [items, setItems] = useState<WallItem[]>(() =>
    memoryService.getAllMemories()
  );

  useEffect(
    () =>
      memoryService.subscribe(() => {
        setItems(memoryService.getAllMemories());
      }),
    []
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/memory-wall");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.deepTeal} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={21} color={Palette.textPrimary} />
          </Pressable>
          <Text style={styles.heading}>Your full timeline</Text>
        </View>
        <Text style={styles.description}>
          The moments that shaped your journey with your mentors.
        </Text>
        <JourneyTogether
          nodes={getJourneyNodes(items)}
          showFullTimelineButton={false}
          onStoryPress={(id) =>
            router.push({ pathname: "/memory-detail/[id]", params: { id } })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.deepTeal,
  },
  scroll: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  content: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: Palette.pureWhite,
  },
  heading: {
    color: Palette.textPrimary,
    fontSize: 21,
    fontWeight: "800",
  },
  description: {
    marginHorizontal: 20,
    marginTop: 12,
    color: Palette.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
