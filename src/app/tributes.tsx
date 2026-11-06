import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { TributeWallCard } from "@/components/MemoryWall";
import { MaxContentWidth, Palette } from "@/constants/theme";
import { memoryService } from "@/services/memoryService";
import { tributeDraftService } from "@/services/tributeDraftService";
import type { WallTribute } from "@/types/memoryWall";

export default function TributesScreen() {
  const [tributes, setTributes] = useState<WallTribute[]>(getSavedTributes);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const syncTributes = () => {
      memoryService.getAllMemories();
      setTributes(getSavedTributes());
    };
    const unsubscribeMemory = memoryService.subscribe(syncTributes);
    const unsubscribeTributes = tributeDraftService.subscribe(syncTributes);
    let mounted = true;

    tributeDraftService
      .initialize()
      .then(() => {
        if (!mounted) return;
        syncTributes();
        setLoadError("");
      })
      .catch((error: unknown) => {
        console.error("Unable to load tributes:", error);
        if (mounted) setLoadError("Your appreciation cards could not be loaded.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
      unsubscribeMemory();
      unsubscribeTributes();
    };
  }, []);

  const sortedTributes = useMemo(
    () => [...tributes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [tributes]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIcon}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={23} color={Palette.deepTeal} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>My Appreciation Cards</Text>
          <Text style={styles.headerSubtitle}>
            {sortedTributes.length} {sortedTributes.length === 1 ? "keepsake" : "keepsakes"}
          </Text>
        </View>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Stories of the people whose care became part of your own.
        </Text>
        {isLoading ? (
          <ActivityIndicator color={Palette.turquoise} style={styles.loader} />
        ) : loadError ? (
          <View style={styles.emptyCard}>
            <Ionicons name="alert-circle-outline" size={28} color={Palette.oceanTeal} />
            <Text style={styles.emptyTitle}>{loadError}</Text>
          </View>
        ) : sortedTributes.length ? (
          sortedTributes.map((tribute) => (
            <TributeWallCard
              key={tribute.id}
              item={tribute}
              onPress={(selected) =>
                router.push({
                  pathname: "/memory-detail/[id]",
                  params: { id: selected.id },
                })
              }
              onPinPress={(id) => memoryService.togglePin(id)}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={25} color={Palette.oceanTeal} />
            </View>
            <Text style={styles.emptyTitle}>Your first appreciation card starts here.</Text>
            <Text style={styles.emptyText}>
              Celebrate someone whose guidance you want to remember.
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/create-tribute")}
              accessibilityRole="button"
            >
              <Text style={styles.createButtonText}>Create an Appreciation Card</Text>
              <Ionicons name="arrow-forward" size={15} color={Palette.pureWhite} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getSavedTributes(): WallTribute[] {
  return tributeDraftService
    .getSavedKeepsakes()
    .map((keepsake) => {
      const current = memoryService.getMemoryById(keepsake.id);
      return {
        kind: "tribute",
        id: keepsake.id,
        mentorName: keepsake.mentorName,
        relationship: keepsake.relationship,
        photoUri: keepsake.photoUri,
        quote: keepsake.quote,
        title: keepsake.customTitle || `Appreciation for ${keepsake.mentorName}`,
        story: keepsake.story,
        templateId: keepsake.templateId,
        createdAt: keepsake.createdAt,
        isPinned: current?.isPinned,
        mentorId: current?.mentorId,
      };
    });
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.iceWhite },
  header: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: { width: 42, height: 42, justifyContent: "center" },
  headerCopy: { alignItems: "center" },
  headerTitle: {
    color: Palette.deepTeal,
    fontSize: 22,
    fontWeight: "800",
  },
  headerSubtitle: { marginTop: 2, color: Palette.textSecondary, fontSize: 10 },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingTop: 10,
    paddingBottom: 26,
  },
  intro: {
    paddingHorizontal: 20,
    marginBottom: 18,
    color: Palette.textSecondary,
    fontSize: 14,
  },
  loader: { marginVertical: 30 },
  emptyCard: {
    alignItems: "center",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.mintMist,
  },
  emptyTitle: {
    marginTop: 13,
    color: Palette.deepTeal,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 5,
    color: Palette.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 17,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: Palette.oceanTeal,
  },
  createButtonText: { color: Palette.pureWhite, fontSize: 12, fontWeight: "800" },
});
