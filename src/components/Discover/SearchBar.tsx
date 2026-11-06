import React from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  isFiltered?: boolean;
  onFilterPress?: () => void;
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search a person, a memory, or a lesson…",
  isFiltered = false,
  onFilterPress,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          value.length > 0 && styles.inputContainerActive,
        ]}
      >
        <Ionicons
          name="search-outline"
          size={19}
          color={value ? Palette.accentSky : Palette.textMuted}
          style={styles.searchIcon}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Palette.textMuted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityRole="search"
          accessibilityLabel="Search stories, lessons, and people"
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={onClear}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearBtn}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color={Palette.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {onFilterPress && (
        <TouchableOpacity
          onPress={onFilterPress}
          activeOpacity={0.8}
          style={[
            styles.filterBtn,
            isFiltered && styles.filterBtnActive,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Toggle filter options"
        >
          <Ionicons
            name={isFiltered ? "options" : "options-outline"}
            size={18}
            color={isFiltered ? Palette.pureWhite : Palette.deepTeal}
          />
          {isFiltered && <View style={styles.filterDot} />}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 18,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceElevated,
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainerActive: {
    borderColor: Palette.oceanTeal,
    backgroundColor: Palette.surfaceElevated,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Palette.deepTeal,
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 4,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.pureWhite,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  filterBtnActive: {
    backgroundColor: Palette.oceanTeal,
    borderColor: Palette.oceanTeal,
  },
  filterDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.accentSky,
  },
});
