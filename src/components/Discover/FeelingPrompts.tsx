import React, { useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { FeelingPromptItem, FeelingThemeId } from "@/types/story";

interface FeelingPromptsProps {
  prompts: FeelingPromptItem[];
  selectedThemeId?: FeelingThemeId;
  onSelectTheme: (id: FeelingThemeId) => void;
}

export default function FeelingPrompts({
  prompts,
  selectedThemeId,
  onSelectTheme,
}: FeelingPromptsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>What Would You Like to Find Today?</Text>
          <Text style={styles.subheading}>
            Explore stories guided by human emotion and memory
          </Text>
        </View>
        {selectedThemeId && (
          <TouchableOpacity
            onPress={() => onSelectTheme(selectedThemeId)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.resetText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.grid}>
        {prompts.map((prompt) => {
          const isSelected = selectedThemeId === prompt.id;
          return (
            <FeelingPromptCard
              key={prompt.id}
              prompt={prompt}
              isSelected={isSelected}
              onPress={() => onSelectTheme(prompt.id)}
            />
          );
        })}
      </View>
    </View>
  );
}

interface FeelingPromptCardProps {
  prompt: FeelingPromptItem;
  isSelected: boolean;
  onPress: () => void;
}

function FeelingPromptCard({
  prompt,
  isSelected,
  onPress,
}: FeelingPromptCardProps) {
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  const liftAnim = useMemo(() => new Animated.Value(0), []);
  const isHovered = useRef(false);
  const isPressed = useRef(false);

  const animateCard = (hovered: boolean, pressed: boolean) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: pressed ? 0.96 : hovered ? 1.025 : 1,
        useNativeDriver: Platform.OS !== "web",
        speed: pressed ? 30 : 20,
        bounciness: pressed ? 3 : 5,
      }),
      Animated.spring(liftAnim, {
        toValue: pressed ? -5 : hovered ? -3 : 0,
        useNativeDriver: Platform.OS !== "web",
        speed: pressed ? 30 : 20,
        bounciness: pressed ? 3 : 5,
      }),
    ]).start();
  };

  const handleHoverIn = () => {
    isHovered.current = true;
    animateCard(true, isPressed.current);
  };

  const handleHoverOut = () => {
    isHovered.current = false;
    animateCard(false, isPressed.current);
  };

  const handlePressIn = () => {
    isPressed.current = true;
    animateCard(isHovered.current, true);
  };

  const handlePressOut = () => {
    isPressed.current = false;
    animateCard(isHovered.current, false);
  };

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        { transform: [{ translateY: liftAnim }, { scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        style={({ pressed }) => [
          styles.card,
          isSelected ? styles.cardSelected : styles.cardUnselected,
          pressed && styles.cardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Select theme: ${prompt.title}`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconCircle,
              isSelected
                ? styles.iconCircleSelected
                : styles.iconCircleUnselected,
            ]}
          >
            <Ionicons
              name={prompt.iconName as keyof typeof Ionicons.glyphMap}
              size={18}
              color={isSelected ? Palette.pureWhite : Palette.turquoise}
            />
          </View>

          {isSelected && (
            <View style={styles.activeCheckPill}>
              <Ionicons name="checkmark" size={12} color={Palette.pureWhite} />
            </View>
          )}
        </View>

        <Text
          style={[
            styles.title,
            isSelected ? styles.titleSelected : styles.titleUnselected,
          ]}
          numberOfLines={2}
        >
          &ldquo;{prompt.title}&rdquo;
        </Text>

        <Text
          style={[
            styles.subtitle,
            isSelected ? styles.subtitleSelected : styles.subtitleUnselected,
          ]}
          numberOfLines={2}
        >
          {prompt.subtitle}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  heading: {
    fontSize: 19,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginTop: 3,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.turquoise,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "100%",
    borderRadius: 18,
    padding: 14,
    minHeight: 130,
    justifyContent: "space-between",
    borderWidth: 1.2,
  },
  cardOuter: {
    width: "48%",
  },
  cardUnselected: {
    backgroundColor: Palette.mintMist, // Soft Mint Mist background
    borderColor: "rgba(236, 143, 62, 0.22)",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.04)",
  },
  cardSelected: {
    backgroundColor: Palette.oceanTeal, // Ocean Teal when active
    borderColor: Palette.oceanTeal,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)",
  },
  cardPressed: {
    borderColor: "rgba(236, 143, 62, 0.7)",
    boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.22)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleUnselected: {
    backgroundColor: Palette.pureWhite,
  },
  iconCircleSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  activeCheckPill: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.turquoise,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 13.5,
    fontWeight: "800",
    lineHeight: 18,
    marginBottom: 4,
  },
  titleUnselected: {
    color: Palette.deepTeal,
  },
  titleSelected: {
    color: Palette.pureWhite,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
  subtitleUnselected: {
    color: Palette.textSecondary,
  },
  subtitleSelected: {
    color: "rgba(255, 248, 240, 0.8)",
  },
});
