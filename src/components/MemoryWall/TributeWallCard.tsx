import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { WallTribute } from "@/types/memoryWall";

interface TributeWallCardProps {
  item: WallTribute;
  onPress: (item: WallTribute) => void;
  onPinPress: (id: string) => void;
}

export default function TributeWallCard({
  item,
  onPress,
  onPinPress,
}: TributeWallCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.88}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Appreciation card for ${item.mentorName}`}
    >
      {/* Photo background */}
      <Image source={{ uri: item.photoUri }} style={styles.photo} />

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.92)"]}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top badges */}
      <View style={styles.topRow}>
        {item.isPinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={11} color={Palette.turquoise} />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}
        {item.isShared && (
          <View style={styles.sharedBadge}>
            <Ionicons name="share-social" size={11} color="#FFF8F0" />
          </View>
        )}
        <TouchableOpacity
          onPress={() => onPinPress(item.id)}
          style={styles.pinButton}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={item.isPinned ? "pin" : "pin-outline"}
            size={16}
            color="rgba(252,238,228,0.8)"
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.typeBadge}>
          <Ionicons name="heart" size={10} color={Palette.turquoise} />
          <Text style={styles.typeLabel}>Appreciation</Text>
        </View>
        <Text style={styles.mentorName} numberOfLines={1}>
          {item.mentorName}
        </Text>
        <Text style={styles.relationship} numberOfLines={1}>
          {item.relationship}
        </Text>
        <Text style={styles.quote} numberOfLines={2}>
          {`"${item.quote}"`}
        </Text>
        <Text style={styles.date}>{item.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    height: 260,
    backgroundColor: Palette.deepTeal,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
    position: "relative",
  },
  photo: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  topRow: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,240,154,0.4)",
  },
  pinnedText: {
    color: Palette.turquoise,
    fontSize: 10,
    fontWeight: "700",
  },
  sharedBadge: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 8,
    padding: 5,
  },
  pinButton: {
    marginLeft: "auto",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    padding: 6,
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.turquoise,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  mentorName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF8F0",
    marginBottom: 2,
  },
  relationship: {
    fontSize: 12,
    color: "rgba(252,238,228,0.7)",
    fontWeight: "500",
    marginBottom: 8,
  },
  quote: {
    fontSize: 13,
    color: "rgba(252,238,228,0.85)",
    fontStyle: "italic",
    lineHeight: 19,
    marginBottom: 8,
  },
  date: {
    fontSize: 10,
    color: "rgba(252,238,228,0.45)",
    fontWeight: "500",
  },
});
