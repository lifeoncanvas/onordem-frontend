import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
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
import * as ImagePicker from "expo-image-picker";
import { persistImageUri } from "@/utils/persistMedia";

import { Palette } from "@/constants/theme";
import { UserProfile, userProfileService } from "@/services/userProfileService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,24}$/;

export default function ProfileEditScreen() {
  const [profile, setProfile] = useState<UserProfile>(() =>
    userProfileService.getProfile()
  );
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUri, setAvatarUri] = useState(profile.avatarUri);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(
    () =>
      userProfileService.subscribe((nextProfile) => {
        setProfile(nextProfile);
      }),
    []
  );

  useEffect(() => {
    let mounted = true;
    userProfileService
      .initialize()
      .then((nextProfile) => {
        if (!mounted) return;
        setProfile(nextProfile);
        setName(nextProfile.name);
        setUsername(nextProfile.username);
        setEmail(nextProfile.email);
        setBio(nextProfile.bio);
        setAvatarUri(nextProfile.avatarUri);
      })
      .catch((error: unknown) => {
        console.error("Unable to load profile for editing:", error);
        if (mounted) setErrorMessage("Your saved profile could not be loaded.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const choosePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Photo access required",
          "Allow photo library access to choose a profile picture."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]) {
        setAvatarUri(await persistImageUri(result.assets[0].uri));
      }
    } catch (error) {
      console.error("Unable to choose profile photo:", error);
      Alert.alert("Photo unavailable", "Could not open your photo library.");
    }
  };

  const saveProfile = async () => {
    const cleanUsername = username.trim().replace(/^@/, "");
    if (!name.trim()) {
      setErrorMessage("Enter your name before saving.");
      return;
    }
    if (!USERNAME_REGEX.test(cleanUsername)) {
      setErrorMessage("Use 3–24 letters, numbers, periods or underscores for your username.");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    setErrorMessage("");
    setIsSaving(true);
    try {
      await userProfileService.updateProfile({
        name,
        username: cleanUsername,
        email,
        bio,
        avatarUri,
      });

      // Also persist to backend if signed in
      try {
        await userProfileService.pushToBackend();
      } catch (error) {
        // Saved on this device; show why the server refused (e.g. username taken).
        const message = error instanceof Error ? error.message : "";
        if (message && !/network|fetch/i.test(message)) {
          setErrorMessage(message);
          return;
        }
      }

      router.back();
    } catch (error) {
      console.error("Unable to save profile:", error);
      setErrorMessage("Your changes could not be saved. Check your device storage and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/profile");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={cancel}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel profile editing"
        >
          <Ionicons name="close" size={23} color={Palette.deepTeal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit your profile</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.photoPicker}
            onPress={choosePhoto}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Choose a profile photograph"
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarFallback}>{getInitials(profile.name)}</Text>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : null}
            </View>
            <View style={styles.photoButton}>
              <Ionicons name="camera-outline" size={16} color={Palette.deepTeal} />
              <Text style={styles.photoButtonText}>Change photograph</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.intro}>
            The details that make this archive yours.
          </Text>
          {isLoading ? (
            <ActivityIndicator color={Palette.turquoise} style={styles.loader} />
          ) : (
            <>
              <Field label="FULL NAME">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor={Palette.textMuted}
                  autoCapitalize="words"
                  maxLength={80}
                />
              </Field>
              <Field label="USERNAME">
                <View style={styles.usernameInput}>
                  <Text style={styles.usernamePrefix}>@</Text>
                  <TextInput
                    value={username}
                    onChangeText={(value) => setUsername(value.replace(/^@/, ""))}
                    style={[styles.input, styles.usernameTextInput]}
                    placeholder="yourname"
                    placeholderTextColor={Palette.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={24}
                  />
                </View>
                <Text style={styles.helperText}>
                  Usernames are stored on this device; availability cannot be checked without an account service.
                </Text>
              </Field>
              <Field label="EMAIL">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Palette.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Field>
              <Field label="BIO">
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  style={[styles.input, styles.bioInput]}
                  placeholder="A few words about your gratitude"
                  placeholderTextColor={Palette.textMuted}
                  multiline
                  maxLength={160}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>{bio.length}/160</Text>
              </Field>
            </>
          )}

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={17} color="#9E2A2B" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancel}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, (isSaving || isLoading) && styles.disabledButton]}
              onPress={saveProfile}
              disabled={isSaving || isLoading}
              activeOpacity={0.82}
              accessibilityRole="button"
            >
              {isSaving ? (
                <ActivityIndicator color={Palette.pureWhite} />
              ) : (
                <Text style={styles.saveText}>Save changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.iceWhite },
  flex: { flex: 1 },
  header: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: { width: 42, height: 42, justifyContent: "center" },
  headerTitle: {
    color: Palette.deepTeal,
    fontSize: 21,
    fontWeight: "800",
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 40,
  },
  photoPicker: { alignItems: "center", marginTop: 11 },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: Palette.turquoise,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarFallback: {
    color: Palette.deepTeal,
    fontSize: 32,
    fontWeight: "800",
  },
  avatarImage: { position: "absolute", width: "100%", height: "100%" },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: Palette.mintMist,
  },
  photoButtonText: { color: Palette.deepTeal, fontSize: 12, fontWeight: "700" },
  intro: {
    marginTop: 20,
    marginBottom: 22,
    color: Palette.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  loader: { marginVertical: 24 },
  field: { marginBottom: 18 },
  fieldLabel: {
    marginBottom: 7,
    color: Palette.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  input: {
    minHeight: 49,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: 13,
    backgroundColor: Palette.pureWhite,
    color: Palette.deepTeal,
    fontSize: 14,
  },
  usernameInput: { flexDirection: "row", alignItems: "center" },
  usernamePrefix: {
    position: "absolute",
    zIndex: 1,
    left: 14,
    color: Palette.textSecondary,
    fontSize: 14,
  },
  usernameTextInput: { flex: 1, paddingLeft: 32 },
  helperText: { marginTop: 5, color: Palette.textMuted, fontSize: 10, lineHeight: 15 },
  bioInput: { minHeight: 90, paddingTop: 13 },
  characterCount: {
    marginTop: 4,
    color: Palette.textMuted,
    fontSize: 10,
    textAlign: "right",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 11,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: "#FCE8E5",
  },
  errorText: { flex: 1, color: "#9E2A2B", fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelButton: {
    flex: 1,
    minHeight: 49,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
  },
  cancelText: { color: Palette.deepTeal, fontSize: 13, fontWeight: "700" },
  saveButton: {
    flex: 1,
    minHeight: 49,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: Palette.oceanTeal,
  },
  disabledButton: { opacity: 0.6 },
  saveText: { color: Palette.pureWhite, fontSize: 13, fontWeight: "800" },
});
