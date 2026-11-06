import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Palette, SystemColors, TextStyles, Layout } from "@/constants/theme";
import { api, setAuthToken } from "@/services/api";
import { userProfileService } from "@/services/userProfileService";
import { memoryService } from "@/services/memoryService";

export default function Login() {
  const insets = useSafeAreaInsets();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmed = usernameOrEmail.trim();
    if (!trimmed || !password) {
      setErrorMessage("Please enter your email, username, or phone number and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.auth.login({
        emailOrUsername: trimmed,
        password: password,
      });

      if (res?.data?.accessToken) {
        await setAuthToken(res.data.accessToken, res.data.refreshToken);
        if (res.data.user) {
          await userProfileService.updateProfile({
            name: res.data.user.name || trimmed.split("@")[0],
            username: res.data.user.username || res.data.user.email?.split("@")[0] || trimmed.split("@")[0],
            email: res.data.user.email || (trimmed.includes("@") ? trimmed : ""),
            bio: res.data.user.bio || "Remembering the mentors and guides who shaped my life.",
            avatarUri:
              res.data.user.avatarUri ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          });
        }
        await userProfileService.syncWithBackend();
        // Load this account's posts (and upload any made offline).
        memoryService.syncWithBackend().catch(() => {});
        // Accounts that never finished setup go there first.
        router.replace(res.data.user && res.data.user.setupComplete === false ? "/profile-setup" : "/home");
      } else {
        router.replace("/home");
      }
    } catch (err: any) {
      const errMsg = (err.message || "").toLowerCase();
      if (
        errMsg.includes("bad credentials") ||
        errMsg.includes("401") ||
        errMsg.includes("invalid") ||
        errMsg.includes("unauthorized")
      ) {
        setErrorMessage("Invalid email, username, phone number, or password. Please try again.");
      } else {
        // No backend/network available — auto-proceed in demo mode
        await userProfileService.updateProfile({
          name: trimmed.split("@")[0],
          username: trimmed.split("@")[0],
          email: trimmed.includes("@") ? trimmed : "",
        });
        router.replace("/home");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 16, 32),
              paddingBottom: Math.max(insets.bottom + 16, 32),
            },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header / Logo Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo_transparent.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* "Welcome Back" */}
            <Text style={styles.title} accessibilityRole="header">
              Welcome Back
            </Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>Sign in to honour those who shaped you</Text>
          </View>

          {/* Input Form Fields */}
          <View style={styles.formContainer}>
            {/* Username or Email Input */}
            <View style={styles.inputCard}>
              <Ionicons
                name="person"
                size={18}
                color={SystemColors.secondaryLabel}
                style={styles.inputLeadingIcon}
              />
              <TextInput
                value={usernameOrEmail}
                onChangeText={setUsernameOrEmail}
                placeholder="Email, username, or phone number"
                placeholderTextColor={Palette.textMuted}
                style={styles.textInput}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                keyboardType="email-address"
                returnKeyType="next"
                selectionColor={SystemColors.blue}
                accessibilityLabel="Email, username, or phone number"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputCard}>
              <Ionicons
                name="lock-closed"
                size={18}
                color={SystemColors.secondaryLabel}
                style={styles.inputLeadingIcon}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={Palette.textMuted}
                secureTextEntry={!showPassword}
                style={styles.textInput}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                selectionColor={SystemColors.blue}
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.eyeToggle}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={SystemColors.secondaryLabel}
                />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={SystemColors.red} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Password Forgot Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              activeOpacity={0.6}
              onPress={() => router.push("/forgot-password")}
              accessibilityRole="link"
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Primary Login Button (Ocean Teal) */}
            <TouchableOpacity
              style={[styles.loginButtonWrapper, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              activeOpacity={0.7}
              disabled={loading}
              accessibilityRole="button"
              accessibilityState={{ busy: loading, disabled: loading }}
            >
              <View style={styles.loginButton}>
                {loading ? (
                  <ActivityIndicator color={Palette.textOnPrimary} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Don't have an account link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Don&apos;t have an account? </Text>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => router.push("/register")}
                style={styles.registerTouch}
                accessibilityRole="link"
              >
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: SystemColors.systemBackground,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Layout.marginWide,
  },

  /* Header */
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  title: {
    ...TextStyles.largeTitle,
    color: SystemColors.label,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    ...TextStyles.body,
    color: SystemColors.secondaryLabel,
    textAlign: "center",
  },

  /* Form */
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    height: Layout.controlHeight,
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusMedium,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputLeadingIcon: {
    width: 22,
    marginRight: 10,
    textAlign: "center",
  },
  textInput: {
    flex: 1,
    ...TextStyles.body,
    color: SystemColors.label,
    paddingVertical: 0,
    height: "100%",
  },
  eyeToggle: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    marginRight: -10,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Error */
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255, 69, 58, 0.15)",
    borderRadius: Layout.radiusSmall,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: {
    ...TextStyles.footnote,
    color: SystemColors.label,
    flex: 1,
  },

  /* Forgot Password */
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    minHeight: Layout.minTouch,
    justifyContent: "center",
    marginBottom: 12,
  },
  forgotPasswordText: {
    ...TextStyles.subheadline,
    color: SystemColors.blue,
  },

  /* Primary button */
  loginButtonWrapper: {
    borderRadius: Layout.radiusMedium,
    overflow: "hidden",
  },
  loginButton: {
    height: Layout.controlHeight,
    backgroundColor: SystemColors.label,
    borderRadius: Layout.radiusMedium,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    ...TextStyles.headline,
    color: "#000000",
  },

  /* Register row */
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  registerPrompt: {
    ...TextStyles.subheadline,
    color: SystemColors.secondaryLabel,
  },
  registerTouch: {
    minHeight: Layout.minTouch,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  registerLink: {
    ...TextStyles.subheadline,
    fontWeight: "600",
    color: SystemColors.blue,
  },
});
