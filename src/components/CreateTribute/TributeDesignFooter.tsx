import React, { useMemo } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface TributeDesignFooterProps {
  onContinue: () => void;
  errorMessage?: string | null;
}

export default function TributeDesignFooter({
  onContinue,
  errorMessage,
}: TributeDesignFooterProps) {
  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Friendly Validation Feedback Message */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#9E2A2B" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* Supporting Text */}
      <Text style={styles.supportingText}>
        Turn your gratitude into a recognition card they will want to keep.
      </Text>

      {/* Prominent Action Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onContinue}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.continueButton}
          accessibilityRole="button"
          accessibilityLabel="Continue to design appreciation card"
        >
          <View style={styles.buttonTextGroup}>
            <Text style={styles.buttonLabel}>Continue to Design</Text>
            <Text style={styles.buttonSub}>Choose a card style and details</Text>
          </View>

          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFECEB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(158, 42, 43, 0.3)",
  },
  errorText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#9E2A2B",
    flex: 1,
  },
  supportingText: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    textAlign: "center",
    marginBottom: 10,
    fontStyle: "italic",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  buttonTextGroup: {},
  buttonLabel: {
    fontSize: 16.5,
    fontWeight: "900",
    color: "#1A0409",
    letterSpacing: -0.3,
  },
  buttonSub: {
    fontSize: 11.5,
    color: "rgba(26, 4, 9, 0.65)",
    marginTop: 2,
    fontWeight: "500",
  },
  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1A0409",
    alignItems: "center",
    justifyContent: "center",
  },
});
