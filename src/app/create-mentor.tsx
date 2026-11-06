import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MENTOR_RELATIONSHIPS } from "@/data/createStudioData";
import { Palette } from "@/constants/theme";
import { memoryService } from "@/services/memoryService";

export default function CreateMentorScreen() {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Teacher");
  const [description, setDescription] = useState("");
  const [quote, setQuote] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Enter your mentor's name before saving.");
      return;
    }
    const mentor = memoryService.addMentor({
      name,
      relationship,
      description,
      meaningfulQuote: quote,
    });
    router.replace({
      pathname: "/mentor-profile/[id]",
      params: { id: mentor.id },
    });
  };

  const handleCancel = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel adding mentor"
        >
          <Ionicons name="chevron-back" size={22} color={Palette.deepTeal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add a Mentor</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="person-add-outline" size={24} color={Palette.oceanTeal} />
          </View>
          <Text style={styles.heading}>Keep someone meaningful close</Text>
          <Text style={styles.introText}>
            Add a person to your mentor archive. You can edit their details or add memories later.
          </Text>
        </View>

        <Text style={styles.label}>NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Mrs. Anita Sharma"
          placeholderTextColor={Palette.textMuted}
          style={styles.input}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Text style={styles.label}>RELATIONSHIP</Text>
        <View style={styles.chips}>
          {MENTOR_RELATIONSHIPS.map((item) => {
            const selected = item === relationship;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setRelationship(item)}
                style={[styles.chip, selected && styles.chipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>ABOUT THEM</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What makes this person important to you?"
          placeholderTextColor={Palette.textMuted}
          style={[styles.input, styles.multiline]}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>WORDS TO REMEMBER (OPTIONAL)</Text>
        <TextInput
          value={quote}
          onChangeText={setQuote}
          placeholder="A saying or piece of advice that stayed with you"
          placeholderTextColor={Palette.textMuted}
          style={[styles.input, styles.multiline, styles.quoteInput]}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Ionicons name="checkmark" size={18} color={Palette.pureWhite} />
            <Text style={styles.saveText}>Save Mentor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.iceWhite },
  header: {
    height: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { color: Palette.deepTeal, fontSize: 18, fontWeight: "800" },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  introCard: {
    alignItems: "center",
    padding: 22,
    marginBottom: 24,
    borderRadius: 22,
    backgroundColor: Palette.mintMist,
  },
  introIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.pureWhite,
  },
  heading: {
    marginTop: 13,
    color: Palette.deepTeal,
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },
  introText: {
    marginTop: 7,
    color: Palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  label: {
    marginBottom: 8,
    color: Palette.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    marginBottom: 20,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
    color: Palette.deepTeal,
    fontSize: 14,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 22 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
  },
  chipSelected: { backgroundColor: Palette.oceanTeal, borderColor: Palette.oceanTeal },
  chipText: { color: Palette.textSecondary, fontSize: 12, fontWeight: "600" },
  chipTextSelected: { color: Palette.pureWhite },
  multiline: { minHeight: 92, paddingTop: 12 },
  quoteInput: { minHeight: 74 },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelButton: {
    flex: 1,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  cancelText: { color: Palette.deepTeal, fontWeight: "700" },
  saveButton: {
    flex: 1,
    height: 50,
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: Palette.oceanTeal,
  },
  saveText: { color: Palette.pureWhite, fontWeight: "800" },
});
