import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { InspirationCardItem } from "@/types/create";

interface TributeInspirationCardsProps {
  cards: InspirationCardItem[];
  selectedCardId?: string | null;
  onSelectInspiration: (promptText: string, cardId: string) => void;
}

export default function TributeInspirationCards({
  cards,
  selectedCardId,
  onSelectInspiration,
}: TributeInspirationCardsProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Ionicons name="sparkles" size={13} color={Palette.turquoise} />
          <Text style={styles.editorialLabel}>INSPIRATION CARDS</Text>
        </View>
        <Text style={styles.heading}>A little inspiration</Text>
        <Text style={styles.subtitle}>
          Every meaningful connection holds a story. Tap a card to inspire your writing.
        </Text>
      </View>

      {/* Horizontal Story Cards Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.map((card) => {
          const isSelected = selectedCardId === card.id;

          return (
            <Pressable
              key={card.id}
              onPress={() => onSelectInspiration(card.promptText, card.id)}
              style={({ pressed }) => [
                styles.card,
                isSelected && styles.cardActive,
                pressed && styles.cardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Inspiration card: ${card.title}. ${card.subtitle}`}
            >
              {/* Card Photo */}
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: card.imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardTag}>
                  <Text style={styles.cardTagText}>{card.tag}</Text>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {card.subtitle}
                </Text>

                <View
                  style={[
                    styles.useActionBtn,
                    isSelected && styles.useActionBtnActive,
                  ]}
                >
                  <Ionicons
                    name={isSelected ? "checkmark" : "bulb-outline"}
                    size={12}
                    color={isSelected ? Palette.pureWhite : Palette.deepTeal}
                  />
                  <Text
                    style={[
                      styles.useActionText,
                      isSelected && styles.useActionTextActive,
                    ]}
                  >
                    {isSelected ? "Active Prompt" : "Use as inspiration"}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  editorialLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 1.1,
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    width: 230,
    backgroundColor: Palette.pureWhite,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardActive: {
    borderColor: Palette.turquoise,
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  imageWrap: {
    height: 125,
    position: "relative",
    backgroundColor: Palette.mintMist,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255, 248, 240, 0.92)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.3)",
  },
  cardTagText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 0.8,
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  useActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: Palette.mintMist,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.25)",
  },
  useActionBtnActive: {
    backgroundColor: Palette.oceanTeal,
    borderColor: Palette.oceanTeal,
  },
  useActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  useActionTextActive: {
    color: Palette.pureWhite,
  },
});
