import { Palette } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface DiscoverHeaderProps {
  storyCount?: number;
}

export default function DiscoverHeader({ storyCount }: DiscoverHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.badgeWrap}>
          <Ionicons name="people-outline" size={13} color={Palette.turquoise} />
          <Text style={styles.badgeText}>BECAUSE OF YOU</Text>
        </View>
        {storyCount !== undefined && (
          <View style={styles.countPill}>
            <Text style={styles.countText}>{storyCount} Stories</Text>
          </View>
        )}
      </View>

      <Text style={styles.heading}>Discover</Text>
      <Text style={styles.subtitle}>“Behind who we are, someone made a difference.”</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  badgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.25)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 1,
  },
  countPill: {
    backgroundColor: Palette.pureWhite,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  countText: {
    fontSize: 11,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  heading: {
    fontSize: 32,
    fontWeight: "900",
    color: Palette.deepTeal,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: "italic",
    color: Palette.textSecondary,
    marginTop: 4,
    letterSpacing: 0.1,
  },
});
