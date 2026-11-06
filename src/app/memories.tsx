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

import { MemoryWallCard } from "@/components/MemoryWall";
import { MaxContentWidth, Palette } from "@/constants/theme";
import { memoryService } from "@/services/memoryService";
import type { WallItem, WallMemory } from "@/types/memoryWall";

export default function MemoriesScreen() {
  const [items, setItems] = useState<WallItem[]>(() =>
    memoryService.getUserCreatedItems()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const sync = () => setItems(memoryService.getUserCreatedItems());
    const unsubscribe = memoryService.subscribe(sync);
    let mounted = true;

    memoryService
      .initialize()
      .then(() => {
        if (!mounted) return;
        sync();
        setLoadError("");
      })
      .catch((error: unknown) => {
        console.error("Unable to load memories:", error);
        if (mounted) setLoadError("Your memories could not be loaded.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const memories = useMemo(
    () =>
      items
        .filter((item): item is WallMemory => item.kind === "memory")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={23} color={Palette.deepTeal} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Memories collected</Text>
          <Text style={styles.headerSubtitle}>
            {memories.length} {memories.length === 1 ? "memory" : "memories"}
          </Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Moments and stories you have added to your own archive.
        </Text>
        {isLoading ? (
          <ActivityIndicator color={Palette.turquoise} style={styles.loader} />
        ) : loadError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{loadError}</Text>
          </View>
        ) : memories.length ? (
          memories.map((memory) => (
            <MemoryWallCard
              key={memory.id}
              item={memory}
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
              <Ionicons name="images-outline" size={25} color={Palette.oceanTeal} />
            </View>
            <Text style={styles.emptyTitle}>Your moments belong here.</Text>
            <Text style={styles.emptyText}>
              Add a memory to keep a meaningful moment close.
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/create")}
              accessibilityRole="button"
            >
              <Text style={styles.createButtonText}>Add a memory</Text>
              <Ionicons name="arrow-forward" size={15} color={Palette.pureWhite} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
  headerButton: { width: 42, height: 42, justifyContent: "center" },
  headerCopy: { alignItems: "center" },
  headerTitle: {
    color: Palette.deepTeal,
    fontSize: 21,
    fontWeight: "800",
  },
  headerSubtitle: { marginTop: 3, color: Palette.textSecondary, fontSize: 10 },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingTop: 10,
    paddingBottom: 30,
  },
  intro: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
    marginTop: 12,
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
