import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Palette, SystemColors, TextStyles, Layout } from "@/constants/theme";
import { api, setAuthToken } from "@/services/api";
import { userProfileService } from "@/services/userProfileService";
import { GoogleLogo } from "@/components/SocialLogos";
import { signInWithGoogle } from "@/services/auth";

type Step = "FORM" | "OTP";

export default function Register() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>("FORM");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  const handleGoogleSignUp = async (chosenEmail?: string) => {
    let cleanEmail = (chosenEmail || customGoogleEmail || email || "info@onodem.com").trim().toLowerCase();
    if (!cleanEmail.includes("@")) {
      cleanEmail = `${cleanEmail}@gmail.com`;
    }

    setGoogleLoading(true);
    setErrorMessage(null);
    setShowGoogleModal(false);

    try {
      const derivedName =
        name.trim() ||
        (cleanEmail === "info@onodem.com"
          ? "Onodem Official"
          : cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));

      const res = await signInWithGoogle({
        email: cleanEmail,
        name: derivedName,
      });

      if (res?.data?.accessToken) {
        router.replace("/profile-setup");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Google sign up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // 6-digit OTP verification state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState<number | null>(null);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(45);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (!isTimerActive) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const normalizedPhone = trimmedPhone.replace(/[\s().-]/g, "");

    if (!trimmedName || !trimmedEmail || !password) {
      setErrorMessage("Please enter your name, email, and password.");
      return;
    }

    if (trimmedPhone) {
      const digits = normalizedPhone.replace(/\D/g, "");
      if (!/^\+?\d+$/.test(normalizedPhone) || digits.length < 7 || digits.length > 15) {
        setErrorMessage("Enter a valid phone number with country code, or leave it blank.");
        return;
      }
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setResendNotice(null);

    try {
      // Pre-initialize local profile with entered details
      await userProfileService.updateProfile({
        name: trimmedName,
        username: trimmedEmail.split("@")[0] || "user",
        email: trimmedEmail,
        phone: normalizedPhone,
        bio: "Remembering the mentors and guides who shaped my life.",
        avatarUri:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      });

      const res = await api.auth.register({
        name: trimmedName,
        email: trimmedEmail,
        phone: normalizedPhone || undefined,
        password: password,
      });

      // If backend requires OTP verification before account activation
      if (res?.data?.requiresVerification || !res?.data?.accessToken) {
        setStep("OTP");
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(45);
        setIsTimerActive(true);
        setTimeout(() => otpRefs.current[0]?.focus(), 200);
      } else {
        // Direct access token returned (e.g. if verification is disabled in dev)
        await setAuthToken(res.data.accessToken, res.data.refreshToken);
        if (res.data.user) {
          await userProfileService.updateProfile({
            name: res.data.user.name || trimmedName,
            username: res.data.user.username || res.data.user.email?.split("@")[0] || trimmedEmail.split("@")[0],
            email: res.data.user.email || trimmedEmail,
            phone: res.data.user.phone || normalizedPhone,
            bio: res.data.user.bio || "Remembering the mentors and guides who shaped my life.",
            avatarUri:
              res.data.user.avatarUri ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          });
        }
        router.replace("/profile-setup");
      }
    } catch (err: any) {
      const msg = err.message || "Registration failed";
      if (
        msg.toLowerCase().includes("already registered") ||
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("duplicate")
      ) {
        setErrorMessage("An account with this email or phone number already exists. Try logging in.");
      } else {
        Alert.alert(
          "Registration Notice",
          `${msg}. Would you like to continue in demo mode?`,
          [
            { text: "Continue", onPress: () => router.replace("/profile-setup") },
            { text: "Retry", style: "cancel" },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    const updated = [...otp];

    if (cleaned.length > 1) {
      // Handle paste of up to 6 digits
      const pastedDigits = cleaned.slice(0, 6).split("");
      pastedDigits.forEach((digit, i) => {
        if (i < 6) updated[i] = digit;
      });
      setOtp(updated);
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpRefs.current[nextIndex]?.focus();
    } else {
      updated[index] = cleaned;
      setOtp(updated);
      if (cleaned && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }

    if (errorMessage) setErrorMessage(null);
    if (resendNotice) setResendNotice(null);
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setResendNotice(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const normalizedPhone = trimmedPhone.replace(/[\s().-]/g, "");

    try {
      const res = await api.auth.verifyRegistrationOtp(trimmedEmail, code);
      if (res?.data?.accessToken) {
        await setAuthToken(res.data.accessToken, res.data.refreshToken);
        if (res.data.user) {
          await userProfileService.updateProfile({
            name: res.data.user.name || trimmedName,
            username: res.data.user.username || res.data.user.email?.split("@")[0] || trimmedEmail.split("@")[0],
            email: res.data.user.email || trimmedEmail,
            phone: res.data.user.phone || normalizedPhone,
            bio: res.data.user.bio || "Remembering the mentors and guides who shaped my life.",
            avatarUri:
              res.data.user.avatarUri ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          });
        }
        router.replace("/profile-setup");
      } else {
        router.replace("/profile-setup");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid or expired verification code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isTimerActive || loading) return;
    setErrorMessage(null);
    setResendNotice(null);
    setLoading(true);

    try {
      await api.auth.resendRegistrationOtp(email.trim());
      setResendTimer(45);
      setIsTimerActive(true);
      setOtp(["", "", "", "", "", ""]);
      setResendNotice(`A new 6-digit code has been sent to ${email.trim()}.`);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "OTP") {
      setStep("FORM");
      setErrorMessage(null);
      setResendNotice(null);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
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
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={26} color={SystemColors.blue} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          {step === "OTP" ? (
            <View style={styles.container}>
              {/* OTP Hero Icon Badge */}
              <View style={styles.logoWrapper}>
                <View style={styles.otpIconBadge}>
                  <Ionicons name="mail" size={32} color={SystemColors.blue} />
                </View>
              </View>

              <Text style={styles.title} accessibilityRole="header">Verify Your Email</Text>

              <Text style={styles.subtitle}>
                We sent a 6-digit verification code to <Text style={styles.highlightText}>{email.trim()}</Text>. Enter the code below to activate your account.
              </Text>

              {/* Success Notification Banner */}
              {resendNotice && (
                <View style={styles.noticeContainer}>
                  <Ionicons name="checkmark-circle" size={16} color={SystemColors.green} />
                  <Text style={styles.noticeText}>{resendNotice}</Text>
                </View>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={SystemColors.red} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* 6 Digit Input Boxes */}
              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={({ nativeEvent }) =>
                      handleOtpKeyPress(nativeEvent.key, index)
                    }
                    onFocus={() => setFocusedOtpIndex(index)}
                    onBlur={() => setFocusedOtpIndex(null)}
                    keyboardType="number-pad"
                    maxLength={index === 0 ? 6 : 1}
                    selectTextOnFocus
                    selectionColor={SystemColors.blue}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : undefined,
                      focusedOtpIndex === index && styles.otpBoxFocused,
                    ]}
                  />
                ))}
              </View>

              {/* OTP Expiration and Sender Info */}
              <View style={styles.otpHelperCard}>
                <Ionicons name="information-circle-outline" size={16} color={SystemColors.blue} />
                <Text style={styles.otpHelperText}>
                  Official code sent from info@onodem.com. Code expires in 10 minutes. If you do not see it, check your spam or junk folder.
                </Text>
              </View>

              {/* Verify & Activate Button */}
              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleVerifyOtp}
                activeOpacity={0.7}
                disabled={loading}
                accessibilityRole="button"
                accessibilityState={{ busy: loading, disabled: loading }}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Verify &amp; Activate Account</Text>
                )}
              </TouchableOpacity>

              {/* Resend Code Option */}
              <View style={styles.resendRow}>
                <Text style={styles.resendMuted}>Didn&apos;t receive the code? </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={isTimerActive || loading}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.resendLink,
                      isTimerActive && styles.resendLinkDisabled,
                    ]}
                  >
                    {isTimerActive ? `Resend in ${resendTimer}s` : "Resend code"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Edit Details */}
              <TouchableOpacity
                onPress={() => {
                  setStep("FORM");
                  setErrorMessage(null);
                  setResendNotice(null);
                }}
                activeOpacity={0.6}
                style={styles.changeEmailTouch}
              >
                <Text style={styles.changeEmailText}>
                  Incorrect email? <Text style={styles.changeEmailLink}>Edit details</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.container}>
              {/* Brand Logo */}
              <View style={styles.logoWrapper}>
                <Image
                  source={require("../../assets/images/login-logo-clean.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.title} accessibilityRole="header">Create Account</Text>

              <Text style={styles.subtitle}>
                Start remembering and celebrating the people who shaped your journey.
              </Text>

              {/* Error Banner */}
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={SystemColors.red} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Inset grouped fields (iOS Settings style) */}
              <View style={styles.fieldGroup}>
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor={Palette.textMuted}
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  autoComplete="name"
                  textContentType="name"
                  autoCapitalize="words"
                  returnKeyType="next"
                  selectionColor={SystemColors.blue}
                  accessibilityLabel="Full name"
                />
                <View style={styles.separator} />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor={Palette.textMuted}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  value={email}
                  onChangeText={setEmail}
                  selectionColor={SystemColors.blue}
                  accessibilityLabel="Email"
                />
                <View style={styles.separator} />
                <TextInput
                  placeholder="Phone (Optional)"
                  placeholderTextColor={Palette.textMuted}
                  style={styles.input}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  value={phone}
                  onChangeText={setPhone}
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={SystemColors.blue}
                  accessibilityLabel="Phone number, optional"
                />
                <View style={styles.separator} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={Palette.textMuted}
                  style={styles.input}
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="go"
                  onSubmitEditing={handleRegister}
                  value={password}
                  onChangeText={setPassword}
                  selectionColor={SystemColors.blue}
                  accessibilityLabel="Password"
                />
              </View>
              <Text style={styles.fieldFooter}>
                Use at least 8 characters. Include a country code with your phone number.
              </Text>

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                activeOpacity={0.7}
                disabled={loading || googleLoading}
                accessibilityRole="button"
                accessibilityState={{ busy: loading, disabled: loading }}
              >
                {loading ? (
                  <ActivityIndicator color={Palette.textOnPrimary} size="small" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Divider OR */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign-Up Button */}
              <TouchableOpacity
                style={[styles.googleButton, googleLoading && { opacity: 0.7 }]}
                onPress={() => setShowGoogleModal(true)}
                activeOpacity={0.85}
                disabled={loading || googleLoading}
                accessibilityRole="button"
                accessibilityLabel="Sign up with Google"
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

              <TouchableOpacity
                onPress={() => router.replace("/login")}
                activeOpacity={0.6}
                style={styles.loginTouch}
                accessibilityRole="link"
              >
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginLink}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Google Account Selector Modal for Sign Up */}
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
                  <Text style={styles.googleModalTitle}>Sign up with Google</Text>
                  <Text style={styles.googleModalSubtitle}>
                    Use your personal Gmail or Google account to join Onodem
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
                          handleGoogleSignUp(customGoogleEmail);
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
                        handleGoogleSignUp(customGoogleEmail);
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.googlePrimarySubmitText}>Continue with Google</Text>
                  </TouchableOpacity>
                </View>


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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: SystemColors.systemBackground,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.marginWide,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    minHeight: Layout.minTouch,
    marginLeft: -8,
    paddingRight: 8,
    marginBottom: 8,
  },
  backButtonText: {
    ...TextStyles.body,
    color: SystemColors.blue,
    marginLeft: -2,
  },
  container: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 64,
    height: 64,
  },
  title: {
    ...TextStyles.largeTitle,
    color: SystemColors.label,
    marginBottom: 8,
  },
  subtitle: {
    ...TextStyles.body,
    color: SystemColors.secondaryLabel,
    marginBottom: 24,
  },
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
  fieldGroup: {
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusMedium,
    overflow: "hidden",
  },
  input: {
    height: Layout.controlHeight,
    paddingHorizontal: 16,
    ...TextStyles.body,
    color: SystemColors.label,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SystemColors.separator,
    marginLeft: 16,
  },
  fieldFooter: {
    ...TextStyles.footnote,
    color: SystemColors.secondaryLabel,
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: SystemColors.label,
    borderRadius: Layout.radiusMedium,
    height: Layout.controlHeight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  buttonText: {
    ...TextStyles.headline,
    color: "#000000",
  },
  loginTouch: {
    minHeight: Layout.minTouch,
    justifyContent: "center",
  },
  loginText: {
    ...TextStyles.subheadline,
    textAlign: "center",
    color: SystemColors.secondaryLabel,
  },
  loginLink: {
    color: SystemColors.blue,
    fontWeight: "600",
  },
  /* OTP Verification Styles */
  otpIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(10, 132, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  highlightText: {
    color: SystemColors.label,
    fontWeight: "600",
  },
  noticeContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(48, 209, 88, 0.15)",
    borderRadius: Layout.radiusSmall,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  noticeText: {
    ...TextStyles.footnote,
    color: SystemColors.green,
    flex: 1,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 54,
    borderRadius: Layout.radiusMedium,
    borderWidth: 1.5,
    borderColor: SystemColors.separator,
    backgroundColor: SystemColors.secondarySystemBackground,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: SystemColors.label,
  },
  otpBoxFilled: {
    borderColor: SystemColors.blue,
    backgroundColor: "rgba(10, 132, 255, 0.12)",
  },
  otpBoxFocused: {
    borderColor: SystemColors.blue,
    borderWidth: 2,
  },
  otpHelperCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusSmall,
    padding: 12,
    marginBottom: 20,
  },
  otpHelperText: {
    ...TextStyles.footnote,
    color: SystemColors.secondaryLabel,
    flex: 1,
    lineHeight: 18,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 8,
  },
  resendMuted: {
    ...TextStyles.subheadline,
    color: SystemColors.secondaryLabel,
  },
  resendLink: {
    ...TextStyles.subheadline,
    color: SystemColors.blue,
    fontWeight: "600",
  },
  resendLinkDisabled: {
    color: SystemColors.tertiaryLabel,
  },
  changeEmailTouch: {
    minHeight: Layout.minTouch,
    justifyContent: "center",
    alignItems: "center",
  },
  changeEmailText: {
    ...TextStyles.subheadline,
    color: SystemColors.secondaryLabel,
  },
  changeEmailLink: {
    color: SystemColors.blue,
    fontWeight: "600",
  },
  /* Divider */
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
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
    marginBottom: 8,
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
  customGoogleInput: {
    flex: 1,
    height: 44,
    ...TextStyles.body,
    color: SystemColors.label,
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
  googleCancelButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  googleCancelText: {
    ...TextStyles.body,
    color: SystemColors.secondaryLabel,
  },
});
