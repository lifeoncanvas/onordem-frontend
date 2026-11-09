import { Platform, type TextStyle } from "react-native";

/**
 * Cross-platform text shadow.
 * Web uses the CSS `textShadow` shorthand (react-native-web deprecates the `textShadow*` props);
 * iOS/Android only understand the `textShadow*` props.
 */
export function textShadow(offsetX: number, offsetY: number, radius: number, color: string): TextStyle {
  if (Platform.OS === "web") {
    return { textShadow: `${offsetX}px ${offsetY}px ${radius}px ${color}` } as TextStyle;
  }
  return {
    textShadowColor: color,
    textShadowOffset: { width: offsetX, height: offsetY },
    textShadowRadius: radius,
  };
}
