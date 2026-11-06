/**
 * Settings: Appearance (Dark default / Light / Automatic), Language (English default /
 * Hindi), account preferences, support and account actions.
 *
 * Grouped-list layout with checkmark rows for single choices (HIG settings.md /
 * lists-and-tables.md). All colors are theme tokens and all labels are translated.
 */
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppFonts, Layout, Palette, SystemColors, TextStyles, alphaColor } from "@/constants/theme";
import { deleteAccount, signOut } from "@/services/auth";
import { themeService, type AppearancePreference } from "@/services/themeService";
import { LANGUAGES, languageService, useLanguage, useT, type StringKey } from "@/i18n";

type SettingsIcon = keyof typeof Ionicons.glyphMap;
type ModalId = "privacy" | "notifications" | "autocorrect" | "blocked" | "help";

const APPEARANCES: { id: AppearancePreference; labelKey: StringKey; icon: SettingsIcon }[] = [
  { id: "dark", labelKey: "settings.appearance.dark", icon: "moon" },
  { id: "light", labelKey: "settings.appearance.light", icon: "sunny" },
  { id: "system", labelKey: "settings.appearance.system", icon: "phone-portrait-outline" },
];

function useAppearancePreference(): AppearancePreference {
  const [pref, setPref] = useState<AppearancePreference>(() => themeService.getPreference());
  useEffect(() => {
    const sync = () => setPref(themeService.getPreference());
    const unsubscribe = themeService.subscribe(sync);
    themeService.initialize().then(sync);
    return unsubscribe;
  }, []);
  return pref;
}

export default function SettingsScreen() {
  const t = useT();
  const language = useLanguage();
  const appearance = useAppearancePreference();

  const [activeModal, setActiveModal] = useState<ModalId | null>(null);

  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState(true);
  const [grammarCheckEnabled, setGrammarCheckEnabled] = useState(true);
  const [writingSuggestionsEnabled, setWritingSuggestionsEnabled] = useState(true);
  const [tributeReminders, setTributeReminders] = useState(true);
  const [mentorMilestones, setMentorMilestones] = useState(true);
  const [weeklyReflections, setWeeklyReflections] = useState(false);
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [allowConnectionsOnly, setAllowConnectionsOnly] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(["spammer_bot_99", "unwanted_contact"]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/profile"));

  const confirmSignOut = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.href = "/login";
      } else {
        router.replace("/login");
      }
    }
  };

  const confirmDeleteAccount = () => {
    const executeDelete = async () => {
      try {
        await deleteAccount();
      } catch (err: any) {
        if (Platform.OS === "web" && typeof window !== "undefined") {
          window.alert(err?.message || "Could not delete account");
        } else {
          Alert.alert("Error", err?.message || "Could not delete account");
        }
      } finally {
        if (Platform.OS === "web" && typeof window !== "undefined") {
          window.location.href = "/login";
        } else {
          router.replace("/login");
        }
      }
    };

    if (Platform.OS === "web") {
      const confirmed =
        typeof window !== "undefined" && typeof window.confirm === "function"
          ? window.confirm(t("settings.delete.final"))
          : true;
      if (confirmed) {
        executeDelete();
      }
      return;
    }

    Alert.alert(t("settings.delete"), t("settings.delete.confirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.delete"),
        style: "destructive",
        onPress: () => {
          Alert.alert(t("settings.delete"), t("settings.delete.final"), [
            { text: t("settings.delete.keep"), style: "cancel" },
            {
              text: t("settings.delete.permanent"),
              style: "destructive",
              onPress: executeDelete,
            },
          ]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.navBar}>
        <Pressable
          onPress={goBack}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={t("nav.back")}
        >
          <Ionicons name="chevron-back" size={26} color={SystemColors.blue} />
        </Pressable>
        <Text style={styles.navTitle} accessibilityRole="header">
          {t("settings.title")}
        </Text>
        <View style={styles.navButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <Text style={styles.groupTitle}>{t("settings.appearance")}</Text>
        <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel={t("settings.appearance")}>
          {APPEARANCES.map((option, index) => (
            <ChoiceRow
              key={option.id}
              icon={option.icon}
              label={t(option.labelKey)}
              selected={appearance === option.id}
              onPress={() => themeService.setPreference(option.id)}
              last={index === APPEARANCES.length - 1}
            />
          ))}
        </View>
        <Text style={styles.groupFooter}>
          {themeService.supportsLiveSwitching()
            ? t("settings.appearance.footer")
            : t("settings.appearance.nativeNote")}
        </Text>

        {/* Language */}
        <Text style={styles.groupTitle}>{t("settings.language")}</Text>
        <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel={t("settings.language")}>
          {LANGUAGES.map((option, index) => (
            <ChoiceRow
              key={option.id}
              icon="language"
              label={option.nativeName}
              detail={option.nativeName === option.englishName ? undefined : option.englishName}
              selected={language === option.id}
              onPress={() => languageService.set(option.id)}
              last={index === LANGUAGES.length - 1}
            />
          ))}
        </View>
        {language === "hi" ? <Text style={styles.groupFooter}>{t("settings.language.footer")}</Text> : null}

        {/* Account & preferences */}
        <Text style={[styles.groupTitle, styles.groupTitleSpaced]}>{t("settings.account")}</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="person-circle-outline"
            iconColor={SystemColors.blue}
            title={t("settings.accountInfo")}
            subtitle={t("settings.accountInfo.sub")}
            onPress={() => router.push("/profile-edit")}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            iconColor={SystemColors.green}
            title={t("settings.privacy")}
            subtitle={t("settings.privacy.sub")}
            onPress={() => setActiveModal("privacy")}
          />
          <SettingsRow
            icon="notifications-outline"
            iconColor={SystemColors.pink}
            title={t("settings.notifications")}
            subtitle={t("settings.notifications.sub")}
            onPress={() => setActiveModal("notifications")}
          />
          <SettingsRow
            icon="color-wand-outline"
            iconColor={SystemColors.indigo}
            title={t("settings.autocorrect")}
            subtitle={t("settings.autocorrect.sub")}
            onPress={() => setActiveModal("autocorrect")}
          />
          <SettingsRow
            icon="ban-outline"
            iconColor={SystemColors.orange}
            title={t("settings.blocked")}
            subtitle={t("settings.blocked.sub", { count: blockedUsers.length })}
            onPress={() => setActiveModal("blocked")}
            last
          />
        </View>

        {/* Support & account actions */}
        <Text style={[styles.groupTitle, styles.groupTitleSpaced]}>{t("settings.support")}</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="help-circle-outline"
            iconColor={SystemColors.blue}
            title={t("settings.help")}
            subtitle={t("settings.help.sub")}
            onPress={() => setActiveModal("help")}
          />
          <SettingsRow
            icon="log-out-outline"
            iconColor={SystemColors.orange}
            title={isLoggingOut ? "Logging out..." : t("settings.logOut")}
            subtitle={t("settings.logOut.sub")}
            loading={isLoggingOut}
            onPress={confirmSignOut}
          />
          <SettingsRow
            icon="trash-outline"
            iconColor={SystemColors.red}
            title={t("settings.delete")}
            subtitle={t("settings.delete.sub")}
            titleColor={SystemColors.red}
            onPress={confirmDeleteAccount}
            last
          />
        </View>
      </ScrollView>

      {/* Privacy */}
      <SettingsSheet
        visible={activeModal === "privacy"}
        title={t("settings.privacy")}
        subtitle={t("settings.privacy.sub")}
        onClose={() => setActiveModal(null)}
        closeLabel={t("common.done")}
      >
        <ToggleRow
          title={t("settings.privacy.public")}
          subtitle={t("settings.privacy.public.sub")}
          value={isProfilePublic}
          onChange={setIsProfilePublic}
        />
        <ToggleRow
          title={t("settings.privacy.connections")}
          subtitle={t("settings.privacy.connections.sub")}
          value={allowConnectionsOnly}
          onChange={setAllowConnectionsOnly}
          last
        />
      </SettingsSheet>

      {/* Notifications */}
      <SettingsSheet
        visible={activeModal === "notifications"}
        title={t("settings.notifications")}
        subtitle={t("settings.notifications.sub")}
        onClose={() => setActiveModal(null)}
        closeLabel={t("common.done")}
      >
        <ToggleRow
          title={t("settings.notifications.reminders")}
          subtitle={t("settings.notifications.reminders.sub")}
          value={tributeReminders}
          onChange={setTributeReminders}
        />
        <ToggleRow
          title={t("settings.notifications.milestones")}
          subtitle={t("settings.notifications.milestones.sub")}
          value={mentorMilestones}
          onChange={setMentorMilestones}
        />
        <ToggleRow
          title={t("settings.notifications.weekly")}
          subtitle={t("settings.notifications.weekly.sub")}
          value={weeklyReflections}
          onChange={setWeeklyReflections}
          last
        />
      </SettingsSheet>

      {/* Writing tools */}
      <SettingsSheet
        visible={activeModal === "autocorrect"}
        title={t("settings.autocorrect")}
        subtitle={t("settings.autocorrect.sub")}
        onClose={() => setActiveModal(null)}
        closeLabel={t("common.done")}
      >
        <ToggleRow
          title={t("settings.autocorrect.autocorrect")}
          subtitle={t("settings.autocorrect.autocorrect.sub")}
          value={autoCorrectEnabled}
          onChange={setAutoCorrectEnabled}
        />
        <ToggleRow
          title={t("settings.autocorrect.grammar")}
          subtitle={t("settings.autocorrect.grammar.sub")}
          value={grammarCheckEnabled}
          onChange={setGrammarCheckEnabled}
        />
        <ToggleRow
          title={t("settings.autocorrect.suggestions")}
          subtitle={t("settings.autocorrect.suggestions.sub")}
          value={writingSuggestionsEnabled}
          onChange={setWritingSuggestionsEnabled}
          last
        />
      </SettingsSheet>

      {/* Blocked users */}
      <SettingsSheet
        visible={activeModal === "blocked"}
        title={t("settings.blocked")}
        subtitle={t("settings.blocked.sub", { count: blockedUsers.length })}
        onClose={() => setActiveModal(null)}
        closeLabel={t("common.done")}
      >
        {blockedUsers.length === 0 ? (
          <View style={styles.emptyBlocked}>
            <Ionicons name="checkmark-circle-outline" size={36} color={SystemColors.green} />
            <Text style={styles.emptyBlockedTitle}>{t("settings.blocked.empty.title")}</Text>
            <Text style={styles.emptyBlockedSub}>{t("settings.blocked.empty.body")}</Text>
          </View>
        ) : (
          blockedUsers.map((username, index) => (
            <View
              key={username}
              style={[styles.sheetRow, index === blockedUsers.length - 1 && styles.sheetRowLast]}
            >
              <View style={styles.blockedUserMeta}>
                <Ionicons name="person-circle" size={32} color={SystemColors.secondaryLabel} />
                <Text style={styles.blockedUsername}>@{username}</Text>
              </View>
              <Pressable
                onPress={() => setBlockedUsers((prev) => prev.filter((u) => u !== username))}
                style={styles.unblockBtn}
                accessibilityRole="button"
                accessibilityLabel={`${t("settings.blocked.unblock")} @${username}`}
              >
                <Text style={styles.unblockBtnText}>{t("settings.blocked.unblock")}</Text>
              </Pressable>
            </View>
          ))
        )}
      </SettingsSheet>

      {/* Help */}
      <SettingsSheet
        visible={activeModal === "help"}
        title={t("settings.help")}
        subtitle={t("settings.help.sub")}
        onClose={() => setActiveModal(null)}
        closeLabel={t("common.close")}
      >
        <View style={styles.helpList}>
          <HelpCard icon="book-outline" color={SystemColors.blue} title={t("settings.help.guide")} body={t("settings.help.guide.body")} />
          <HelpCard icon="shield-outline" color={SystemColors.green} title={t("settings.help.safety")} body={t("settings.help.safety.body")} />
          <HelpCard icon="mail-outline" color={SystemColors.pink} title={t("settings.help.contact")} body="support@honouryourmentor.com" />
        </View>
      </SettingsSheet>
    </SafeAreaView>
  );
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

function ChoiceRow({
  icon,
  label,
  detail,
  selected,
  onPress,
  last,
}: {
  icon: SettingsIcon;
  label: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, !last && styles.rowBorder]}
      activeOpacity={0.7}
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
    >
      <View style={[styles.iconWrap, { backgroundColor: SystemColors.tertiarySystemFill }]}>
        <Ionicons name={icon} size={18} color={SystemColors.label} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{label}</Text>
        {detail ? <Text style={styles.rowSubtitle}>{detail}</Text> : null}
      </View>
      {selected ? <Ionicons name="checkmark" size={20} color={SystemColors.blue} /> : null}
    </TouchableOpacity>
  );
}

function SettingsRow({
  icon,
  iconColor,
  title,
  subtitle,
  titleColor,
  onPress,
  last = false,
  loading = false,
}: {
  icon: SettingsIcon;
  iconColor: string;
  title: string;
  subtitle: string;
  titleColor?: string;
  onPress: () => void;
  last?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: alphaColor(iconColor, 0.16) }]}>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, titleColor ? { color: titleColor } : null]}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={SystemColors.secondaryLabel} />
      ) : (
        <Ionicons name="chevron-forward" size={17} color={SystemColors.tertiaryLabel} />
      )}
    </TouchableOpacity>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onChange,
  last,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.sheetRow, last && styles.sheetRowLast]}>
      <View style={styles.settingTextCol}>
        <Text style={styles.settingItemTitle}>{title}</Text>
        <Text style={styles.settingItemSub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: SystemColors.systemFill, true: SystemColors.green }}
        accessibilityLabel={title}
      />
    </View>
  );
}

function HelpCard({ icon, color, title, body }: { icon: SettingsIcon; color: string; title: string; body: string }) {
  return (
    <View style={styles.helpCard}>
      <Ionicons name={icon} size={20} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={styles.helpCardTitle}>{title}</Text>
        <Text style={styles.helpCardText}>{body}</Text>
      </View>
    </View>
  );
}

function SettingsSheet({
  visible,
  title,
  subtitle,
  onClose,
  closeLabel,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  closeLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} accessibilityLabel={closeLabel} />
        <View style={styles.modalSheet} accessibilityViewIsModal>
          <View style={styles.modalHandle} />
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle} accessibilityRole="header">
                {title}
              </Text>
              <Text style={styles.modalSubtitle}>{subtitle}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.sheetDone} accessibilityRole="button">
              <Text style={styles.sheetDoneText}>{closeLabel}</Text>
            </Pressable>
          </View>
          <View style={styles.sheetGroup}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: SystemColors.systemBackground },
  pressed: { opacity: 0.7 },

  navBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: Layout.margin / 2,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  navButton: { width: 64, height: Layout.minTouch, justifyContent: "center", paddingLeft: 4 },
  navTitle: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.label, flex: 1, textAlign: "center" },

  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: Layout.margin,
    paddingTop: 12,
    paddingBottom: 48,
  },
  groupTitle: {
    ...TextStyles.footnote,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    textTransform: "uppercase",
    marginLeft: 16,
    marginBottom: 8,
  },
  groupTitleSpaced: { marginTop: 12 },
  groupFooter: {
    ...TextStyles.footnote,
    fontFamily: AppFonts.body,
    color: Palette.textMuted,
    marginHorizontal: 16,
    marginTop: -16,
    marginBottom: 24,
  },
  group: {
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusMedium,
    marginBottom: 24,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 12,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: SystemColors.separator },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowTitle: { ...TextStyles.body, fontFamily: AppFonts.body, color: SystemColors.label },
  rowSubtitle: { ...TextStyles.footnote, fontFamily: AppFonts.body, color: Palette.textMuted, marginTop: 1 },

  modalOverlay: { flex: 1, justifyContent: "flex-end", alignItems: "center" },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0, 0, 0, 0.45)" },
  modalSheet: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: SystemColors.systemBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: Layout.margin,
    paddingTop: 6,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  modalHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: SystemColors.tertiaryLabel,
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  modalTitle: { ...TextStyles.title3, fontFamily: AppFonts.displaySans, color: SystemColors.label },
  modalSubtitle: { ...TextStyles.footnote, fontFamily: AppFonts.body, color: Palette.textMuted, marginTop: 2 },
  sheetDone: { minHeight: Layout.minTouch, justifyContent: "center", paddingLeft: 8 },
  sheetDoneText: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.blue },
  sheetGroup: {
    backgroundColor: SystemColors.secondarySystemBackground,
    borderRadius: Layout.radiusMedium,
    paddingHorizontal: 14,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
  },
  sheetRowLast: { borderBottomWidth: 0 },
  settingTextCol: { flex: 1, marginRight: 16 },
  settingItemTitle: { ...TextStyles.body, fontFamily: AppFonts.body, color: SystemColors.label },
  settingItemSub: { ...TextStyles.footnote, fontFamily: AppFonts.body, color: Palette.textMuted, marginTop: 1 },

  emptyBlocked: { alignItems: "center", paddingVertical: 20, gap: 6 },
  emptyBlockedTitle: { ...TextStyles.headline, fontFamily: AppFonts.body, color: SystemColors.label },
  emptyBlockedSub: { ...TextStyles.subheadline, fontFamily: AppFonts.body, color: Palette.textMuted },
  blockedUserMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  blockedUsername: { ...TextStyles.body, fontFamily: AppFonts.body, color: SystemColors.label },
  unblockBtn: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    justifyContent: "center",
    backgroundColor: SystemColors.tertiarySystemFill,
  },
  unblockBtnText: { ...TextStyles.subheadline, fontFamily: AppFonts.body, fontWeight: "600", color: SystemColors.blue },

  helpList: { gap: 10, paddingVertical: 12 },
  helpCard: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  helpCardTitle: { ...TextStyles.subheadline, fontFamily: AppFonts.body, fontWeight: "600", color: SystemColors.label },
  helpCardText: { ...TextStyles.footnote, fontFamily: AppFonts.body, color: Palette.textMuted, marginTop: 2 },
});
