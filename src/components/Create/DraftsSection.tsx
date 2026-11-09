import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { CreationDraft } from "@/types/create";

interface DraftsSectionProps {
  drafts: CreationDraft[];
  onResumeDraft: (draft: CreationDraft) => void;
  onDeleteDraft?: (draftId: string) => void;
  onStartFirstMemory?: () => void;
}

export default function DraftsSection({
  drafts,
  onResumeDraft,
  onDeleteDraft,
  onStartFirstMemory,
}: DraftsSectionProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.sectionTitle}>Pick Up Where You Left Off</Text>
          <Text style={styles.sectionSubtitle}>
            Unfinished memos, notes, letters, and appreciation cards
          </Text>
        </View>

        {drafts.length > 0 && (
          <View style={styles.draftsCountBadge}>
            <Text style={styles.draftsCountText}>{drafts.length}</Text>
          </View>
        )}
      </View>

      {/* Conditional: Empty State vs Saved Drafts */}
      {drafts.length === 0 ? (
        /* Thoughtful Warm Empty State (no fabricated saved content) */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name="document-text-outline"
              size={26}
              color={Palette.oceanTeal}
            />
          </View>

          <Text style={styles.emptyTitle}>Your studio is waiting</Text>
          <Text style={styles.emptySubtitle}>
            When you begin a memo, note, letter, or appreciation card,
            your unfinished thoughts will be safely kept here.
          </Text>

          {onStartFirstMemory && (
            <TouchableOpacity
              onPress={onStartFirstMemory}
              activeOpacity={0.8}
              style={styles.emptyCtaBtn}
              accessibilityRole="button"
              accessibilityLabel="Start your first draft"
            >
              <Ionicons
                name="add-outline"
                size={16}
                color={Palette.oceanTeal}
              />
              <Text style={styles.emptyCtaText}>Start Your First Keepsake</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* List of real drafts */
        <View style={styles.draftsList}>
          {drafts.map((draft) => {
            const typeConfig = getTypeBadgeConfig(draft.type);

            return (
              <TouchableOpacity
                key={draft.id}
                activeOpacity={0.8}
                onPress={() => onResumeDraft(draft)}
                style={styles.draftCard}
                accessibilityRole="button"
                accessibilityLabel={`Resume draft: ${draft.title}`}
              >
                {/* Left Type Indicator Line */}
                <View
                  style={[
                    styles.typeIndicator,
                    { backgroundColor: typeConfig.color },
                  ]}
                />

                <View style={styles.draftContent}>
                  {/* Top Meta: Type badge & last edited */}
                  <View style={styles.draftMetaRow}>
                    <View
                      style={[
                        styles.draftTypeBadge,
                        { backgroundColor: typeConfig.bg },
                      ]}
                    >
                      <Ionicons
                        name={typeConfig.icon}
                        size={11}
                        color={typeConfig.color}
                      />
                      <Text
                        style={[
                          styles.draftTypeText,
                          { color: typeConfig.color },
                        ]}
                      >
                        {typeConfig.label}
                      </Text>
                    </View>

                    <Text style={styles.lastEditedText}>
                      {draft.lastEdited}
                    </Text>
                  </View>

                  {/* Title & Mentor */}
                  <Text style={styles.draftTitle} numberOfLines={1}>
                    {draft.title || "Untitled Draft"}
                  </Text>
                  {draft.mentorName ? (
                    <Text style={styles.draftMentor} numberOfLines={1}>
                      For: {draft.mentorName}
                    </Text>
                  ) : null}

                  {draft.previewText ? (
                    <Text style={styles.draftPreview} numberOfLines={2}>
                      {draft.previewText}
                    </Text>
                  ) : null}

                  {/* Bottom Row: Resume Button and Delete Option */}
                  <View style={styles.draftBottomRow}>
                    <View style={styles.resumeWrap}>
                      <Text style={styles.resumeText}>Resume writing</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={12}
                        color={Palette.oceanTeal}
                      />
                    </View>

                    {onDeleteDraft && (
                      <TouchableOpacity
                        onPress={() => onDeleteDraft(draft.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.trashBtn}
                        accessibilityLabel="Discard draft"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={14}
                          color={Palette.textMuted}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

function getTypeBadgeConfig(type: string) {
  switch (type) {
    case "tribute":
      return {
        label: "Appreciation",
        icon: "heart" as const,
        color: Palette.oceanTeal,
        bg: "rgba(84, 0, 14, 0.08)",
      };
    case "memory":
      return {
        label: "Memo",
        icon: "camera" as const,
        color: Palette.turquoise,
        bg: "rgba(236, 143, 62, 0.14)",
      };
    case "letter":
      return {
        label: "Letter",
        icon: "mail-open-outline" as const,
        color: "#9E2A2B",
        bg: "rgba(158, 42, 43, 0.10)",
      };
    case "lesson":
      return {
        label: "Note",
        icon: "color-palette-outline" as const,
        color: Palette.accentLavender,
        bg: "rgba(216, 180, 254, 0.12)",
      };
    default:
      return {
        label: "Draft",
        icon: "create-outline" as const,
        color: Palette.deepTeal,
        bg: Palette.mintMist,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleWrap: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  draftsCountBadge: {
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.25)",
  },
  draftsCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: Palette.deepTeal,
  },

  // Thoughtful Empty State
  emptyContainer: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.05)",
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.mintMist,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.25)",
    position: "relative",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 290,
  },
  emptyCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(84, 0, 14, 0.06)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(84, 0, 14, 0.15)",
  },
  emptyCtaText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.deepTeal,
  },

  // Real Drafts Cards
  draftsList: {
    gap: 10,
  },
  draftCard: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
    flexDirection: "row",
  },
  typeIndicator: {
    width: 4,
  },
  draftContent: {
    flex: 1,
    padding: 14,
  },
  draftMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  draftTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  draftTypeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  lastEditedText: {
    fontSize: 11,
    color: Palette.textMuted,
  },
  draftTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.2,
  },
  draftMentor: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.turquoise,
    marginTop: 2,
  },
  draftPreview: {
    fontSize: 12,
    color: Palette.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  draftBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(177, 167, 166, 0.15)",
  },
  resumeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resumeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },
  trashBtn: {
    padding: 4,
  },
});
