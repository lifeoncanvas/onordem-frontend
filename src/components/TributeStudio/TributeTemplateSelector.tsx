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
import { TemplateOption, TributeTemplateId } from "@/types/create";

interface TributeTemplateSelectorProps {
  templates: TemplateOption[];
  selectedTemplateId: TributeTemplateId;
  onSelectTemplate: (templateId: TributeTemplateId) => void;
}

export default function TributeTemplateSelector({
  templates,
  selectedTemplateId,
  onSelectTemplate,
}: TributeTemplateSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Ionicons name="sparkles" size={11} color={Palette.turquoise} />
          <Text style={styles.sectionLabel}>LAYOUT & DESIGN</Text>
        </View>
        <Text style={styles.sectionTitle}>Choose a template</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {templates.map((tmpl) => {
          const isSelected = selectedTemplateId === tmpl.id;

          return (
            <Pressable
              key={tmpl.id}
              onPress={() => onSelectTemplate(tmpl.id)}
              style={({ pressed }) => [
                styles.card,
                isSelected && styles.cardActive,
                pressed && styles.cardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${tmpl.name} template`}
              accessibilityState={{ selected: isSelected }}
            >
              {/* Thumbnail Image */}
              <View style={styles.thumbWrap}>
                <Image
                  source={{ uri: tmpl.thumbnail }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
                {isSelected && (
                  <View style={styles.activeCheckCircle}>
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color={Palette.pureWhite}
                    />
                  </View>
                )}
                <View style={styles.iconTag}>
                  <Ionicons
                    name={tmpl.icon}
                    size={11}
                    color={Palette.deepTeal}
                  />
                </View>
              </View>

              {/* Title & Subtitle */}
              <View style={styles.textWrap}>
                <Text
                  style={[
                    styles.tmplName,
                    isSelected && styles.tmplNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {tmpl.name}
                </Text>
                <Text style={styles.tmplSubtitle} numberOfLines={1}>
                  {tmpl.subtitle}
                </Text>
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
    marginVertical: 14,
  },
  headerRow: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 140,
    backgroundColor: Palette.pureWhite,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardActive: {
    borderColor: Palette.turquoise,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    backgroundColor: Palette.surfaceCard,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },
  thumbWrap: {
    height: 85,
    position: "relative",
    backgroundColor: Palette.mintMist,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  activeCheckCircle: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Palette.oceanTeal,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Palette.pureWhite,
  },
  iconTag: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(255, 248, 240, 0.9)",
    padding: 3,
    borderRadius: 6,
  },
  textWrap: {
    padding: 8,
  },
  tmplName: {
    fontSize: 12,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  tmplNameActive: {
    color: Palette.oceanTeal,
  },
  tmplSubtitle: {
    fontSize: 10,
    color: Palette.textSecondary,
    marginTop: 2,
  },
});
