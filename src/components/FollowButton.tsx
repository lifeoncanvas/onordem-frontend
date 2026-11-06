/**
 * Follow / Following toggle backed by followService.
 *
 * Every FollowButton for the same person stays in sync (the service notifies
 * all subscribers), so following someone from a suggestion card also updates
 * their profile page and your Following list.
 *
 * Unfollowing is a single tap with no confirmation: it's instantly undoable by
 * tapping again (HIG feedback.md: reserve confirmation for destructive actions).
 */
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, SystemColors, TextStyles } from "@/constants/theme";
import { followService } from "@/services/followService";
import { useT } from "@/i18n";

export interface FollowTarget {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  role?: string;
}

/** Live follow state for one person. */
export function useIsFollowing(id: string): boolean {
  const [following, setFollowing] = useState(() => followService.isFollowing(id));
  useEffect(() => {
    const sync = () => setFollowing(followService.isFollowing(id));
    const unsubscribe = followService.subscribe(sync);
    followService.initialize().then(sync);
    return unsubscribe;
  }, [id]);
  return following;
}

interface FollowButtonProps {
  person: FollowTarget;
  size?: "regular" | "small";
  /** Stretch to fill the parent's width (e.g. suggestion cards, profile header). */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Label when not following, e.g. "Follow Back" for someone who follows you. */
  followLabel?: string;
}

export default function FollowButton({
  person,
  size = "regular",
  block,
  style,
  followLabel,
}: FollowButtonProps) {
  const t = useT();
  const notFollowingLabel = followLabel ?? t("follow.follow");
  const followingLabel = t("follow.following");
  const following = useIsFollowing(person.id);
  const small = size === "small";

  const toggle = async () => {
    // Make sure stored follows are loaded so this toggle isn't overwritten.
    await followService.initialize();
    followService.toggleFollow(person);
  };

  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [
        styles.base,
        small ? styles.small : styles.regular,
        following ? styles.following : styles.follow,
        block && styles.block,
        pressed && styles.pressed,
        style,
      ]}
      hitSlop={small ? 6 : 0}
      accessibilityRole="button"
      accessibilityLabel={following ? `${followingLabel} ${person.name}` : `${notFollowingLabel} ${person.name}`}
      accessibilityHint={following ? "Double-tap to unfollow" : undefined}
      accessibilityState={{ selected: following }}
    >
      {following && (
        <Ionicons name="checkmark" size={small ? 14 : 16} color={SystemColors.label} />
      )}
      <Text
        style={[
          styles.label,
          small && styles.labelSmall,
          following ? styles.labelFollowing : styles.labelFollow,
        ]}
      >
        {following ? followingLabel : notFollowingLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 999,
  },
  regular: { minHeight: 36, paddingHorizontal: 20 },
  small: { minHeight: 30, paddingHorizontal: 14 },
  block: { alignSelf: "stretch" },
  follow: { backgroundColor: SystemColors.label },
  following: { backgroundColor: SystemColors.tertiarySystemBackground },
  pressed: { opacity: 0.75 },
  label: { ...TextStyles.subheadline, fontFamily: AppFonts.body, fontWeight: "600" },
  labelSmall: { ...TextStyles.footnote, fontWeight: "600" },
  labelFollow: { color: SystemColors.inverseLabel },
  labelFollowing: { color: SystemColors.label },
});
