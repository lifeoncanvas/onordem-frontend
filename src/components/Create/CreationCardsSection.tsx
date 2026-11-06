import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppFonts, Palette } from "@/constants/theme";
import { CreationOptionItem, CreationType } from "@/types/create";
import CreationStudioCard from "./CreationStudioCard";

interface CreationCardsSectionProps {
  options: CreationOptionItem[];
  selectedType?: CreationType;
  onSelectOption: (type: CreationType) => void;
}

export default function CreationCardsSection({
  options,
  selectedType,
  onSelectOption,
}: CreationCardsSectionProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>What Would You Like to Create?</Text>
          <Text style={styles.sectionSubtitle}>
            Choose a canvas to capture someone meaningful
          </Text>
        </View>
      </View>

      {/* Flexible card grid */}
      <View style={styles.gridContainer}>
        {options.map((item) => (
          <CreationStudioCard
            key={item.id}
            item={item}
            isSelected={selectedType === item.id}
            onPress={() => onSelectOption(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 10,
  },
  headerRow: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: AppFonts.displaySans,
    fontSize: 21,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontFamily: AppFonts.body,
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    justifyContent: "space-between",
  },
});
