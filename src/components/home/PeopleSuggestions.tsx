/**
 * "People You May Know" — a horizontal row of follow suggestions for Home.
 *
 * Cards stay in place after you follow someone (the button flips to Following)
 * so the row doesn't jump under your finger; only Dismiss removes a card.
 * The card's open button, dismiss button and Follow button are siblings, never nested.
 */
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Layout, Palette, SystemColors, TextStyles } from "@/constants/theme";
import { followService } from "@/services/followService";
import type { Person } from "@/data/peopleData";
import FollowButton from "@/components/FollowButton";
import SectionHeader from "./SectionHeader";
import { useT } from "@/i18n";

const CARD_WIDTH = 164;

export default function PeopleSuggestions() {
  const t = useT();
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    let active = true;
    followService.initialize().then(() => {
      if (active) setPeople(followService.getSuggestions(10));
    });
    return () => {
      active = false;
    };
  }, []);

  const dismiss = (id: string) => {
    setPeople((current) => current.filter((p) => p.id !== id));
    followService.dismissSuggestion(id);
  };

  if (people.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t("home.people.title")}
        subtitle={t("home.people.subtitle")}
        isDark
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityRole="list"
      >
        {people.map((person) => (
          <View key={person.id} style={styles.card}>
            <Pressable
              onPress={() => router.push({ pathname: "/people/[id]", params: { id: person.id } })}
              style={({ pressed }) => [styles.cardBody, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`${person.name}, ${person.role}. ${person.suggestionReason ?? ""}`}
              accessibilityHint="Opens their profile"
            >
              <Image source={{ uri: person.avatar }} style={styles.avatar} contentFit="cover" />
              <Text style={styles.name} numberOfLines={1}>
                {person.name}
              </Text>
              <Text style={styles.reason} numberOfLines={2}>
                {person.suggestionReason ?? person.role}
              </Text>
            </Pressable>

            <FollowButton person={person} size="small" block style={styles.follow} />

            <Pressable
              onPress={() => dismiss(person.id)}
              style={styles.dismiss}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Dismiss suggestion ${person.name}`}
            >
              <Ionicons name="close" size={16} color={Palette.textMuted} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 8, marginBottom: 8 },
  row: { paddingHorizontal: Layout.margin, gap: 10, paddingBottom: 4 },
  card: {
    width: CARD_WIDTH,
    borderRadius: 22,
    backgroundColor: SystemColors.secondarySystemBackground,
    padding: 14,
    paddingTop: 20,
  },
  cardBody: { alignItems: "center" },
  pressed: { opacity: 0.8 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: SystemColors.tertiarySystemBackground,
    marginBottom: 10,
  },
  name: { ...TextStyles.subheadline, fontFamily: AppFonts.body, fontWeight: "600", color: SystemColors.label },
  reason: {
    ...TextStyles.caption1,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    textAlign: "center",
    marginTop: 2,
    minHeight: 32,
  },
  follow: { marginTop: 12 },
  dismiss: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
