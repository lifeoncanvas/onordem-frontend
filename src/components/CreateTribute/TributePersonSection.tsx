import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCategoryAccent, Palette } from "@/constants/theme";
import { TributeRelationship } from "@/types/create";
import { TRIBUTE_RELATIONSHIPS } from "@/data/tributeDetailsData";

interface TributePersonSectionProps {
  name: string;
  relationship: TributeRelationship;
  onNameChange: (text: string) => void;
  onRelationshipChange: (rel: TributeRelationship) => void;
}

export default function TributePersonSection({
  name,
  relationship,
  onNameChange,
  onRelationshipChange,
}: TributePersonSectionProps) {
  const relationshipOptions = TRIBUTE_RELATIONSHIPS.includes(relationship)
    ? TRIBUTE_RELATIONSHIPS
    : [...TRIBUTE_RELATIONSHIPS, relationship];

  return (
    <View style={styles.container}>
      {/* Editorial Label & Heading */}
      <View style={styles.sectionHeader}>
        <View style={styles.labelRow}>
          <Ionicons name="person-outline" size={13} color={Palette.turquoise} />
          <Text style={styles.editorialLabel}>THE PERSON</Text>
        </View>
        <Text style={styles.heading}>Who are we celebrating?</Text>
      </View>

      {/* Input Card Container */}
      <View style={styles.card}>
        {/* Name Input Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>THEIR NAME</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="sparkles-outline"
              size={15}
              color={Palette.turquoise}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Enter their name"
              placeholderTextColor={Palette.textMuted}
              value={name}
              onChangeText={onNameChange}
              autoCapitalize="words"
              accessibilityLabel="Mentor's name"
            />
          </View>
        </View>

        {/* Relationship Chips */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>YOUR RELATIONSHIP</Text>
          <View style={styles.chipsContainer}>
            {relationshipOptions.map((rel) => {
              const isSelected = relationship === rel;
              const iconName = getRelationshipIcon(rel);
              const accentColor = getCategoryAccent(rel);

              return (
                <Pressable
                  key={rel}
                  onPress={() => onRelationshipChange(rel)}
                  style={({ pressed }) => [
                    styles.chip,
                    isSelected && {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      borderColor: accentColor,
                    },
                    pressed && styles.chipPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Relationship: ${rel}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Ionicons
                    name={iconName}
                    size={13}
                    color={isSelected ? accentColor : Palette.textSecondary}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && { color: accentColor, fontWeight: "800" },
                    ]}
                  >
                    {rel}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedDot, { backgroundColor: accentColor }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

function getRelationshipIcon(rel: TributeRelationship): keyof typeof Ionicons.glyphMap {
  switch (rel) {
    case "Teacher":
    case "Literature Teacher":
    case "Research Advisor":
    case "Professor":
      return "school-outline";
    case "Parent":
      return "heart-outline";
    case "Coach":
      return "trophy-outline";
    case "Friend":
      return "people-outline";
    case "Leader":
    case "Engineering Director":
      return "compass-outline";
    case "Art & Design Coach":
      return "color-palette-outline";
    case "Grandparent":
    case "Friend & Mentor":
    case "Colleague":
    case "Spiritual Guide":
    case "Other Mentor":
    case "Other":
      return "bulb-outline";
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
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
    color: Palette.accentSky,
    letterSpacing: 1.1,
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.06)",
    gap: 16,
  },
  fieldGroup: {},
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 46,
    fontSize: 14.5,
    fontWeight: "600",
    color: Palette.deepTeal,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.iceWhite,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
  },
  chipSelected: {
    backgroundColor: Palette.mintMist,
    borderColor: Palette.turquoise,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)",
  },
  chipPressed: {
    transform: [{ scale: 0.97 }],
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  chipTextSelected: {
    color: Palette.oceanTeal,
    fontWeight: "800",
  },
  selectedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Palette.turquoise,
    marginLeft: 2,
  },
});
