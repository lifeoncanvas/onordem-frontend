import { useState, useEffect } from "react";
import { useWindowDimensions, Platform } from "react-native";

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isWeb: boolean;
  isMounted: boolean;
  contentMaxWidth: number;
  horizontalPadding: number;
  columns: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isWeb = Platform.OS === "web";

  // During SSR or before client hydration completes on web,
  // enforce a stable mobile baseline (375x812) so SSR static HTML matches initial client DOM.
  // After hydration mount, useEffect sets isMounted = true, smoothly activating the real viewport size.
  const effectiveWidth = isWeb && !isMounted ? 375 : width;
  const effectiveHeight = isWeb && !isMounted ? 812 : height;

  const isMobile = effectiveWidth < 768;
  const isTablet = effectiveWidth >= 768 && effectiveWidth < 1024;
  const isDesktop = effectiveWidth >= 1024;
  const isWide = effectiveWidth >= 1280;

  const contentMaxWidth = isWide ? 1240 : isDesktop ? 1080 : isTablet ? 740 : effectiveWidth;
  const horizontalPadding = isDesktop ? 32 : isTablet ? 24 : 16;
  const columns = isWide ? 4 : isDesktop ? 3 : isTablet ? 2 : 1;

  return {
    width: effectiveWidth,
    height: effectiveHeight,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isWeb,
    isMounted,
    contentMaxWidth,
    horizontalPadding,
    columns,
  };
}

