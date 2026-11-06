import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";
import { TributeDesignState } from "@/types/create";

interface TributeCanvasProps {
  design: TributeDesignState;
  isFullScreen?: boolean;
}

export default function TributeCanvas({
  design,
  isFullScreen = false,
}: TributeCanvasProps) {
  const {
    mentorName,
    relationship,
    customTitle,
    photoUri,
    story,
    quote,
    templateId,
    frameStyle,
    typographyStyle,
    textAlign,
    decorations,
  } = design;

  const fontStyle = getFontFamily(typographyStyle);
  const isCentered = textAlign === "center";

  // Render Decorations
  const renderDecorations = () => (
    <>
      {decorations.includes("wax-seal") && (
        <View style={styles.waxSealDeco}>
          <View style={styles.waxSealInner}>
            <Ionicons name="heart" size={13} color={Palette.pureWhite} />
          </View>
        </View>
      )}

      {decorations.includes("gold-ribbon") && (
        <View style={styles.ribbonDeco}>
          <View style={styles.ribbonTail} />
        </View>
      )}

      {decorations.includes("washi-tape") && (
        <View style={styles.washiTapeDeco} />
      )}

      {decorations.includes("botanical-branch") && (
        <View style={styles.laurelDeco}>
          <Ionicons name="leaf" size={14} color={Palette.turquoise} />
        </View>
      )}

      {decorations.includes("sparkle-star") && (
        <View style={styles.sparkleDeco}>
          <Ionicons name="sparkles" size={16} color={Palette.turquoise} />
        </View>
      )}

      {decorations.includes("photo-corners") && (
        <>
          <View style={[styles.cornerBracket, styles.topLeftBracket]} />
          <View style={[styles.cornerBracket, styles.topRightBracket]} />
          <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
          <View style={[styles.cornerBracket, styles.bottomRightBracket]} />
        </>
      )}
    </>
  );

  return (
    <View
      style={[
        styles.canvasContainer,
        isFullScreen && styles.canvasFullScreen,
        getFrameContainerStyle(frameStyle),
      ]}
    >
      {/* Decorative Accents */}
      {renderDecorations()}

      {/* Dynamic Layout by Template */}
      {templateId === "editorial" && (
        <View style={styles.editorialLayout}>
          <View style={styles.editorialImageWrapper}>
            <Image
              source={{ uri: photoUri }}
              style={styles.editorialImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                "transparent",
                "rgba(84, 0, 14, 0.4)",
                "rgba(84, 0, 14, 0.95)",
              ]}
              locations={[0.3, 0.65, 1]}
              style={styles.gradientOverlay}
            />

            <View style={styles.editorialMetaFloating}>
              <View style={styles.editorialBadge}>
                <Ionicons name="sparkles" size={10} color={Palette.turquoise} />
                <Text style={styles.editorialBadgeText}>
                  {relationship.toUpperCase()} · HONOUR
                </Text>
              </View>

              <Text
                style={styles.recognitionLabel}
                numberOfLines={1}
              >
                {customTitle || "With Deepest Appreciation"}
              </Text>

              <Text
                style={[
                  styles.editorialTitle,
                  fontStyle,
                  isCentered && styles.textCenter,
                ]}
              >
                {mentorName || "Beloved Mentor"}
              </Text>

              <Text
                style={[
                  styles.editorialQuote,
                  fontStyle,
                  isCentered && styles.textCenter,
                ]}
              >
                “{quote || story.slice(0, 90)}”
              </Text>
            </View>
          </View>

          <View style={styles.editorialBottomBar}>
            <Text style={styles.storyExcerpt} numberOfLines={2}>
              {story || "Some people change our lives in ways they may never realise."}
            </Text>
            <Text style={styles.signatureTag}>— With lifelong gratitude</Text>
          </View>
        </View>
      )}

      {templateId === "instant" && (
        <View style={styles.instantLayout}>
          <View style={styles.polaroidFrame}>
            <View style={styles.polaroidPhotoBox}>
              <Image
                source={{ uri: photoUri }}
                style={styles.polaroidImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.polaroidBottomArea}>
              <Text style={styles.recognitionLabel} numberOfLines={1}>
                {customTitle || "With Deepest Appreciation"}
              </Text>
              <Text
                style={[
                  styles.instantName,
                  fontStyle,
                  isCentered && styles.textCenter,
                ]}
              >
                {mentorName || "Beloved Mentor"}
              </Text>
              <Text
                style={[
                  styles.instantQuote,
                  fontStyle,
                  isCentered && styles.textCenter,
                ]}
              >
                “{quote || "A memory that never fades."}”
              </Text>
              <Text style={styles.instantDate}>{relationship} · Always Honoured</Text>
            </View>
          </View>
        </View>
      )}

      {templateId === "layered" && (
        <View style={styles.layeredLayout}>
          {/* Deckle Underlayer */}
          <View style={styles.layeredBackPaper} />

          <View style={styles.layeredCard}>
            <View style={styles.layeredPhotoWrapper}>
              <Image
                source={{ uri: photoUri }}
                style={styles.layeredImage}
                resizeMode="cover"
              />
              <View style={styles.layeredTag}>
                <Text style={styles.layeredTagText}>{relationship}</Text>
              </View>
            </View>

            <View style={styles.layeredTextContent}>
              <Text style={styles.recognitionLabel} numberOfLines={1}>
                {customTitle || "With Deepest Appreciation"}
              </Text>
              <Text
                style={[
                  styles.layeredName,
                  fontStyle,
                  isCentered && styles.textCenter,
                ]}
              >
                {mentorName || "Beloved Mentor"}
              </Text>
              <View style={styles.layeredQuoteCard}>
                <Text style={[styles.layeredQuoteText, fontStyle]}>
                  “{quote}”
                </Text>
              </View>
              <Text style={styles.layeredStoryText} numberOfLines={2}>
                {story}
              </Text>
            </View>
          </View>
        </View>
      )}

      {templateId === "minimal" && (
        <View style={styles.minimalLayout}>
          <View style={styles.minimalPhotoContainer}>
            <Image
              source={{ uri: photoUri }}
              style={styles.minimalImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.minimalDivider}>
            <View style={styles.minimalLine} />
            <View style={styles.minimalDiamond} />
            <View style={styles.minimalLine} />
          </View>

          <View style={styles.minimalTextGroup}>
            <Text style={styles.recognitionLabel} numberOfLines={1}>
              {customTitle || "With Deepest Appreciation"}
            </Text>
            <Text style={styles.minimalSub}>{relationship.toUpperCase()}</Text>
            <Text
              style={[
                styles.minimalName,
                fontStyle,
                isCentered && styles.textCenter,
              ]}
            >
              {mentorName || "Beloved Mentor"}
            </Text>
            <Text
              style={[
                styles.minimalQuote,
                fontStyle,
                isCentered && styles.textCenter,
              ]}
            >
              “{quote}”
            </Text>
          </View>
        </View>
      )}

      {templateId === "journal" && (
        <View style={styles.journalLayout}>
          <View style={styles.journalSpine} />

          <View style={styles.journalTopRow}>
            <View style={styles.journalPhotoMount}>
              <Image
                source={{ uri: photoUri }}
                style={styles.journalPhoto}
                resizeMode="cover"
              />
            </View>
            <View style={styles.journalHeaderRight}>
              <View style={styles.journalTag}>
                <Ionicons name="bookmark" size={10} color={Palette.oceanTeal} />
                <Text style={styles.journalTagText}>{relationship}</Text>
              </View>
              <Text style={[styles.journalName, fontStyle]}>
                {mentorName || "Beloved Mentor"}
              </Text>
              <Text style={styles.journalInscription}>{customTitle || "With Deepest Appreciation"}</Text>
            </View>
          </View>

          <View style={styles.journalBodyLines}>
            <View style={styles.journalQuoteBlock}>
              <Text style={[styles.journalQuoteText, fontStyle]}>“{quote}”</Text>
            </View>
            <Text style={styles.journalFullExcerpt} numberOfLines={3}>
              {story}
            </Text>
          </View>
        </View>
      )}

      {templateId === "collage" && (
        <View style={styles.collageLayout}>
          <View style={styles.collageGrid}>
            <View style={styles.collageMainPhotoBox}>
              <Image
                source={{ uri: photoUri }}
                style={styles.collageMainPhoto}
                resizeMode="cover"
              />
            </View>
            <View style={styles.collageSecondPhotoBox}>
              <Image
                source={require("../../../assets/images/img1.jpeg")}
                style={styles.collageSecondPhoto}
                resizeMode="cover"
              />
              <View style={styles.collageSecondTag}>
                <Text style={styles.collageSecondTagText}>MOMENT</Text>
              </View>
            </View>
          </View>

          <View style={styles.collageInfoBlock}>
            <Text style={styles.recognitionLabel} numberOfLines={1}>
              {customTitle || "With Deepest Appreciation"}
            </Text>
            <Text style={styles.collageRelation}>{relationship.toUpperCase()}</Text>
            <Text
              style={[
                styles.collageName,
                fontStyle,
                isCentered && styles.textCenter,
              ]}
            >
              {mentorName || "Beloved Mentor"}
            </Text>
            <Text
              style={[
                styles.collageQuote,
                fontStyle,
                isCentered && styles.textCenter,
              ]}
            >
              “{quote}”
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function getFontFamily(style: string) {
  switch (style) {
    case "serif": return { fontStyle: "italic" as const };
    case "display":
      return { fontWeight: "900" as const, letterSpacing: -0.5 };
    case "handwritten":
      return {
        fontFamily: AppFonts.handwritten,
        letterSpacing: 0.2,
      };
    case "modern":
    default:
      return { fontWeight: "700" as const, letterSpacing: 0 };
  }
}

function getFrameContainerStyle(style: string) {
  switch (style) {
    case "clean":
      return {
        borderWidth: 1.5,
        borderColor: "rgba(177, 167, 166, 0.4)",
        borderRadius: 22,
      };
    case "instant":
      return {
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.95)",
        backgroundColor: Palette.pureWhite,
        borderRadius: 16,
      };
    case "layered-deckle":
      return {
        borderWidth: 2,
        borderColor: "rgba(236, 143, 62, 0.4)",
        borderRadius: 24,
      };
    case "gold-leaf":
      return {
        borderWidth: 2.5,
        borderColor: Palette.turquoise,
        borderRadius: 22,
      };
    case "oval-vignette":
      return {
        borderWidth: 2,
        borderColor: "rgba(84, 0, 14, 0.3)",
        borderRadius: 28,
      };
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  canvasContainer: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    position: "relative",
    minHeight: 380,
  },
  canvasFullScreen: {
    minHeight: 480,
    borderRadius: 28,
  },
  textCenter: {
    textAlign: "center",
  },

  // Decorations
  waxSealDeco: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.oceanTeal,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  waxSealInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  ribbonDeco: {
    position: "absolute",
    top: 0,
    right: 28,
    width: 14,
    height: 18,
    backgroundColor: Palette.turquoise,
    zIndex: 10,
  },
  ribbonTail: {
    position: "absolute",
    bottom: -4,
    left: 2,
    width: 10,
    height: 4,
    backgroundColor: Palette.oceanTeal,
  },
  washiTapeDeco: {
    position: "absolute",
    top: 8,
    left: 16,
    width: 48,
    height: 12,
    backgroundColor: "rgba(236, 143, 62, 0.45)",
    transform: [{ rotate: "-8deg" }],
    borderRadius: 2,
    zIndex: 10,
  },
  laurelDeco: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(255, 248, 240, 0.8)",
    padding: 4,
    borderRadius: 10,
  },
  sparkleDeco: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 10,
  },
  cornerBracket: {
    position: "absolute",
    width: 12,
    height: 12,
    borderColor: Palette.turquoise,
    zIndex: 10,
  },
  topLeftBracket: {
    top: 10,
    left: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRightBracket: {
    top: 10,
    right: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeftBracket: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRightBracket: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },

  // 1. Editorial Layout
  editorialLayout: {
    flex: 1,
  },
  editorialImageWrapper: {
    height: 290,
    position: "relative",
  },
  editorialImage: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  editorialMetaFloating: {
    position: "absolute",
    bottom: 14,
    left: 16,
    right: 16,
  },
  editorialBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(84, 0, 14, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.4)",
  },
  editorialBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.pureWhite,
    letterSpacing: 0.8,
  },
  recognitionLabel: {
    color: "#A66D55",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  editorialTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: Palette.pureWhite,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  editorialQuote: {
    fontSize: 13.5,
    fontStyle: "italic",
    color: "rgba(252, 238, 228, 0.95)",
    lineHeight: 18,
  },
  editorialBottomBar: {
    padding: 16,
    backgroundColor: Palette.pureWhite,
  },
  storyExcerpt: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    lineHeight: 18,
  },
  signatureTag: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.oceanTeal,
    marginTop: 8,
    fontStyle: "italic",
  },

  // 2. Instant Photo Layout
  instantLayout: {
    padding: 14,
    backgroundColor: "#F7F3EE",
  },
  polaroidFrame: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 14,
    padding: 12,
    paddingBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  polaroidPhotoBox: {
    height: 220,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Palette.mintMist,
  },
  polaroidImage: {
    width: "100%",
    height: "100%",
  },
  polaroidBottomArea: {
    marginTop: 14,
    paddingHorizontal: 6,
  },
  instantName: {
    fontSize: 18,
    fontWeight: "900",
    color: Palette.deepTeal,
  },
  instantQuote: {
    fontSize: 13,
    fontStyle: "italic",
    color: Palette.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  instantDate: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.turquoise,
    marginTop: 8,
    letterSpacing: 0.8,
  },

  // 3. Layered Layout
  layeredLayout: {
    padding: 16,
    position: "relative",
    backgroundColor: Palette.iceWhite,
  },
  layeredBackPaper: {
    position: "absolute",
    top: 10,
    left: 20,
    right: 12,
    bottom: 8,
    backgroundColor: "rgba(252, 238, 228, 0.75)",
    borderRadius: 20,
    transform: [{ rotate: "-1.8deg" }],
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.25)",
  },
  layeredCard: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  layeredPhotoWrapper: {
    height: 190,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  layeredImage: {
    width: "100%",
    height: "100%",
  },
  layeredTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255, 248, 240, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  layeredTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.oceanTeal,
  },
  layeredTextContent: {
    marginTop: 12,
  },
  layeredName: {
    fontSize: 18,
    fontWeight: "900",
    color: Palette.deepTeal,
  },
  layeredQuoteCard: {
    backgroundColor: "rgba(252, 238, 228, 0.55)",
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 6,
  },
  layeredQuoteText: {
    fontSize: 12.5,
    fontStyle: "italic",
    color: Palette.deepTeal,
    lineHeight: 17,
  },
  layeredStoryText: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    lineHeight: 16,
  },

  // 4. Minimal Layout
  minimalLayout: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FFFCF9",
  },
  minimalPhotoContainer: {
    width: 170,
    height: 170,
    borderRadius: 85,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: Palette.mintMist,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    marginBottom: 16,
  },
  minimalImage: {
    width: "100%",
    height: "100%",
  },
  minimalDivider: {
    flexDirection: "row",
    alignItems: "center",
    width: "70%",
    gap: 8,
    marginBottom: 12,
  },
  minimalLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(177, 167, 166, 0.35)",
  },
  minimalDiamond: {
    width: 5,
    height: 5,
    backgroundColor: Palette.turquoise,
    transform: [{ rotate: "45deg" }],
  },
  minimalTextGroup: {
    alignItems: "center",
  },
  minimalSub: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.turquoise,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  minimalName: {
    fontSize: 20,
    fontWeight: "900",
    color: Palette.deepTeal,
    marginBottom: 8,
  },
  minimalQuote: {
    fontSize: 13,
    fontStyle: "italic",
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 270,
  },

  // 5. Journal Layout
  journalLayout: {
    padding: 16,
    backgroundColor: "#FFFDF9",
    position: "relative",
  },
  journalSpine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: Palette.turquoise,
  },
  journalTopRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    paddingLeft: 4,
  },
  journalPhotoMount: {
    width: 80,
    height: 80,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(236, 143, 62, 0.35)",
  },
  journalPhoto: {
    width: "100%",
    height: "100%",
  },
  journalHeaderRight: {
    flex: 1,
    justifyContent: "center",
  },
  journalTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  journalTagText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 0.8,
  },
  journalName: {
    fontSize: 17,
    fontWeight: "900",
    color: Palette.deepTeal,
  },
  journalInscription: {
    fontSize: 11,
    color: Palette.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  journalBodyLines: {
    paddingLeft: 4,
  },
  journalQuoteBlock: {
    backgroundColor: "rgba(252, 238, 228, 0.55)",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  journalQuoteText: {
    fontSize: 12.5,
    fontStyle: "italic",
    color: Palette.deepTeal,
    lineHeight: 17,
  },
  journalFullExcerpt: {
    fontSize: 12,
    color: Palette.textSecondary,
    lineHeight: 17,
  },

  // 6. Collage Layout
  collageLayout: {
    padding: 14,
    backgroundColor: Palette.pureWhite,
  },
  collageGrid: {
    flexDirection: "row",
    gap: 10,
    height: 180,
    marginBottom: 14,
  },
  collageMainPhotoBox: {
    flex: 1.4,
    borderRadius: 14,
    overflow: "hidden",
  },
  collageMainPhoto: {
    width: "100%",
    height: "100%",
  },
  collageSecondPhotoBox: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  collageSecondPhoto: {
    width: "100%",
    height: "100%",
  },
  collageSecondTag: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(84, 0, 14, 0.75)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  collageSecondTagText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
  collageInfoBlock: {
    paddingHorizontal: 4,
  },
  collageRelation: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.turquoise,
    letterSpacing: 1,
    marginBottom: 2,
  },
  collageName: {
    fontSize: 18,
    fontWeight: "900",
    color: Palette.deepTeal,
    marginBottom: 4,
  },
  collageQuote: {
    fontSize: 12.5,
    fontStyle: "italic",
    color: Palette.textSecondary,
    lineHeight: 17,
  },
});
