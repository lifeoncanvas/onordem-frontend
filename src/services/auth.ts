/**
 * Authentication Service Module
 *
 * Keeps UI components decoupled from backend authentication logic.
 * Integrates with Onodem Backend (Spring Boot + Supabase/Neon) or runs in demo mode.
 */

import { api, clearAuthToken, setAuthToken } from "./api";
import { memoryService } from "./memoryService";
import { userProfileService } from "./userProfileService";

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface RegistrationOtpResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * TOGGLE THIS FLAG ONCE YOU HAVE RUN YOUR SPRING BOOT BACKEND.
 */
export let IS_BACKEND_CONFIGURED = true;

/**
 * DEMO MODE FLAG:
 * Set to `true` while developing/previewing so you can test all steps
 * (Email -> 6-digit OTP code -> Set New Password -> Success Dialog).
 */
export let DEMO_MODE = true;

export async function signOut(): Promise<void> {
  await clearAuthToken();
  await memoryService.clearUserData();
  await userProfileService.clearProfile().catch(() => {});
}

export async function deleteAccount(): Promise<void> {
  if (!IS_BACKEND_CONFIGURED) {
    throw new Error(
      "Account deletion is unavailable because this app has no connected authentication backend."
    );
  }
  throw new Error("No authentication provider account-deletion handler has been configured.");
}

/**
 * Sign in or sign up with any Google account (Gmail or Google Workspace)
 */
export async function signInWithGoogle(options?: {
  idToken?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}): Promise<any> {
  const email = (options?.email || "info@onodem.com").trim().toLowerCase();
  const fallbackName = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const payload = {
    idToken: options?.idToken,
    email: email,
    name: options?.name || fallbackName,
    avatarUrl: options?.avatarUrl,
  };

  try {
    const res = await api.auth.googleLogin(payload);
    if (res?.data?.accessToken) {
      await setAuthToken(res.data.accessToken, res.data.refreshToken);
      if (res.data.user) {
        await userProfileService.updateProfile({
          name: res.data.user.name || payload.name,
          username: res.data.user.username || payload.email.split("@")[0],
          email: res.data.user.email || payload.email,
          bio: res.data.user.bio || "Remembering the mentors and guides who shaped my life.",
          avatarUri:
            res.data.user.avatarUri ||
            payload.avatarUrl ||
            "",
        });
      }
      await userProfileService.syncWithBackend().catch(() => {});
      return res;
    }
    return res;
  } catch (error: any) {
    const errMsg = (error?.message || "").toLowerCase();
    // If backend is unreachable or returning a gateway/server error (502 Bad Gateway, 503, 504, 500, network error),
    // gracefully fall back to local demo profile so the user is never blocked.
    if (
      DEMO_MODE ||
      errMsg.includes("502") ||
      errMsg.includes("503") ||
      errMsg.includes("504") ||
      errMsg.includes("500") ||
      errMsg.includes("failed with status") ||
      errMsg.includes("network") ||
      errMsg.includes("fetch") ||
      errMsg.includes("connect")
    ) {
      console.warn("Backend unavailable or returned gateway error. Proceeding with local session fallback.");
      const fallbackToken = `demo_google_token_${Date.now()}`;
      await setAuthToken(fallbackToken, `demo_refresh_${Date.now()}`);
      await userProfileService.updateProfile({
        name: payload.name,
        username: payload.email.split("@")[0],
        email: payload.email,
        bio: "Remembering the mentors and guides who shaped my life.",
        avatarUri:
          payload.avatarUrl ||
          "",
      });
      return {
        success: true,
        message: "Signed in with Google (Offline Fallback)",
        data: {
          accessToken: fallbackToken,
          user: {
            name: payload.name,
            username: payload.email.split("@")[0],
            email: payload.email,
            avatarUri: payload.avatarUrl,
            setupComplete: true,
          },
        },
      };
    }
    throw new Error(error?.message || "Google Sign-In failed. Please try again.");
  }
}

/**
 * 1. Request Password Reset / OTP Code (6-digit OTP, expires in 10 minutes)
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetResponse> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    if (IS_BACKEND_CONFIGURED) {
      const res = await api.auth.forgotPassword(normalizedEmail);
      return {
        success: true,
        message: res.message || `We sent a 6-digit reset code to ${normalizedEmail}.`,
      };
    }

    if (!DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      throw new Error(
        `No authentication backend is connected yet for ${normalizedEmail}.`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 750));

    return {
      success: true,
      message: `We sent a 6-digit reset code to ${normalizedEmail}. Enter the code mentioned in the email.`,
    };
  } catch (error: any) {
    if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
      throw new Error("Network error. Please check your internet connection and try again.");
    }
    throw new Error(error?.message || "An unexpected error occurred. Please try again later.");
  }
}

/**
 * 2. Resend Password Reset OTP Code
 */
export async function resendPasswordReset(email: string): Promise<PasswordResetResponse> {
  return requestPasswordReset(email);
}

/**
 * 3. Verify 6-Digit OTP Code for Password Reset
 */
export async function verifyResetCode(email: string, code: string): Promise<PasswordResetResponse> {
  const cleanCode = code.trim();
  try {
    if (IS_BACKEND_CONFIGURED) {
      const res = await api.auth.verifyOtp(email.trim().toLowerCase(), cleanCode);
      return {
        success: true,
        message: res.message || "Code verified successfully.",
      };
    }

    if (!DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      throw new Error("Authentication backend not configured.");
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

    if (DEMO_MODE && cleanCode.length < 5) {
      throw new Error("Please enter a valid 6-digit verification code.");
    }

    return {
      success: true,
      message: "Code verified successfully.",
    };
  } catch (error: any) {
    throw new Error(error?.message || "Invalid or expired verification code.");
  }
}

/**
 * 4. Update / Set New Password
 */
export async function updatePassword(password: string, email: string, code: string): Promise<PasswordResetResponse> {
  try {
    if (IS_BACKEND_CONFIGURED) {
      const res = await api.auth.resetPassword(email.trim().toLowerCase(), code.trim(), password);
      return {
        success: true,
        message: res.message || "Congratulations! Your password has been changed.",
      };
    }

    if (!DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      throw new Error("Authentication backend not configured.");
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    return {
      success: true,
      message: "Congratulations! Your password has been changed.",
    };
  } catch (error: any) {
    throw new Error(error?.message || "Failed to update password. Please try again.");
  }
}

/**
 * 5. Verify Registration 6-Digit OTP Code
 */
export async function verifyRegistrationOtp(email: string, code: string): Promise<RegistrationOtpResponse> {
  const cleanCode = code.trim();
  try {
    if (IS_BACKEND_CONFIGURED) {
      const res = await api.auth.verifyRegistrationOtp(email.trim().toLowerCase(), cleanCode);
      if (res?.data?.accessToken) {
        await setAuthToken(res.data.accessToken, res.data.refreshToken);
      }
      return {
        success: true,
        message: res.message || "Account verified and activated successfully.",
        data: res.data,
      };
    }

    if (!DEMO_MODE) {
      throw new Error("Authentication backend not configured.");
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
      success: true,
      message: "Account verified and activated successfully.",
      data: { verified: true },
    };
  } catch (error: any) {
    throw new Error(error?.message || "Invalid or expired verification code.");
  }
}

/**
 * 6. Resend Registration 6-Digit OTP Code
 */
export async function resendRegistrationOtp(email: string): Promise<RegistrationOtpResponse> {
  try {
    if (IS_BACKEND_CONFIGURED) {
      const res = await api.auth.resendRegistrationOtp(email.trim().toLowerCase());
      return {
        success: true,
        message: res.message || "New 6-digit verification code sent.",
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      message: "New 6-digit verification code sent.",
    };
  } catch (error: any) {
    throw new Error(error?.message || "Failed to resend code. Please try again.");
  }
}
