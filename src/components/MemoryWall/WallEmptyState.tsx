import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Palette } from "@/constants/theme";

export default function WallEmptyState() {
  return (
    <View style={styles.container}>
      {/* Decorative floating card */}
      <View style={styles.floatCard}>
        <LinearGradient
          colors={["#171717", "#202020"]}
          style={styles.cardGradient}
        >
          <Ionicons name="library-outline" size={32} color="rgba(252,238,228,0.5)" />
        </LinearGradient>
      </View>

      <Text style={styles.headline}>Your archive is empty</Text>
      <Text style={styles.body}>
        Create your first appreciation card, memo, letter, or note. Everything you
        add here lives forever in your personal wall.
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/create")}
        activeOpacity={0.82}
        style={styles.cta}
        accessibilityRole="button"
        accessibilityLabel="Start creating a memory"
      >
        <LinearGradient
          colors={["#171717", "#202020"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaGradient}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.ctaText}>Start Creating</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  floatCard: {
    marginBottom: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  cardGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    fontSize: 20,
    fontWeight: "800",
    color: Palette.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  cta: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  ctaText: {
    color: "#FFF8F0",
    fontSize: 14,
    fontWeight: "700",
  },
});
