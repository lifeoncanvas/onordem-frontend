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
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Palette, SystemColors, TextStyles, Layout } from "@/constants/theme";
import { api, setAuthToken } from "@/services/api";
import { userProfileService } from "@/services/userProfileService";
import { memoryService } from "@/services/memoryService";
import { GoogleLogo } from "@/components/SocialLogos";
import { signInWithGoogle } from "@/services/auth";

export default function Login() {
  const insets = useSafeAreaInsets();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

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

  const executeGoogleSignIn = async (email: string, name?: string) => {
    let cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    if (!cleanEmail.includes("@")) {
      cleanEmail = `${cleanEmail}@gmail.com`;
    }

    setGoogleLoading(true);
    setErrorMessage(null);
    setShowGoogleModal(false);

    try {
      const derivedName =
        name ||
        (cleanEmail === "info@onodem.com"
          ? "Onodem Official"
          : cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));

      const res = await signInWithGoogle({
        email: cleanEmail,
        name: derivedName,
      });

      if (res?.data?.accessToken) {
        router.replace("/home");
      } else {
        router.replace("/home");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Google Sign-In failed. Please try again.");
    } finally {
      setGoogleLoading(false);
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

            {/* Primary Login Button */}
            <TouchableOpacity
              style={[styles.loginButtonWrapper, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              activeOpacity={0.7}
              disabled={loading || googleLoading}
              accessibilityRole="button"
              accessibilityState={{ busy: loading, disabled: loading }}
            >
              <View style={styles.loginButton}>
                {loading ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Divider OR */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={[styles.googleButton, googleLoading && { opacity: 0.7 }]}
              onPress={() => setShowGoogleModal(true)}
              activeOpacity={0.85}
              disabled={loading || googleLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
            >
              {googleLoading ? (
                <ActivityIndicator color={SystemColors.label} size="small" />
              ) : (
                <View style={styles.googleButtonContent}>
                  <GoogleLogo size={20} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </View>
              )}
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

            {/* Google Account Selector Modal */}
            <Modal
              visible={showGoogleModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowGoogleModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.googleModalContent}>
                  <View style={styles.googleModalHeader}>
                    <GoogleLogo size={32} />
                    <Text style={styles.googleModalTitle}>Sign in with Google</Text>
                    <Text style={styles.googleModalSubtitle}>
                      Sign in with your personal Gmail or Google account
                    </Text>
                  </View>

                  {/* Gmail Input Field for ANY User */}
                  <View style={styles.gmailInputWrapper}>
                    <Text style={styles.gmailInputLabel}>Your Gmail or Google Account</Text>
                    <View style={styles.gmailInputRow}>
                      <Ionicons name="mail-outline" size={18} color={SystemColors.secondaryLabel} style={{ marginRight: 8 }} />
                      <TextInput
                        value={customGoogleEmail}
                        onChangeText={setCustomGoogleEmail}
                        placeholder="yourname@gmail.com"
                        placeholderTextColor={Palette.textMuted}
                        style={styles.customGoogleInput}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoFocus
                        returnKeyType="go"
                        onSubmitEditing={() => {
                          if (customGoogleEmail.trim()) {
                            executeGoogleSignIn(customGoogleEmail);
                          }
                        }}
                      />
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.googlePrimarySubmitBtn,
                        !customGoogleEmail.trim() && { opacity: 0.6 },
                      ]}
                      disabled={!customGoogleEmail.trim()}
                      onPress={() => {
                        if (customGoogleEmail.trim()) {
                          executeGoogleSignIn(customGoogleEmail);
                        }
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.googlePrimarySubmitText}>Continue with Google</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Quick Select for Official Domain */}
                  <View style={styles.quickAccountDivider}>
                    <View style={styles.quickDividerLine} />
                    <Text style={styles.quickDividerText}>or quick sign-in</Text>
                    <View style={styles.quickDividerLine} />
                  </View>

                  {/* Primary Option: info@onodem.com */}
                  <TouchableOpacity
                    style={styles.googleAccountCard}
                    onPress={() => executeGoogleSignIn("info@onodem.com", "Onodem Official")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.googleAvatarBadge}>
                      <Text style={styles.googleAvatarText}>O</Text>
                    </View>
                    <View style={styles.googleAccountInfo}>
                      <Text style={styles.googleAccountName}>Onodem Official</Text>
                      <Text style={styles.googleAccountEmail}>info@onodem.com</Text>
                    </View>
                    <View style={styles.googleActivePill}>
                      <Text style={styles.googleActivePillText}>Sign In</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.googleCancelButton}
                    onPress={() => setShowGoogleModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.googleCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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

  /* Divider */
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: SystemColors.separator,
  },
  dividerText: {
    ...TextStyles.footnote,
    color: SystemColors.secondaryLabel,
    marginHorizontal: 12,
    textTransform: "uppercase",
  },

  /* Google Button */
  googleButton: {
    height: Layout.controlHeight,
    borderRadius: Layout.radiusMedium,
    backgroundColor: SystemColors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: SystemColors.separator,
    justifyContent: "center",
    alignItems: "center",
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  googleButtonText: {
    ...TextStyles.headline,
    color: SystemColors.label,
    fontSize: 16,
  },

  /* Google Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  googleModalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusLarge,
    padding: 24,
    borderWidth: 1,
    borderColor: SystemColors.separator,
  },
  googleModalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  googleModalTitle: {
    ...TextStyles.title2,
    color: SystemColors.label,
    marginTop: 12,
    marginBottom: 4,
  },
  googleModalSubtitle: {
    ...TextStyles.subheadline,
    color: SystemColors.secondaryLabel,
    textAlign: "center",
  },
  /* Gmail Input Section */
  gmailInputWrapper: {
    marginBottom: 16,
  },
  gmailInputLabel: {
    ...TextStyles.footnote,
    fontWeight: "600",
    color: SystemColors.label,
    marginBottom: 8,
  },
  gmailInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SystemColors.tertiarySystemBackground,
    borderRadius: Layout.radiusMedium,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: SystemColors.separator,
    marginBottom: 10,
  },
  googlePrimarySubmitBtn: {
    height: 46,
    backgroundColor: "#4285F4",
    borderRadius: Layout.radiusMedium,
    alignItems: "center",
    justifyContent: "center",
  },
  googlePrimarySubmitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  quickAccountDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  quickDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: SystemColors.separator,
  },
  quickDividerText: {
    ...TextStyles.caption2,
    color: SystemColors.secondaryLabel,
    marginHorizontal: 8,
    textTransform: "uppercase",
  },

  /* Google Account Card */
  googleAccountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SystemColors.tertiarySystemBackground,
    borderRadius: Layout.radiusMedium,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(66, 133, 244, 0.4)",
    marginBottom: 14,
  },
  googleAvatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  googleAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  googleAccountInfo: {
    flex: 1,
  },
  googleAccountName: {
    ...TextStyles.headline,
    fontSize: 15,
    color: SystemColors.label,
  },
  googleAccountEmail: {
    ...TextStyles.footnote,
    color: SystemColors.secondaryLabel,
    marginTop: 2,
  },
  googleActivePill: {
    backgroundColor: "#4285F4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  googleActivePillText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  customGoogleInput: {
    flex: 1,
    height: 44,
    ...TextStyles.body,
    color: SystemColors.label,
  },
  googleCancelButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  googleCancelText: {
    ...TextStyles.body,
    color: SystemColors.secondaryLabel,
  },
});
