import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { persistImageUri } from "@/utils/persistMedia";
import { router, useLocalSearchParams } from "expo-router";
import { AppFonts, Palette } from "@/constants/theme";
import BottomNavigation from "@/components/home/BottomNavigation";
import { creationDraftService } from "@/services/creationDraftService";
import { memoryService } from "@/services/memoryService";
import { userProfileService } from "@/services/userProfileService";
import type { CreationDraft, CreationFormState } from "@/types/create";

type StudioType = "memory" | "lesson" | "letter";

const NOTE_LAYOUTS = [
  { id: "botanical", label: "Botanical", icon: "leaf-outline" },
  { id: "postcard", label: "Postcard", icon: "mail-outline" },
  { id: "minimal", label: "Minimal", icon: "remove-outline" },
] as const;

/**
 * Letter paper tones, tuned for dark mode: each paper is a deep tinted surface
 * rather than bright stationery, so the letter doesn't glare against the black UI.
 * Contrast (ink / placeholder on paper): Ivory 14.6:1 / 6.4:1, Blush 14.0:1 / 6.3:1,
 * Sage 13.9:1 / 6.4:1, Midnight 18.0:1 / 5.6:1 — all above the 4.5:1 minimum.
 */
const LETTER_PAPERS = [
  { id: "ivory", label: "Ivory", color: "#26221C", ink: "#F3EBDC", accent: "#D9B47C", placeholder: "#AFA391" },
  { id: "rose", label: "Blush", color: "#2A1F24", ink: "#F6E7EC", accent: "#E79AB3", placeholder: "#B8A0A8" },
  { id: "sage", label: "Sage", color: "#1E2621", ink: "#E5EFE7", accent: "#8CC59A", placeholder: "#9DAEA1" },
  { id: "midnight", label: "Midnight", color: "#11131A", ink: "#FFFFFF", accent: "#8FD3FF", placeholder: "#8E93A1" },
] as const;

const NOTE_STICKERS = ["✦", "❀", "♡", "☼", "☕", "🌿"];

const LETTER_CLOSINGS = [
  "With heartfelt gratitude,",
  "With love and respect,",
  "Forever grateful,",
  "Always in my thoughts,",
];

function getParam(value?: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isStudioType(value: string): value is StudioType {
  return value === "memory" || value === "lesson" || value === "letter";
}

function typeTitle(type: StudioType): string {
  if (type === "memory") return "Write a Memo";
  if (type === "lesson") return "Write a Note";
  return "Open Letter";
}

function typeAccent(type: StudioType): string {
  if (type === "memory") return Palette.accentMint;
  if (type === "lesson") return Palette.accentLavender;
  return Palette.accentPink;
}

export default function CreationStudioScreen({
  initialType,
}: {
  initialType?: StudioType;
}) {
  const params = useLocalSearchParams<{
    type?: string | string[];
    mentorName?: string | string[];
    relationship?: string | string[];
    prompt?: string | string[];
    draftId?: string | string[];
  }>();
  const requestedType = initialType ?? getParam(params.type);
  const type: StudioType = isStudioType(requestedType) ? requestedType : "memory";
  const draftIdParam = getParam(params.draftId);
  const prompt = getParam(params.prompt);
  const accent = typeAccent(type);
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const idRef = useRef(draftIdParam || `creation-draft-${reactId}`);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressAutosave = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [draftNotice, setDraftNotice] = useState("");
  const [mentorName, setMentorName] = useState(getParam(params.mentorName));
  const [relationship, setRelationship] = useState(getParam(params.relationship));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [quote, setQuote] = useState("");
  const [dateOrYear, setDateOrYear] = useState("");
  const [greeting, setGreeting] = useState("");
  const [closing, setClosing] = useState("With gratitude,");
  const [signature, setSignature] = useState(() => {
    const pName = userProfileService.getProfile().name;
    return pName && pName !== "Sarita Baiga" ? pName : "";
  });
  const [photoUri, setPhotoUri] = useState("");
  const [layoutStyle, setLayoutStyle] = useState(type === "letter" ? "ivory" : "botanical");
  const [decorations, setDecorations] = useState<string[]>([]);
  const [mentorEmail, setMentorEmail] = useState("");
  const [sendDedicationEmail, setSendDedicationEmail] = useState(true);
  const [isSharedOnFeed, setIsSharedOnFeed] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const formData: CreationFormState = useMemo(
    () => ({
      type,
      mentorName,
      relationship: relationship || "Mentor",
      title,
      body,
      quote,
      dateOrYear,
      greeting,
      closing,
      signature,
      photoUri,
      layoutStyle,
      decorations,
    }),
    [type, mentorName, relationship, title, body, quote, dateOrYear, greeting, closing, signature, photoUri, layoutStyle, decorations]
  );

  const loadDraft = useCallback((saved: CreationDraft) => {
    setMentorName(saved.mentorName);
    const fd = saved.formData;
    if (fd) {
      setRelationship(fd.relationship || "");
      setTitle(fd.title || "");
      setBody(fd.body || "");
      setQuote(fd.quote ?? "");
      setDateOrYear(fd.dateOrYear ?? "");
      setGreeting(fd.greeting ?? "");
      setClosing(fd.closing ?? "With gratitude,");
      if (fd.signature) {
        setSignature(fd.signature);
      }
      setPhotoUri(fd.photoUri ?? "");
      setLayoutStyle(fd.layoutStyle ?? (saved.type === "letter" ? "ivory" : "botanical"));
      setDecorations(fd.decorations ?? []);
    } else {
      setTitle(saved.title || "");
      setBody(saved.previewText || "");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const hydrateDraft = async () => {
      try {
        await creationDraftService.initialize();
        if (!isMounted) return;
        const currentProfile = userProfileService.getProfile();
        const authorName = currentProfile.name;
        const validAuthor = authorName && authorName !== "Sarita Baiga" ? authorName : "";
        if (draftIdParam) {
          const draft = creationDraftService.getDraftById(draftIdParam);
          if (draft) {
            loadDraft(draft);
            idRef.current = draft.id;
            setDraftNotice("Draft loaded from keepsakes");
          } else if (!signature || signature === "Sarita Baiga") setSignature(validAuthor);
        } else {
          if (!signature || signature === "Sarita Baiga") setSignature(validAuthor);
        }
      } catch (error) {
        console.error("Unable to load creation draft:", error);
        if (isMounted) {
          Alert.alert("Draft unavailable", "Your saved draft could not be loaded.");
        }
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    };
    hydrateDraft();
    return () => {
      isMounted = false;
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [draftIdParam, loadDraft, signature]);

  const persistDraft = useCallback(
    async (data: CreationFormState) => {
      await creationDraftService.saveDraft({
        id: idRef.current,
        type: data.type,
        mentorName: data.mentorName,
        title: data.title || (isStudioType(data.type) ? typeTitle(data.type) : "Keepsake"),
        lastEdited: new Date().toLocaleString(),
        previewText: data.body.slice(0, 140) || data.quote?.slice(0, 140) || "Untitled draft in studio",
        formData: data,
      });
    },
    []
  );

  useEffect(() => {
    if (!isHydrated || suppressAutosave.current) return;
    const hasContent =
      mentorName.trim() ||
      title.trim() ||
      body.trim() ||
      quote.trim() ||
      photoUri ||
      dateOrYear.trim();
    if (!hasContent) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    const timeout = setTimeout(async () => {
      try {
        await persistDraft(formData);
      } catch (error) {
        console.error("Unable to autosave creation draft:", error);
      }
    }, 900);
    autosaveTimer.current = timeout;
    return () => {
      clearTimeout(timeout);
      if (autosaveTimer.current === timeout) autosaveTimer.current = null;
    };
  }, [formData, isHydrated, mentorName, title, body, quote, photoUri, dateOrYear, persistDraft]);

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Access to your photo gallery is required to add photos.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.82,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setPhotoUri(await persistImageUri(result.assets[0].uri));
      }
    } catch (error) {
      console.error("Unable to select an attachment:", error);
      Alert.alert("Photo unavailable", "The photo could not be selected. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!mentorName.trim()) {
      Alert.alert("Mentor name needed", "Add the person this keepsake is for.");
      return;
    }
    if (!body.trim()) {
      Alert.alert("Add your words", `Write something in your ${type === "letter" ? "letter" : type === "memory" ? "memo" : "note"} before saving.`);
      return;
    }
    suppressAutosave.current = true;
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
    setIsSaving(true);
    try {
      const createdAt = new Date().toISOString();
      const savedId = idRef.current.replace("creation-draft-", "creation-");
      const year = dateOrYear.match(/\d{4}/)?.[0] ?? String(new Date().getFullYear());
      const effectiveRelationship = relationship.trim() || "Mentor";
      const authorProf = userProfileService.getProfile();
      const effectiveSig = signature.trim() || (authorProf.name && authorProf.name !== "Sarita Baiga" ? authorProf.name : "Alex Turner");

      const dedicationMeta = {
        recipientEmail: mentorEmail.trim() || undefined,
        sendDedicationEmail: sendDedicationEmail && !!mentorEmail.trim(),
        signature: effectiveSig,
        salutation: greeting.trim() || undefined,
        signoff: closing.trim() || undefined,
        privacy: (isSharedOnFeed ? "PUBLIC" : "PRIVATE") as "PUBLIC" | "PRIVATE",
      };

      if (type === "memory") {
        memoryService.addMemory(
          {
            kind: "memory",
            id: savedId,
            mentorName: mentorName.trim(),
            relationship: effectiveRelationship,
            title: title.trim() || "A Moment Cherished",
            excerpt: body.trim(),
            story: body.trim(),
            year,
            emotion: "Gratitude",
            emotionColor: Palette.accentMint,
            imageUri: photoUri || undefined,
            quote: quote.trim() || undefined,
            momentToRemember: dateOrYear.trim() || undefined,
            createdAt,
            isPinned: false,
          },
          dedicationMeta
        );
      } else if (type === "letter") {
        memoryService.addMemory(
          {
            kind: "letter",
            id: savedId,
            mentorName: mentorName.trim(),
            relationship: effectiveRelationship,
            title: title.trim() || `A Letter to ${mentorName.trim()}`,
            preview: body.trim().slice(0, 180),
            letterBody: body.trim(),
            salutation: greeting.trim() || `Dear ${mentorName.trim()},`,
            signoff: closing.trim(),
            signature: effectiveSig,
            paperStyle: layoutStyle,
            envelopeStyle: decorations.includes("envelope") ? "classic" : undefined,
            date: dateOrYear.trim() || undefined,
            wordCount: body.trim().split(/\s+/).filter(Boolean).length,
            mood: "Grateful",
            createdAt,
            isPinned: false,
          },
          dedicationMeta
        );
      } else {
        memoryService.addMemory(
          {
            kind: "lesson",
            id: savedId,
            mentorName: mentorName.trim(),
            relationship: effectiveRelationship,
            lessonTitle: title.trim() || "A Note for You",
            quote: quote.trim() || body.trim(),
            story: body.trim(),
            imageUri: photoUri || undefined,
            layoutStyle,
            decorations,
            category: "Note",
            createdAt,
            isPinned: false,
          },
          dedicationMeta
        );
      }
      try {
        await creationDraftService.removeDraft(idRef.current);
      } catch (error) {
        console.error("Unable to remove the completed creation draft:", error);
      }

      // Saved to the backend by memoryService.addMemory (uploads media first).

      const alertMsg = mentorEmail.trim() && sendDedicationEmail
        ? `Your post has been published and dedicated! We sent an email notification to ${mentorEmail.trim()} with the website link so your mentor can view it.`
        : isSharedOnFeed
        ? "Your post has been published and shared to your community feed & Memory Wall!"
        : "Your post is now saved in your collection.";

      Alert.alert("Published with Care", alertMsg, [
        {
          text: "Go to Home",
          onPress: () => router.replace("/home"),
        },
        {
          text: isSharedOnFeed ? "View on Memory Wall" : "View Keepsake",
          onPress: () => router.replace(isSharedOnFeed ? "/memory-wall" : { pathname: "/memory-detail/[id]", params: { id: savedId } }),
        },
      ]);
    } catch (error) {
      suppressAutosave.current = false;
      console.error("Unable to save creation:", error);
      Alert.alert("Could not save", "Your keepsake could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const text = type === "letter"
      ? `${greeting || `Dear ${mentorName || "Mentor"},`}\n\n${body}\n\n${closing}\n${signature}`
      : `${title || typeTitle(type)}\n\n${body}${quote ? `\n\n“${quote}”` : ""}\n\nFor ${mentorName || "someone who matters"}`;
    try {
      await Share.share({ title: title || typeTitle(type), message: text });
    } catch (error) {
      console.error("Unable to share creation:", error);
      Alert.alert("Could not share", "Please try sharing again.");
    }
  };

  const isLetter = type === "letter";
  const isMemo = type === "memory";
  const selectedPaper = LETTER_PAPERS.find((paper) => paper.id === layoutStyle) ?? LETTER_PAPERS[0];
  const paperColor = isLetter ? selectedPaper.color : selectedPaper.color;
  const paperInk = isLetter ? selectedPaper.ink : "#FFFFFF";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/home")} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.topTitleWrap}>
            <Text style={styles.eyebrow}>HONOUR YOUR MENTOR</Text>
            <Text style={styles.topTitle}>{typeTitle(type)}</Text>
          </View>
          <Pressable
            onPress={() => persistDraft(formData).then(() => setDraftNotice("Draft saved to studio"))}
            style={styles.draftButton}
            accessibilityRole="button"
            accessibilityLabel="Save draft"
          >
            <Ionicons name="bookmark-outline" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={() => setIsPreviewVisible(true)} style={styles.previewLink}>
            <Ionicons name="eye-outline" size={17} color={accent} />
            <Text style={[styles.previewLinkText, { color: accent }]}>Preview</Text>
          </Pressable>
        </View>

        {draftNotice ? (
          <Text style={styles.draftNotice} accessibilityRole="alert">
            {draftNotice}
          </Text>
        ) : null}

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Studio Intro Pill */}
          <View style={[styles.introBadge, { borderColor: `${accent}40` }]}>
            <Ionicons name={isMemo ? "book-outline" : isLetter ? "mail-open-outline" : "color-palette-outline"} size={16} color={accent} />
            <Text style={[styles.introText, { color: accent }]}>
              {isMemo ? "A page from your memory journal" : isLetter ? "A letter worth keeping" : "A little piece of personal stationery"}
            </Text>
          </View>
          {prompt ? <Text style={styles.promptText}>“{prompt}”</Text> : null}

          {/* Recipient / Mentor's Name Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{isLetter ? "WRITING TO" : "MENTOR'S NAME"}</Text>
            <TextInput
              style={styles.darkInput}
              placeholder="Their name (e.g. Dr. Mitchell, Coach Sarah)"
              placeholderTextColor="#777777"
              value={mentorName}
              onChangeText={setMentorName}
              autoCapitalize="words"
            />
          </View>

          {/* Relationship Field - Clean, never prefilled with 'Mentor' */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>YOUR RELATIONSHIP</Text>
            <TextInput
              style={styles.darkInput}
              placeholder="e.g. Teacher, Parent, Coach, Guide…"
              placeholderTextColor="#777777"
              value={relationship}
              onChangeText={setRelationship}
            />
          </View>

          {/* Editor Switch */}
          {isLetter ? (
            <LetterEditor
              title={title}
              body={body}
              mentorName={mentorName}
              greeting={greeting}
              closing={closing}
              signature={signature}
              date={dateOrYear}
              onTitleChange={setTitle}
              onBodyChange={setBody}
              onGreetingChange={setGreeting}
              onClosingChange={setClosing}
              onSignatureChange={setSignature}
              onDateChange={setDateOrYear}
              paperStyle={layoutStyle}
              onPaperChange={setLayoutStyle}
              hasEnvelope={decorations.includes("envelope")}
              onEnvelopeChange={(enabled) => {
                setDecorations((current) =>
                  enabled
                    ? [...current.filter((item) => item !== "envelope"), "envelope"]
                    : current.filter((item) => item !== "envelope")
                );
              }}
              accent={accent}
              selectedPaper={selectedPaper}
            />
          ) : isMemo ? (
            <MemoEditor
              title={title}
              body={body}
              mentorName={mentorName}
              quote={quote}
              date={dateOrYear}
              photoUri={photoUri}
              onTitleChange={setTitle}
              onBodyChange={setBody}
              onMentorNameChange={setMentorName}
              onQuoteChange={setQuote}
              onDateChange={setDateOrYear}
              onPickPhoto={handlePickPhoto}
              onRemovePhoto={() => setPhotoUri("")}
            />
          ) : (
            <NoteEditor
              title={title}
              body={body}
              quote={quote}
              photoUri={photoUri}
              layoutStyle={layoutStyle}
              decorations={decorations}
              onTitleChange={setTitle}
              onBodyChange={setBody}
              onQuoteChange={setQuote}
              onPickPhoto={handlePickPhoto}
              onRemovePhoto={() => setPhotoUri("")}
              onLayoutChange={setLayoutStyle}
              onDecorationsChange={setDecorations}
              accent={accent}
            />
          )}

          {/* Dedication & Feed Sharing Section */}
          <View style={styles.dedicationCard}>
            <View style={styles.dedicationHeader}>
              <Ionicons name="mail-outline" size={18} color={Palette.accentMint} />
              <Text style={styles.dedicationTitle}>Dedicate & Share</Text>
            </View>
            <Text style={styles.dedicationSubtitle}>
              Enter your mentor&apos;s email address so we can send them a direct link to view this tribute on the website.
            </Text>

            <TextInput
              style={styles.dedicationInput}
              placeholder="Mentor's Email (e.g. mentor@example.com)"
              placeholderTextColor="#777777"
              value={mentorEmail}
              onChangeText={setMentorEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.dedicationOption}
              onPress={() => setSendDedicationEmail((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={sendDedicationEmail ? "checkbox" : "square-outline"}
                size={20}
                color={sendDedicationEmail ? Palette.accentMint : "#666666"}
              />
              <Text style={styles.dedicationOptionText}>
                Send email notification from info@onodem.com when saved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dedicationOption}
              onPress={() => setIsSharedOnFeed((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSharedOnFeed ? "checkbox" : "square-outline"}
                size={20}
                color={isSharedOnFeed ? Palette.accentSky : "#666666"}
              />
              <Text style={styles.dedicationOptionText}>
                Share this post publicly on Community Feed & Memory Wall
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomGap} />
        </ScrollView>

        <View style={styles.actionBar}>
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={17} color="#FFFFFF" />
            <Text style={styles.shareText}>Share</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.saveButton, { opacity: isSaving ? 0.7 : 1 }]}
          >
            <Text style={styles.saveText}>{isSaving ? "Saving…" : `Save ${isMemo ? "Memo" : isLetter ? "Letter" : "Note"}`}</Text>
            <Ionicons name="arrow-forward" size={17} color="#111111" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <BottomNavigation activeTab="create" />
      <PreviewModal
        visible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        type={type}
        title={title}
        body={body}
        quote={quote}
        mentorName={mentorName}
        date={dateOrYear}
        greeting={greeting}
        closing={closing}
        signature={signature}
        photoUri={photoUri}
        layoutStyle={layoutStyle}
        decorations={decorations}
      />
    </SafeAreaView>
  );
}

/* ==========================================================================
   1. MEMO EDITOR: Aesthetic Keepsake Memory Journal
   ========================================================================== */
interface MemoEditorProps {
  title: string;
  body: string;
  mentorName: string;
  quote: string;
  date: string;
  photoUri: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onMentorNameChange: (value: string) => void;
  onQuoteChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onPickPhoto: () => void;
  onRemovePhoto: () => void;
}

function MemoEditor(props: MemoEditorProps) {
  return (
    <>
      <Text style={styles.sectionHeading}>A Moment to Remember</Text>

      {/* Aesthetic Keepsake Journal Card */}
      <View style={styles.memoJournalCard}>
        {/* Ribbon Header */}
        <View style={styles.memoHeaderBar}>
          <View style={styles.memoRibbonBadge}>
            <Ionicons name="bookmark" size={13} color={Palette.accentMint} />
            <Text style={styles.memoRibbonText}>MEMOIRE • MOMENT KEEPSAKE</Text>
          </View>
          <View style={styles.memoDatePill}>
            <Ionicons name="calendar-outline" size={12} color={Palette.accentMint} />
            <TextInput
              style={styles.memoDateInput}
              value={props.date}
              onChangeText={props.onDateChange}
              placeholder="When was this?"
              placeholderTextColor="#777777"
            />
          </View>
        </View>

        {/* Memory Title */}
        <TextInput
          style={styles.memoTitleInput}
          value={props.title}
          onChangeText={props.onTitleChange}
          placeholder="Give this memory a title…"
          placeholderTextColor="#777777"
        />

        {/* Sub-divider */}
        <View style={styles.memoDivider} />

        {/* Memory Story */}
        <TextInput
          style={styles.memoBodyInput}
          value={props.body}
          onChangeText={props.onBodyChange}
          placeholder="Where were you? What did they say or do that stayed with you? Capture the little details you never want to forget…"
          placeholderTextColor="#777777"
          multiline
          textAlignVertical="top"
        />

        {/* Attached Photo Polaroid Preview inside the Journal */}
        {props.photoUri ? (
          <View style={styles.polaroidFrame}>
            <Image source={{ uri: props.photoUri }} style={styles.polaroidPhoto} />
            <View style={styles.polaroidFooter}>
              <Text style={styles.polaroidCaption}>Preserved memory</Text>
              <TouchableOpacity onPress={props.onRemovePhoto} style={styles.polaroidRemoveBtn}>
                <Ionicons name="trash-outline" size={14} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={props.onPickPhoto} activeOpacity={0.8} style={styles.memoPhotoNudge}>
            <Ionicons name="camera-outline" size={18} color={Palette.accentMint} />
            <Text style={styles.memoPhotoNudgeText}>Attach a photo or snapshot from that day</Text>
            <Ionicons name="add-circle-outline" size={16} color={Palette.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Words to keep callout */}
        <View style={styles.memoQuoteCallout}>
          <View style={styles.memoQuoteIconWrap}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={Palette.accentMint} />
            <Text style={styles.memoQuoteLabel}>WORDS TO REMEMBER</Text>
          </View>
          <TextInput
            style={styles.memoQuoteInput}
            value={props.quote}
            onChangeText={props.onQuoteChange}
            placeholder="“A piece of wisdom or encouragement they gave you…”"
            placeholderTextColor="#777777"
            multiline
          />
        </View>

        {/* Journal Footer Seal */}
        <View style={styles.memoFooterRow}>
          <Text style={styles.memoFooterSeal}>✦ PRESERVED IN YOUR HEART</Text>
          <Ionicons name="sparkles" size={13} color={Palette.accentMint} />
        </View>
      </View>
    </>
  );
}

/* ==========================================================================
   2. NOTE EDITOR: Artistic Stationery Note with Washi Tape
   ========================================================================== */
interface NoteEditorProps {
  title: string;
  body: string;
  quote: string;
  photoUri: string;
  layoutStyle: string;
  decorations: string[];
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onQuoteChange: (value: string) => void;
  onPickPhoto: () => void;
  onRemovePhoto: () => void;
  onLayoutChange: (value: string) => void;
  onDecorationsChange: (value: string[]) => void;
  accent: string;
}

function NoteEditor(props: NoteEditorProps) {
  const addDecoration = (decoration: string) => {
    props.onDecorationsChange(
      props.decorations.includes(decoration)
        ? props.decorations.filter((item) => item !== decoration)
        : [...props.decorations, decoration]
    );
  };

  return (
    <>
      <Text style={styles.sectionHeading}>Choose Your Stationery</Text>

      {/* Style selector pills */}
      <View style={styles.choiceRow}>
        {NOTE_LAYOUTS.map((layout) => (
          <Pressable
            key={layout.id}
            onPress={() => props.onLayoutChange(layout.id)}
            style={[styles.choice, props.layoutStyle === layout.id && { borderColor: props.accent, backgroundColor: "#201826" }]}
          >
            <Ionicons name={layout.icon} size={15} color={props.layoutStyle === layout.id ? props.accent : Palette.textSecondary} />
            <Text style={[styles.choiceText, props.layoutStyle === layout.id && { color: props.accent }]}>{layout.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Artistic Note Card with Washi Tape Header */}
      <View style={styles.noteContainer}>
        {/* Washi Tape Strip */}
        <View style={[styles.washiTapeStrip, { backgroundColor: `${props.accent}55`, borderColor: props.accent }]}>
          <Text style={[styles.washiTapeText, { color: props.accent }]}>✦  STATIONERY NOTE  ✦</Text>
        </View>

        <View style={styles.notePaperModern}>
          {/* Top Flourish */}
          <Text style={[styles.noteOrnamentModern, { color: props.accent }]}>
            {props.layoutStyle === "botanical" ? "❧  ✿  ❧" : props.layoutStyle === "postcard" ? "POST • CARD" : "— ✦ —"}
          </Text>

          {/* Note Title */}
          <TextInput
            style={styles.noteTitleModern}
            value={props.title}
            onChangeText={props.onTitleChange}
            placeholder="A thoughtful little note"
            placeholderTextColor="#777777"
            textAlign="center"
          />

          <View style={[styles.noteDividerModern, { backgroundColor: props.accent }]} />

          {/* Note Body */}
          <TextInput
            style={styles.noteBodyModern}
            value={props.body}
            onChangeText={props.onBodyChange}
            placeholder="Write something heartfelt only you could say…"
            placeholderTextColor="#777777"
            multiline
            textAlignVertical="top"
          />

          {/* Pinned Stickers Display */}
          {props.decorations.length > 0 && (
            <View style={styles.pinnedStickersRow}>
              {props.decorations.map((stk, i) => (
                <Text key={i} style={[styles.pinnedStickerItem, { color: props.accent }]}>{stk}</Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Interactive Sticker Palette */}
      <Text style={styles.fieldLabel}>ADD A LITTLE DETAIL</Text>
      <View style={styles.choiceRow}>
        {NOTE_STICKERS.map((sticker) => (
          <Pressable
            key={sticker}
            onPress={() => addDecoration(sticker)}
            style={[
              styles.stickerModern,
              props.decorations.includes(sticker) && { backgroundColor: `${props.accent}25`, borderColor: props.accent },
            ]}
          >
            <Text style={[styles.stickerTextModern, props.decorations.includes(sticker) && { color: props.accent }]}>
              {sticker}
            </Text>
          </Pressable>
        ))}
      </View>

      <QuoteField value={props.quote} onChangeText={props.onQuoteChange} label="A QUOTE OR SIGN-OFF (OPTIONAL)" />
      <PhotoAttachment uri={props.photoUri} onPick={props.onPickPhoto} onRemove={props.onRemovePhoto} />
    </>
  );
}

/* ==========================================================================
   3. LETTER EDITOR: Romantic & Aesthetic Handwritten Letter
   ========================================================================== */
interface LetterEditorProps {
  title: string;
  body: string;
  mentorName: string;
  greeting: string;
  closing: string;
  signature: string;
  date: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onGreetingChange: (value: string) => void;
  onClosingChange: (value: string) => void;
  onSignatureChange: (value: string) => void;
  onDateChange: (value: string) => void;
  paperStyle: string;
  onPaperChange: (value: string) => void;
  hasEnvelope: boolean;
  onEnvelopeChange: (enabled: boolean) => void;
  accent: string;
  selectedPaper: typeof LETTER_PAPERS[number];
}

function LetterEditor(props: LetterEditorProps) {
  const paper = props.selectedPaper;

  return (
    <>
      <Text style={styles.sectionHeading}>Set the Tone of Your Letter</Text>

      {/* Stationery Paper Tone Selector */}
      <View style={styles.choiceRow} accessibilityRole="radiogroup" accessibilityLabel="Paper tone">
        {LETTER_PAPERS.map((item) => {
          const selected = props.paperStyle === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => props.onPaperChange(item.id)}
              style={[
                styles.paperToneChoice,
                styles.paperToneChoiceRow,
                { backgroundColor: item.color, borderColor: selected ? item.accent : `${item.accent}33` },
                selected && { borderWidth: 2 },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected, checked: selected }}
              accessibilityLabel={`${item.label} paper`}
            >
              <View style={[styles.paperToneDot, { backgroundColor: item.accent }]} />
              <Text style={[styles.paperToneText, { color: item.ink }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Keepsake Envelope / Wax Seal Toggle */}
      <Pressable
        onPress={() => props.onEnvelopeChange(!props.hasEnvelope)}
        style={[styles.waxSealPill, props.hasEnvelope && { borderColor: props.accent, backgroundColor: "#22171E" }]}
        accessibilityRole="button"
      >
        <Ionicons
          name={props.hasEnvelope ? "mail" : "mail-outline"}
          size={16}
          color={props.hasEnvelope ? props.accent : Palette.textSecondary}
        />
        <Text style={[styles.waxSealPillText, props.hasEnvelope && { color: props.accent }]}>
          {props.hasEnvelope ? "Keepsake Envelope Attached" : "Add a Keepsake Envelope & Wax Seal"}
        </Text>
        <Ionicons
          name={props.hasEnvelope ? "checkmark-circle" : "add-circle-outline"}
          size={16}
          color={props.hasEnvelope ? props.accent : Palette.textSecondary}
        />
      </Pressable>

      {/* Aesthetic Letter Paper */}
      <View style={[styles.letterPaperContainer, { backgroundColor: paper.color, borderColor: `${paper.accent}55` }]}>
        {/* Wax Seal / Stamp Ornament */}
        <View style={styles.letterFlourishRow}>
          <Text style={[styles.letterFlourish, { color: paper.accent }]}>❦</Text>
        </View>

        {/* Salutation */}
        <TextInput
          style={[styles.letterGreetingText, { color: paper.ink }]}
          value={props.greeting}
          onChangeText={props.onGreetingChange}
          placeholder={`Dear ${props.mentorName.trim() || "someone special"},`}
          placeholderTextColor={paper.placeholder}
        />

        {/* Subject Line */}
        <TextInput
          style={[styles.letterSubjectText, { color: paper.ink, borderBottomColor: `${paper.accent}35` }]}
          value={props.title}
          onChangeText={props.onTitleChange}
          placeholder="A few words from my heart…"
          placeholderTextColor={paper.placeholder}
        />

        {/* Letter Body */}
        <TextInput
          style={[styles.letterBodyText, { color: paper.ink }]}
          value={props.body}
          onChangeText={props.onBodyChange}
          placeholder="I have wanted to tell you for a long time how much your presence and guidance shaped my journey…"
          placeholderTextColor={paper.placeholder}
          multiline
          textAlignVertical="top"
        />

        {/* Quick Sign-off Chips */}
        <Text style={[styles.closingPillLabel, { color: paper.accent }]}>SIGN-OFF</Text>
        <View style={styles.closingChipsRow}>
          {LETTER_CLOSINGS.map((cl) => (
            <TouchableOpacity
              key={cl}
              onPress={() => props.onClosingChange(cl)}
              style={[
                styles.closingChip,
                { borderColor: `${paper.accent}45` },
                props.closing === cl && { backgroundColor: `${paper.accent}30`, borderColor: paper.accent },
              ]}
            >
              <Text style={[styles.closingChipText, { color: paper.ink }]}>{cl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Signature Line */}
        <View style={[styles.letterSignatureRow, { borderBottomColor: `${paper.accent}35` }]}>
          <Text style={[styles.signatureLabel, { color: paper.placeholder }]}>With gratitude,</Text>
          <TextInput
            style={[styles.letterSignatureInput, { color: paper.ink }]}
            value={props.signature}
            onChangeText={props.onSignatureChange}
            placeholder="Your name or signature"
            placeholderTextColor={paper.placeholder}
          />
        </View>

        {/* Date Stamp */}
        <TextInput
          style={[styles.letterDateStamp, { color: paper.placeholder }]}
          value={props.date}
          onChangeText={props.onDateChange}
          placeholder="Date (e.g. October 2026)"
          placeholderTextColor={paper.placeholder}
        />
      </View>

      {/* Keepsake Envelope Preview */}
      {props.hasEnvelope && (
        <View style={[styles.envelopeAirmailCard, { borderColor: `${props.accent}55` }]}>
          <View style={styles.airmailHeader}>
            <Ionicons name="mail" size={16} color={props.accent} />
            <Text style={[styles.airmailTitle, { color: props.accent }]}>SEALED WITH GRATITUDE</Text>
          </View>
          <Text style={styles.airmailRecipient}>
            For {props.mentorName.trim() || "Someone Special"}
          </Text>
          <View style={[styles.airmailStamp, { borderColor: props.accent }]}>
            <Ionicons name="heart" size={14} color={props.accent} />
            <Text style={[styles.airmailStampText, { color: props.accent }]}>POST</Text>
          </View>
        </View>
      )}
    </>
  );
}

/* ==========================================================================
   HELPER COMPONENTS
   ========================================================================== */
function QuoteField({ value, onChangeText, label }: { value: string; onChangeText: (value: string) => void; label: string }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.darkInput, styles.quoteInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder="“The words that stayed with me…”"
        placeholderTextColor="#777777"
        multiline
      />
    </View>
  );
}

function PhotoAttachment({ uri, onPick, onRemove }: { uri: string; onPick: () => void; onRemove: () => void }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>A PHOTO TO KEEP (OPTIONAL)</Text>
      {uri ? (
        <View style={styles.photoCard}>
          <Image source={{ uri }} style={styles.attachmentImage} />
          <Pressable onPress={onRemove} style={styles.removePhoto}>
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onPick} style={styles.photoButton}>
          <Ionicons name="image-outline" size={19} color={Palette.accentSky} />
          <Text style={styles.photoButtonText}>Attach a photograph or snapshot</Text>
          <Ionicons name="add-circle-outline" size={18} color={Palette.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

interface PreviewModalProps {
  visible: boolean;
  onClose: () => void;
  type: StudioType;
  title: string;
  body: string;
  quote: string;
  mentorName: string;
  date: string;
  greeting: string;
  closing: string;
  signature: string;
  photoUri: string;
  layoutStyle: string;
  decorations: string[];
}

function PreviewModal(props: PreviewModalProps) {
  const isLetter = props.type === "letter";
  const isMemo = props.type === "memory";
  const paper = isLetter
    ? LETTER_PAPERS.find((item) => item.id === props.layoutStyle) ?? LETTER_PAPERS[0]
    : LETTER_PAPERS[0];

  return (
    <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onClose}>
      <View style={styles.previewBackdrop}>
        <SafeAreaView style={styles.previewSafe}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewHeading}>Studio Preview</Text>
            <Pressable onPress={props.onClose} style={styles.iconButton}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.previewContent}>
            <View style={[
              styles.previewPaper,
              { backgroundColor: isLetter ? paper.color : "#161616", borderColor: isLetter ? `${paper.accent}55` : "rgba(255, 255, 255, 0.12)" },
            ]}>
              {isLetter ? (
                <>
                  <Text style={[styles.previewLetterOrnament, { color: paper.accent }]}>❦</Text>
                  <Text style={[styles.previewLetterGreeting, { color: paper.ink }]}>
                    {props.greeting || `Dear ${props.mentorName || "someone special"},`}
                  </Text>
                  {props.title ? <Text style={[styles.previewLetterTitle, { color: paper.ink }]}>{props.title}</Text> : null}
                  <Text style={[styles.previewLetterBody, { color: paper.ink }]}>{props.body || "Your words will appear here…"}</Text>
                  <Text style={[styles.previewLetterClosing, { color: paper.ink }]}>{props.closing}</Text>
                  <Text style={[styles.previewSignature, { color: paper.ink }]}>{props.signature}</Text>
                  {props.date ? <Text style={[styles.previewDate, { color: paper.placeholder }]}>{props.date}</Text> : null}
                </>
              ) : (
                <>
                  <Text style={[styles.previewKicker, { color: Palette.accentMint }]}>
                    {isMemo ? "MOMENT KEEPSAKE JOURNAL" : "ARTISTIC STATIONERY NOTE"}
                  </Text>
                  <Text style={[styles.previewPaperTitle, { color: "#FFFFFF" }]}>
                    {props.title || (isMemo ? "A Moment Cherished" : "A Thought for You")}
                  </Text>
                  <Text style={[styles.previewPaperBody, { color: "#DDDDDD" }]}>
                    {props.body || "Your writing will appear here…"}
                  </Text>
                  {props.photoUri ? <Image source={{ uri: props.photoUri }} style={styles.previewPhoto} /> : null}
                  {props.quote ? (
                    <Text style={[styles.previewQuote, { color: Palette.accentMint }]}>“{props.quote}”</Text>
                  ) : null}
                  <Text style={[styles.previewMentor, { color: Palette.textSecondary }]}>
                    For {props.mentorName || "someone who matters"}
                  </Text>
                  {props.date ? <Text style={[styles.previewDate, { color: Palette.textMuted }]}>{props.date}</Text> : null}
                </>
              )}
            </View>
          </ScrollView>
          <Pressable onPress={props.onClose} style={styles.previewDone}>
            <Text style={styles.previewDoneText}>Back to Editing</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

/* ==========================================================================
   STYLES
   ========================================================================== */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#000000" },
  flex: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 12, gap: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#171717", alignItems: "center", justifyContent: "center" },
  topTitleWrap: { flex: 1 },
  draftButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#171717" },
  draftNotice: { color: Palette.accentMint, fontSize: 12, marginHorizontal: 20, marginBottom: 8 },
  eyebrow: { color: Palette.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: 1.3 },
  topTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 2, fontFamily: AppFonts.displaySans },
  previewLink: { flexDirection: "row", alignItems: "center", gap: 5, padding: 8 },
  previewLinkText: { fontSize: 12, fontWeight: "700" },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  introBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#151515", marginBottom: 14 },
  introText: { fontSize: 11, fontWeight: "700" },
  promptText: { color: Palette.textSecondary, fontSize: 13, lineHeight: 19, fontStyle: "italic", marginBottom: 14 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { color: Palette.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },
  darkInput: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: "#303030", backgroundColor: "#171717", paddingHorizontal: 14, paddingVertical: 12, color: "#FFFFFF", fontSize: 14, fontFamily: AppFonts.body },
  sectionHeading: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 6, marginBottom: 10, fontFamily: AppFonts.displaySans },

  /* Memo Journal Styles */
  memoJournalCard: {
    backgroundColor: "#161616",
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: "rgba(143, 240, 198, 0.28)",
    padding: 18,
    marginBottom: 20,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
  },
  memoHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  memoRibbonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(143, 240, 198, 0.12)",
  },
  memoRibbonText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.accentMint,
    letterSpacing: 0.8,
  },
  memoDatePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#202020",
    paddingHorizontal: 8,
    borderRadius: 10,
    height: 30,
  },
  memoDateInput: {
    color: "#FFFFFF",
    fontSize: 11,
    paddingVertical: 2,
    minWidth: 90,
  },
  memoTitleInput: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    fontFamily: AppFonts.displaySans,
    paddingVertical: 6,
  },
  memoDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 10,
  },
  memoBodyInput: {
    color: "#FFFFFF",
    fontSize: 14.5,
    lineHeight: 23,
    fontFamily: AppFonts.body,
    minHeight: 120,
    paddingVertical: 4,
  },
  polaroidFrame: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    paddingBottom: 10,
    borderRadius: 10,
    marginVertical: 14,
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.2)",
  },
  polaroidPhoto: {
    width: "100%",
    height: 160,
    borderRadius: 6,
  },
  polaroidFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  polaroidCaption: {
    fontSize: 11,
    fontWeight: "600",
    color: "#444444",
    fontStyle: "italic",
  },
  polaroidRemoveBtn: {
    padding: 4,
  },
  memoPhotoNudge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(143, 240, 198, 0.35)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginVertical: 12,
    backgroundColor: "rgba(143, 240, 198, 0.05)",
  },
  memoPhotoNudgeText: {
    flex: 1,
    color: Palette.accentMint,
    fontSize: 12,
    fontWeight: "600",
  },
  memoQuoteCallout: {
    backgroundColor: "rgba(143, 240, 198, 0.08)",
    borderLeftWidth: 3,
    borderLeftColor: Palette.accentMint,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  memoQuoteIconWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  memoQuoteLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.accentMint,
    letterSpacing: 0.8,
  },
  memoQuoteInput: {
    color: "#FFFFFF",
    fontSize: 13,
    fontStyle: "italic",
    paddingVertical: 2,
    lineHeight: 18,
  },
  memoFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  memoFooterSeal: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.textMuted,
    letterSpacing: 1,
  },

  /* Note Stationery Styles */
  noteContainer: {
    marginBottom: 18,
    position: "relative",
  },
  washiTapeStrip: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  washiTapeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  notePaperModern: {
    backgroundColor: "#161616",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "rgba(216, 180, 254, 0.28)",
    padding: 20,
    paddingTop: 24,
    minHeight: 220,
    alignItems: "center",
  },
  noteOrnamentModern: {
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 6,
  },
  noteTitleModern: {
    width: "100%",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
    fontSize: 19,
    fontWeight: "700",
    paddingVertical: 4,
    textAlign: "center",
  },
  noteDividerModern: {
    width: 60,
    height: 1.5,
    marginVertical: 10,
    borderRadius: 1,
  },
  noteBodyModern: {
    width: "100%",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
    fontSize: 14.5,
    lineHeight: 23,
    minHeight: 110,
    textAlign: "left",
  },
  pinnedStickersRow: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  pinnedStickerItem: {
    fontSize: 17,
  },
  stickerModern: {
    width: 44,
    height: 44,
    backgroundColor: "#171717",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
  },
  stickerTextModern: {
    color: Palette.textSecondary,
    fontSize: 18,
  },

  /* Letter Styles */
  paperToneChoice: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  paperToneChoiceRow: {
    flexDirection: "row",
    gap: 6,
    height: 44,
  },
  paperToneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paperToneText: {
    fontSize: 13,
    fontWeight: "700",
  },
  waxSealPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#171717",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#303030",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 14,
  },
  waxSealPillText: {
    flex: 1,
    color: Palette.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  letterPaperContainer: {
    borderRadius: 16,
    padding: 22,
    borderWidth: 1.5,
    marginBottom: 18,
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)",
  },
  letterFlourishRow: {
    alignItems: "center",
    marginBottom: 6,
  },
  letterFlourish: {
    fontSize: 22,
  },
  letterGreetingText: {
    fontSize: 19,
    fontWeight: "700",
    fontFamily: AppFonts.displaySans,
    marginBottom: 8,
  },
  letterSubjectText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: AppFonts.displaySans,
    paddingBottom: 6,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  letterBodyText: {
    fontSize: 14.5,
    lineHeight: 24,
    fontFamily: AppFonts.body,
    minHeight: 150,
  },
  closingPillLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 6,
  },
  closingChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  closingChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  closingChipText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  letterSignatureRow: {
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  signatureLabel: {
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 2,
  },
  letterSignatureInput: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: AppFonts.displaySans,
    paddingVertical: 2,
  },
  letterDateStamp: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 6,
  },
  envelopeAirmailCard: {
    backgroundColor: "#161616",
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 18,
    position: "relative",
  },
  airmailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  airmailTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  airmailRecipient: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: AppFonts.displaySans,
  },
  airmailStamp: {
    position: "absolute",
    right: 14,
    top: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  airmailStampText: {
    fontSize: 8,
    fontWeight: "800",
    marginTop: 2,
  },

  /* Common Shared Helpers */
  quoteInput: { minHeight: 70, fontStyle: "italic" },
  choiceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  choice: { flex: 1, minHeight: 42, backgroundColor: "#171717", borderRadius: 13, borderWidth: 1, borderColor: "#303030", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  choiceText: { color: Palette.textSecondary, fontSize: 11, fontWeight: "700" },
  photoCard: { height: 170, borderRadius: 14, overflow: "hidden", position: "relative", backgroundColor: "#171717" },
  attachmentImage: { width: "100%", height: "100%" },
  removePhoto: { position: "absolute", right: 9, top: 9, width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center" },
  photoButton: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, backgroundColor: "#171717", borderRadius: 14, borderWidth: 1, borderColor: "#303030" },
  photoButtonText: { flex: 1, color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginLeft: 10 },
  dedicationCard: { backgroundColor: "#151515", borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: "#272727" },
  dedicationHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  dedicationTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  dedicationSubtitle: { color: "#9E9E9E", fontSize: 12, lineHeight: 18, marginBottom: 14 },
  dedicationInput: { backgroundColor: "#1F1F1F", borderRadius: 12, borderWidth: 1, borderColor: "#333333", color: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, marginBottom: 14 },
  dedicationOption: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  dedicationOptionText: { color: "#DDDDDD", fontSize: 13, flex: 1, lineHeight: 18 },
  bottomGap: { height: 30 },
  actionBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 92, backgroundColor: "#000000", borderTopWidth: 1, borderTopColor: "#1E1E1E" },
  shareButton: { height: 50, minWidth: 106, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, borderWidth: 1, borderColor: "#383838", backgroundColor: "#171717" },
  shareText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  saveButton: { flex: 1, height: 50, paddingHorizontal: 18, backgroundColor: "#FFFFFF", borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  saveText: { color: "#111111", fontSize: 14, fontWeight: "800" },

  /* Preview Modal */
  previewBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.94)" },
  previewSafe: { flex: 1 },
  previewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10 },
  previewHeading: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", fontFamily: AppFonts.displaySans },
  previewContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  previewPaper: { padding: 22, borderRadius: 16, minHeight: 320, borderWidth: 1 },
  previewLetterOrnament: { fontSize: 24, textAlign: "center", marginBottom: 6 },
  previewLetterGreeting: { fontSize: 20, fontWeight: "700", fontFamily: AppFonts.displaySans, marginBottom: 8 },
  previewLetterTitle: { fontSize: 16, fontWeight: "600", fontFamily: AppFonts.displaySans, marginBottom: 8 },
  previewLetterBody: { fontSize: 14, lineHeight: 22, fontFamily: AppFonts.body, marginBottom: 14 },
  previewLetterClosing: { fontSize: 14, fontWeight: "600" },
  previewSignature: { fontSize: 18, fontWeight: "700", fontFamily: AppFonts.displaySans, marginTop: 4 },
  previewKicker: { textAlign: "center", fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 4 },
  previewPaperTitle: { textAlign: "center", fontFamily: AppFonts.displaySans, fontSize: 20, fontWeight: "700", marginBottom: 8 },
  previewPaperBody: { fontFamily: AppFonts.body, fontSize: 14, lineHeight: 22, marginTop: 8 },
  previewPhoto: { width: "100%", height: 150, borderRadius: 10, marginTop: 12 },
  previewQuote: { fontFamily: AppFonts.body, fontStyle: "italic", fontSize: 14, textAlign: "center", marginTop: 12 },
  previewMentor: { textAlign: "center", fontSize: 12, fontWeight: "700", marginTop: 14 },
  previewDate: { textAlign: "right", fontSize: 10, marginTop: 8 },
  previewDone: { backgroundColor: "#FFFFFF", borderRadius: 15, height: 48, alignItems: "center", justifyContent: "center", marginHorizontal: 20, marginBottom: 14 },
  previewDoneText: { color: "#111111", fontSize: 14, fontWeight: "800" },
});
