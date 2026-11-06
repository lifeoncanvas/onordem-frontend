import { Platform } from 'react-native';

/**
 * Design tokens follow Apple's Human Interface Guidelines.
 * - Color:      https://developer.apple.com/design/human-interface-guidelines/color
 * - Typography: https://developer.apple.com/design/human-interface-guidelines/typography
 * - Layout:     https://developer.apple.com/design/human-interface-guidelines/layout
 *
 * Colors come in Dark (default) and Light appearances; see SystemColors below.
 */

/** System font everywhere (SF Pro on Apple platforms). */
export const AppFonts = {
  displaySans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    default: 'sans-serif',
  }),
  displaySerif: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    default: 'sans-serif',
  }),
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
    default: 'sans-serif',
  }),
  handwritten: 'Caveat_400Regular',
} as const;

// ─── Appearance (Dark / Light) ────────────────────────────────────────────────
//
// Every color token has a Dark and a Light value (iOS system colors). On web the
// tokens are CSS variables (`var(--hym-label)`), so switching appearance in
// Settings recolors the whole app instantly by flipping `data-theme` on <html>
// (see services/themeService.ts). Native builds use the Dark values for now.

export type ColorSchemeName = 'dark' | 'light';

const DARK_COLORS = {
  // Backgrounds
  systemBackground: '#000000',
  secondarySystemBackground: '#1C1C1E',
  tertiarySystemBackground: '#2C2C2E',
  // Fills (for controls on top of backgrounds)
  systemFill: 'rgba(120, 120, 128, 0.36)',
  secondarySystemFill: 'rgba(120, 120, 128, 0.32)',
  tertiarySystemFill: 'rgba(118, 118, 128, 0.24)',
  quaternarySystemFill: 'rgba(118, 118, 128, 0.18)',
  // Labels
  label: '#FFFFFF',
  secondaryLabel: 'rgba(235, 235, 245, 0.6)',
  tertiaryLabel: 'rgba(235, 235, 245, 0.3)',
  quaternaryLabel: 'rgba(235, 235, 245, 0.16)',
  placeholderText: 'rgba(235, 235, 245, 0.3)',
  /** Text/icons on a `label`-filled button (black on white in Dark, white on black in Light). */
  inverseLabel: '#000000',
  /** Muted captions: 5.4:1 on #000, 5.2:1 on #1C1C1E. */
  textMuted: 'rgba(235, 235, 245, 0.55)',
  // Separators
  separator: 'rgba(84, 84, 88, 0.6)',
  opaqueSeparator: '#38383A',
  /** Hairline borders on cards. */
  hairline: 'rgba(255, 255, 255, 0.08)',
  /** Translucent tab bar / toolbar background. */
  barMaterial: 'rgba(22, 22, 24, 0.94)',
  /** Unselected tab icons and labels (5.9:1 on the bar). */
  tabInactive: '#8E8E93',
  // Tint colors
  blue: '#0A84FF',
  green: '#30D158',
  indigo: '#5E5CE6',
  orange: '#FF9F0A',
  pink: '#FF375F',
  purple: '#BF5AF2',
  red: '#FF453A',
  teal: '#40C8E0',
  cyan: '#64D2FF',
  mint: '#63E6E2',
  yellow: '#FFD60A',
} as const;

type ColorToken = keyof typeof DARK_COLORS;

/**
 * Light appearance. Tints use Apple's accessible (higher-contrast) variants so
 * colored text stays at or above 4.5:1 on white.
 */
const LIGHT_COLORS: Record<ColorToken, string> = {
  systemBackground: '#F2F2F7',
  secondarySystemBackground: '#FFFFFF',
  tertiarySystemBackground: '#E9E9EE',
  systemFill: 'rgba(120, 120, 128, 0.20)',
  secondarySystemFill: 'rgba(120, 120, 128, 0.16)',
  tertiarySystemFill: 'rgba(118, 118, 128, 0.12)',
  quaternarySystemFill: 'rgba(116, 116, 128, 0.08)',
  label: '#000000',
  secondaryLabel: 'rgba(60, 60, 67, 0.6)',
  tertiaryLabel: 'rgba(60, 60, 67, 0.3)',
  quaternaryLabel: 'rgba(60, 60, 67, 0.18)',
  placeholderText: 'rgba(60, 60, 67, 0.3)',
  inverseLabel: '#FFFFFF',
  textMuted: 'rgba(60, 60, 67, 0.72)',
  separator: 'rgba(60, 60, 67, 0.29)',
  opaqueSeparator: '#C6C6C8',
  hairline: 'rgba(0, 0, 0, 0.08)',
  barMaterial: 'rgba(249, 249, 249, 0.94)',
  tabInactive: '#6C6C70',
  blue: '#007AFF',
  green: '#248A3D',
  indigo: '#5856D6',
  orange: '#C93400',
  pink: '#D30F45',
  purple: '#8944AB',
  red: '#D70015',
  teal: '#0071A4',
  cyan: '#0071A4',
  mint: '#0C817B',
  yellow: '#A05A00',
};

export const ColorSchemes: Record<ColorSchemeName, Record<ColorToken, string>> = {
  dark: DARK_COLORS,
  light: LIGHT_COLORS,
};

const USE_CSS_VARIABLES = Platform.OS === 'web';

function token(name: ColorToken): string {
  return USE_CSS_VARIABLES ? `var(--hym-${name})` : DARK_COLORS[name];
}

/** CSS that defines every token for both appearances (web). */
export function themeCss(): string {
  const block = (colors: Record<string, string>) =>
    Object.entries(colors)
      .map(([name, value]) => `--hym-${name}: ${value};`)
      .join(' ');
  return [
    `:root, :root[data-theme="dark"] { color-scheme: dark; ${block(DARK_COLORS)} }`,
    `:root[data-theme="light"] { color-scheme: light; ${block(LIGHT_COLORS)} }`,
    `html, body { background-color: var(--hym-systemBackground); }`,
  ].join('\n');
}

/**
 * A token at reduced opacity, e.g. a tinted fill behind an icon.
 * Uses the Dark hex value, which reads well as a translucent fill in both appearances.
 */
export function alphaColor(color: string, alpha: number): string {
  const match = /^var\(--hym-([a-zA-Z]+)\)$/.exec(color);
  const hex = match ? DARK_COLORS[match[1] as ColorToken] : color;
  if (!hex || !hex.startsWith('#')) return color;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** iOS system colors. Resolve to the active appearance on web. */
export const SystemColors = {
  systemBackground: token('systemBackground'),
  secondarySystemBackground: token('secondarySystemBackground'),
  tertiarySystemBackground: token('tertiarySystemBackground'),
  systemFill: token('systemFill'),
  secondarySystemFill: token('secondarySystemFill'),
  tertiarySystemFill: token('tertiarySystemFill'),
  quaternarySystemFill: token('quaternarySystemFill'),
  label: token('label'),
  secondaryLabel: token('secondaryLabel'),
  tertiaryLabel: token('tertiaryLabel'),
  quaternaryLabel: token('quaternaryLabel'),
  placeholderText: token('placeholderText'),
  inverseLabel: token('inverseLabel'),
  separator: token('separator'),
  opaqueSeparator: token('opaqueSeparator'),
  hairline: token('hairline'),
  barMaterial: token('barMaterial'),
  tabInactive: token('tabInactive'),
  blue: token('blue'),
  green: token('green'),
  indigo: token('indigo'),
  orange: token('orange'),
  pink: token('pink'),
  purple: token('purple'),
  red: token('red'),
  teal: token('teal'),
  cyan: token('cyan'),
  mint: token('mint'),
  yellow: token('yellow'),
} as const;

/** One app-wide accent, used consistently for interactive elements. */
export const Tint = SystemColors.blue;

/** Apple Dynamic Type scale at the default (Large) size. */
export const TextStyles = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' as const, letterSpacing: 0.37 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: 0.36 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const, letterSpacing: 0.35 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' as const, letterSpacing: 0.38 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const, letterSpacing: -0.41 },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' as const, letterSpacing: -0.41 },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400' as const, letterSpacing: -0.32 },
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400' as const, letterSpacing: -0.24 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const, letterSpacing: -0.08 },
  caption1: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const, letterSpacing: 0 },
  caption2: { fontSize: 11, lineHeight: 13, fontWeight: '400' as const, letterSpacing: 0.07 },
} as const;

/** HIG layout metrics. */
export const Layout = {
  /** Standard leading/trailing margin on iPhone. */
  margin: 16,
  /** Wider margin for forms and onboarding. */
  marginWide: 20,
  /** Minimum tappable size (44×44 pt). */
  minTouch: 44,
  /** Height of large filled buttons and text fields. */
  controlHeight: 50,
  radiusSmall: 10,
  radiusMedium: 12,
  radiusLarge: 16,
  radiusXL: 22,
} as const;

/**
 * Shared typography presets mapped onto the Apple type scale.
 * Spread these into StyleSheet.create to keep screens consistent.
 */
export const AppTypography = {
  heroTitle: { fontFamily: AppFonts.displaySans, ...TextStyles.largeTitle, color: SystemColors.label },
  heroTitleItalic: { fontFamily: AppFonts.displaySans, ...TextStyles.largeTitle, color: SystemColors.secondaryLabel },
  sectionTitle: { fontFamily: AppFonts.displaySans, ...TextStyles.title3, color: SystemColors.label },
  cardTitle: { fontFamily: AppFonts.displaySans, ...TextStyles.headline, color: SystemColors.label },
  body: { fontFamily: AppFonts.body, ...TextStyles.subheadline, color: SystemColors.secondaryLabel },
  bodySmall: { fontFamily: AppFonts.body, ...TextStyles.footnote, color: SystemColors.secondaryLabel },
  /** Grouped-section header (uppercase footnote). */
  label: {
    fontFamily: AppFonts.body,
    ...TextStyles.footnote,
    textTransform: 'uppercase' as const,
    color: SystemColors.secondaryLabel,
  },
  caption: { fontFamily: AppFonts.body, ...TextStyles.caption1, color: SystemColors.tertiaryLabel },
  buttonPrimary: { fontFamily: AppFonts.body, ...TextStyles.headline },
  quoteSerif: {
    fontFamily: AppFonts.displaySans,
    ...TextStyles.title2,
    fontWeight: '600' as const,
    color: SystemColors.label,
  },
  nameSerif: { fontFamily: AppFonts.displaySans, ...TextStyles.title3, color: SystemColors.label },
} as const;

/**
 * Legacy token names used throughout the screens, now mapped onto Apple
 * system colors so every screen picks up the HIG palette.
 */
export const Palette = {
  wineDark: SystemColors.systemBackground,
  wineLight: SystemColors.secondarySystemBackground,
  maroon: SystemColors.tertiarySystemBackground,
  rose: SystemColors.pink,
  amber: SystemColors.yellow,
  amberBtn: SystemColors.label,
  ink: SystemColors.inverseLabel,
  muted: SystemColors.secondaryLabel,
  cream: SystemColors.label,

  // Surfaces
  iceWhite: SystemColors.systemBackground,
  pureWhite: SystemColors.secondarySystemBackground,
  surfaceCard: SystemColors.secondarySystemBackground,
  surfaceElevated: SystemColors.tertiarySystemBackground,
  /** Text on filled white primary buttons */
  textOnPrimary: SystemColors.inverseLabel,
  /** Text on yellow/accent-filled buttons */
  textOnAmber: '#000000',
  textOnDark: SystemColors.label,
  borderSubtle: SystemColors.opaqueSeparator,
  borderActive: SystemColors.blue,

  // Labels
  textPrimary: SystemColors.label,
  textSecondary: SystemColors.secondaryLabel,
  /**
   * Muted text. Apple's tertiaryLabel (~2.2:1 on black) is too faint for the
   * captions this token is used for, so it sits between secondary and tertiary:
   * 5.4:1 on #000000, 5.2:1 on #1C1C1E (HIG minimum 4.5:1).
   */
  textMuted: token('textMuted'),

  // Brand: white primary controls, system blue as the single tint
  oceanTeal: SystemColors.label,
  turquoise: SystemColors.blue,
  deepTeal: SystemColors.label,
  mintMist: SystemColors.tertiarySystemBackground,

  oceanTealSoft: SystemColors.quaternarySystemFill,
  turquoiseSoft: 'rgba(10, 132, 255, 0.18)',
  mintMistAura: 'rgba(44, 44, 46, 0.85)',
  oceanTealDark: SystemColors.tertiarySystemBackground,

  // Category accents → Apple system colors
  accentAmber: SystemColors.yellow,
  accentGold: SystemColors.orange,
  accentCyan: SystemColors.cyan,
  accentRose: SystemColors.pink,
  accentEmerald: SystemColors.green,
  accentSky: SystemColors.blue,
  accentPurple: SystemColors.purple,
  accentLavender: SystemColors.indigo,
  accentLilac: SystemColors.purple,
  accentCoral: SystemColors.orange,
  accentPeach: SystemColors.orange,
  accentMint: SystemColors.mint,
  accentPink: SystemColors.pink,
} as const;

export function getCategoryAccent(category: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes('parent')) return Palette.accentPink;
  if (normalized.includes('coach')) return Palette.accentMint;
  if (normalized.includes('friend')) return Palette.accentPeach;
  if (normalized.includes('leader')) return Palette.accentLavender;
  if (normalized.includes('teacher') || normalized.includes('school')) return Palette.accentSky;
  if (normalized.includes('memory')) return Palette.accentLavender;
  if (normalized.includes('quote') || normalized.includes('tribute')) return Palette.accentPink;
  if (normalized.includes('saved')) return Palette.accentMint;
  return Palette.accentSky;
}

const appleDark = {
  background: SystemColors.systemBackground,
  text: SystemColors.label,
  textSecondary: SystemColors.secondaryLabel,
  backgroundElement: SystemColors.secondarySystemBackground,
  backgroundSelected: SystemColors.tertiarySystemBackground,
  primary: SystemColors.label,
  secondary: SystemColors.pink,
  accent: SystemColors.blue,
  border: SystemColors.separator,
};

// Single Dark appearance; both keys resolve to the same palette.
export const Colors = {
  light: appleDark,
  dark: appleDark,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Legacy alias so existing code still compiles
export const Fonts = Platform.select({
  ios: {
    sans: AppFonts.displaySans,
    serif: AppFonts.displaySerif,
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: AppFonts.body,
    serif: AppFonts.displaySerif,
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: AppFonts.displaySans,
    serif: AppFonts.displaySerif,
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** 4-pt grid spacing scale. */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
