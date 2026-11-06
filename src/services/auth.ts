/**
 * Authentication Service Module
 *
 * Keeps UI components decoupled from backend authentication logic.
 * Integrates with onodemBackend (Spring Boot + Supabase) or runs in demo mode.
 */

import { api, clearAuthToken } from "./api";
import { memoryService } from "./memoryService";
import { userProfileService } from "./userProfileService";

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

/**
 * TOGGLE THIS FLAG ONCE YOU HAVE RUN YOUR SPRING BOOT BACKEND.
 */
export let IS_BACKEND_CONFIGURED = true;

/**
 * DEMO MODE FLAG:
 * Set to `true` while developing/previewing the Figma flow so you can test all steps
 * (Email -> 5-digit OTP code -> Set New Password -> Success Dialog). Only used when IS_BACKEND_CONFIGURED is false.
 * Set to `false` to verify error handling when no real backend is active.
 */
export let DEMO_MODE = true;

export async function signOut(): Promise<void> {
  await clearAuthToken();
  // Forget this account's posts on the device so the next sign-in starts clean.
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
 * 1. Request Password Reset / OTP Code
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetResponse> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    if (IS_BACKEND_CONFIGURED) {
      const res = await api.auth.forgotPassword(normalizedEmail);
      return {
        success: true,
        message: res.message || `We sent a reset code to ${normalizedEmail}.`,
      };
    }

    if (!DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      throw new Error(
        `No authentication backend is connected yet for ${normalizedEmail}. Please configure your backend in src/services/auth.ts.`
      );
    }

    // Simulate network delay in demo mode
    await new Promise((resolve) => setTimeout(resolve, 750));

    return {
      success: true,
      message: `We sent a reset code to ${normalizedEmail}. Enter the 5-digit code mentioned in the email.`,
    };
  } catch (error: any) {
    if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
      throw new Error("Network error. Please check your internet connection and try again.");
    }
    throw new Error(error?.message || "An unexpected error occurred. Please try again later.");
  }
}

/**
 * 2. Verify 5-Digit OTP Code
 */
export async function verifyResetCode(email: string, code: string): Promise<PasswordResetResponse> {
  try {
    if (IS_BACKEND_CONFIGURED) {
      const res = await api.auth.verifyOtp(email.trim().toLowerCase(), code.trim());
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

    // In demo mode (no backend), accept any 5-digit code
    if (DEMO_MODE && code.length !== 5) {
      throw new Error("Please enter a valid 5-digit verification code.");
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
 * 3. Update / Set New Password
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

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    return {
      success: true,
      message: "Congratulations! Your password has been changed.",
    };
  } catch (error: any) {
    throw new Error(error?.message || "Failed to update password. Please try again.");
  }
}
