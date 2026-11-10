import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts, Palette } from "@/constants/theme";
import { memoryService } from "@/services/memoryService";

interface TodaysMemoryProps {
  onAnotherMemoryPress?: () => void;
}

export default function TodaysMemory({ onAnotherMemoryPress }: TodaysMemoryProps) {
  const [index, setIndex] = useState(0);

  const realMemories = useMemo(() => {
    return memoryService
      .getAllMemories()
      .filter((m) => m.quote && m.mentorName)
      .map((m) => ({
        quote: m.quote?.startsWith("“") || m.quote?.startsWith('"') ? m.quote : `“${m.quote}”`,
        author: m.mentorName,
      }));
  }, []);

  if (realMemories.length === 0) {
    return null;
  }

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % realMemories.length);
    onAnotherMemoryPress?.();
  };

  const current = realMemories[index % realMemories.length];

  return (
    <View style={styles.container}>
      <Text style={styles.scriptLabel}>Today’s memory</Text>
      <Text style={styles.quoteText}>{current.quote}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.authorText}>{current.author}</Text>
        {realMemories.length > 1 && (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cycle to another memory"
          >
            <Text style={styles.anotherLink}>Another memory</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Inset Divider Line */}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 4,
  },
  scriptLabel: {
    fontSize: 20,
    fontFamily: Fonts.serif,
    fontStyle: "italic",
    fontWeight: "700",
    color: Palette.accentLavender,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  quoteText: {
    fontFamily: Fonts.serif,
    fontSize: 23,
    fontWeight: "700",
    color: Palette.textPrimary,
    lineHeight: 31,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  authorText: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontStyle: "italic",
    fontWeight: "700",
    color: Palette.textPrimary,
    letterSpacing: -0.2,
  },
  anotherLink: {
    fontSize: 14,
    fontWeight: "600",
    color: Palette.accentLavender,
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: Palette.borderSubtle,
    marginTop: 20,
  },
});
