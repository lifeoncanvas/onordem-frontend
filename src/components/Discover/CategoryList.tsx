import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCategoryAccent, Palette } from "@/constants/theme";
import { CategoryItem, RelationshipType } from "@/types/story";

interface CategoryListProps {
  categories: CategoryItem[];
  selectedCategory: RelationshipType;
  onSelectCategory: (category: RelationshipType) => void;
}

export default function CategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Explore by Relationship</Text>
        {selectedCategory !== "all" && (
          <TouchableOpacity
            onPress={() => onSelectCategory("all")}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.resetText}>Show All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => onSelectCategory(cat.key)}
              activeOpacity={0.78}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${cat.label}`}
              accessibilityState={{ selected: isSelected }}
            >
              <View
                style={[
                  styles.iconWrap,
                  isSelected ? styles.iconWrapSelected : styles.iconWrapUnselected,
                ]}
              >
                <Ionicons
                  name={cat.iconName as keyof typeof Ionicons.glyphMap}
                  size={15}
                  color={getCategoryAccent(cat.label)}
                />
              </View>

              <Text
                style={[
                  styles.chipLabel,
                  isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 26,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  heading: {
    fontSize: 19,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.turquoise,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.2,
  },
  chipUnselected: {
    backgroundColor: "#161616",
    borderColor: "rgba(255, 255, 255, 0.08)",
    boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
  },
  chipSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.25)",
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
  },
  iconWrapUnselected: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  iconWrapSelected: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  chipLabel: {
    fontSize: 13,
  },
  chipLabelUnselected: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chipLabelSelected: {
    fontWeight: "800",
    color: "#111111",
  },
});
