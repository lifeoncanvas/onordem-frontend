import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import QRCodeSvg from "./QRCodeSvg";

interface QrCodeModalProps {
  visible: boolean;
  onClose: () => void;
  appUrl?: string;
  initialTab?: "show" | "scan";
}

export default function QrCodeModal({
  visible,
  onClose,
  appUrl = "https://onodem.com",
  initialTab = "show",
}: QrCodeModalProps) {
  const { width, height } = useWindowDimensions();
  const qrSize = Math.max(150, Math.min(220, width - 80, height * 0.3));
  const [activeTab, setActiveTab] = useState<"show" | "scan">(initialTab);
  const [copied, setCopied] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const videoRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const scanIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<any>(null);

  // Laser scan line animation
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      setScanResult(null);
      setCameraError(null);
      if (initialTab === "scan") {
        startCamera();
      }
    } else {
      stopCameraTracks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialTab]);

  // Laser sweep animation loop
  useEffect(() => {
    if (cameraActive) {
      const sweep = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      sweep.start();
      return () => sweep.stop();
    }
  }, [cameraActive, laserAnim]);

  const stopCameraTracks = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleScanDetected = (decodedText: string) => {
    setScanResult(decodedText);
    stopCameraTracks();

    // Auto navigate if it's an app URL or path
    setTimeout(() => {
      onClose();
      if (decodedText.includes("/memory-wall")) {
        router.push("/memory-wall");
      } else if (decodedText.includes("/discover")) {
        router.push("/discover");
      } else if (decodedText.includes("/create")) {
        router.push("/create");
      } else if (decodedText.includes("/home")) {
        router.push("/home");
      } else if (decodedText.startsWith("http")) {
        if (Platform.OS === "web" && typeof window !== "undefined") {
          window.location.href = decodedText;
        }
      } else {
        router.push("/home");
      }
    }, 900);
  };

  const startScanningLoop = () => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    // Check for native BarcodeDetector API support
    const hasBarcodeDetector = "BarcodeDetector" in window;
    if (hasBarcodeDetector) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                if (code) {
                  handleScanDetected(code);
                }
              }
            } catch {
              // frame detection pass
            }
          }
        }, 300);
      } catch {
        // BarcodeDetector initialization fallback
      }
    }
  };

  const startCamera = async () => {
    if (Platform.OS !== "web") return;
    try {
      setCameraError(null);
      setScanResult(null);
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
        startScanningLoop();
      } else {
        setCameraError("Camera is not supported on this browser.");
      }
    } catch {
      setCameraError("Camera permission denied. Please allow camera access in your browser bar.");
      setCameraActive(false);
    }
  };

  const handleTabChange = (tab: "show" | "scan") => {
    if (tab === "scan") {
      setActiveTab("scan");
      startCamera();
    } else {
      stopCameraTracks();
      setActiveTab("show");
    }
  };

  const handleClose = () => {
    stopCameraTracks();
    onClose();
  };

  const handleCopy = async () => {
    try {
      if (Platform.OS !== "web" || typeof navigator === "undefined" || !navigator.clipboard) {
        setActionError("Copy isn't available in this browser.");
        return;
      }
      await navigator.clipboard.writeText(appUrl);
      setActionError(null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setActionError("Couldn't copy the link. Please try again.");
    }
  };

  const handleShare = async () => {
    if (Platform.OS !== "web" || typeof navigator === "undefined" || !navigator.share) {
      await handleCopy();
      return;
    }

    try {
      await navigator.share({
        title: "Honour Your Mentor",
        text: "Take your memories with you.",
        url: appUrl,
      });
      setActionError(null);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setActionError("Couldn't open sharing. You can copy the link instead.");
    }
  };

  const handleFileUpload = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (Platform.OS === "web" && typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        const imageBitmap = await createImageBitmap(file);
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const barcodes = await detector.detect(imageBitmap);
        if (barcodes.length > 0 && barcodes[0].rawValue) {
          handleScanDetected(barcodes[0].rawValue);
          return;
        }
      } catch {
        // detection failed
      }
    }
    // Fallback if no code detected or BarcodeDetector not available
    setScanResult(`Image loaded: ${file.name}`);
  };

  const translateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 190],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close app install popup"
          >
            <Ionicons name="close" size={21} color="#A1A1A1" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {activeTab === "show" ? (
              <View style={styles.installContent}>
                <View style={styles.benefitPills}>
                  <Text style={[styles.benefitPill, styles.benefitPillPeach]}>Birthday reminders</Text>
                  <Text style={[styles.benefitPill, styles.benefitPillPink]}>Tributes anywhere</Text>
                  <Text style={[styles.benefitPill, styles.benefitPillMint]}>Installs in seconds</Text>
                </View>

                <Text style={styles.installTitle}>Take your memories{"\n"}with you</Text>

                <View style={styles.qrWrapper}>
                  <QRCodeSvg
                    value={appUrl}
                    size={qrSize}
                    color="#000000"
                    backgroundColor="#FFFFFF"
                  />
                </View>

                <View style={styles.installSteps}>
                  <View style={styles.installStep}>
                    <Text style={[styles.stepNumber, styles.stepNumberMint]}>1</Text>
                    <Text style={styles.stepLabel}>Open your camera</Text>
                  </View>
                  <View style={styles.installStep}>
                    <Text style={[styles.stepNumber, styles.stepNumberPink]}>2</Text>
                    <Text style={styles.stepLabel}>Point at the code</Text>
                  </View>
                  <View style={styles.installStep}>
                    <Text style={[styles.stepNumber, styles.stepNumberPeach]}>3</Text>
                    <Text style={styles.stepLabel}>Tap Install</Text>
                  </View>
                </View>

                <View style={styles.linkActions}>
                  <TouchableOpacity
                    style={styles.sendLinkBtn}
                    onPress={handleShare}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                  >
                    <Ionicons name="paper-plane-outline" size={17} color="#111111" />
                    <Text style={styles.sendLinkBtnText}>Send link to my phone</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.copyLinkBtn}
                    onPress={handleCopy}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name={copied ? "checkmark" : "copy-outline"}
                      size={16}
                      color={copied ? "#8FF0C6" : "#FFFFFF"}
                    />
                    <Text style={styles.copyLinkBtnText}>{copied ? "Copied!" : "Copy link"}</Text>
                  </TouchableOpacity>
                </View>

                {actionError && <Text style={styles.actionError}>{actionError}</Text>}

                <TouchableOpacity
                  style={styles.scannerLink}
                  onPress={() => handleTabChange("scan")}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <Ionicons name="scan-outline" size={15} color="#BDBDBD" />
                  <Text style={styles.scannerLinkText}>Use camera scanner on this device</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tabContent}>
                <TouchableOpacity
                  style={styles.backToQr}
                  onPress={() => handleTabChange("show")}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <Ionicons name="arrow-back" size={15} color="#FFB899" />
                  <Text style={styles.backToQrText}>Back to app link</Text>
                </TouchableOpacity>
                <Text style={styles.scanTitle}>Scan a mentor QR code</Text>
                <Text style={styles.instruction}>
                  Point your camera at a Mentor Card or Tribute QR code to open it instantly.
                </Text>

                {/* Camera Viewport */}
                <View style={styles.scannerBox}>
                  {Platform.OS === "web" && (
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      style={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                        borderRadius: 14,
                        backgroundColor: "#09090B",
                        display: cameraActive ? "block" : "none",
                      }}
                    />
                  )}

                  {!cameraActive && (
                    <View style={styles.scannerPlaceholder}>
                      <View style={styles.cameraIconHalo}>
                        <Ionicons name="camera-outline" size={36} color="#FFFFFF" />
                      </View>
                      <Text style={styles.cameraPlaceholderText}>
                        {cameraError || "Ready to scan QR codes with your webcam or camera."}
                      </Text>
                      <TouchableOpacity style={styles.startCameraBtn} onPress={startCamera} activeOpacity={0.85}>
                        <Ionicons name="videocam" size={16} color="#09090B" />
                        <Text style={styles.startCameraBtnText}>Start Camera Scanner</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {cameraActive && (
                    <>
                      {/* Targeting Corners */}
                      <View style={styles.viewfinderFrame}>
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                      </View>

                      {/* Animated Neon Laser Bar */}
                      <Animated.View
                        style={[
                          styles.laserLine,
                          {
                            transform: [{ translateY }],
                          },
                        ]}
                      />
                    </>
                  )}
                </View>

                {scanResult && (
                  <View style={styles.scanSuccessBanner}>
                    <Ionicons name="checkmark-circle" size={18} color="#34D399" />
                    <Text style={styles.scanSuccessText} numberOfLines={1}>
                      Found: {scanResult}
                    </Text>
                  </View>
                )}

                {cameraActive ? (
                  <TouchableOpacity style={styles.stopCameraBtn} onPress={stopCameraTracks} activeOpacity={0.8}>
                    <Ionicons name="stop-circle-outline" size={16} color="#F87171" />
                    <Text style={styles.stopCameraBtnText}>Stop Camera</Text>
                  </TouchableOpacity>
                ) : (
                  // File upload fallback if webcam is blocked or user has an image
                  Platform.OS === "web" && (
                    <View style={styles.uploadRow}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                      <TouchableOpacity
                        style={styles.uploadBtn}
                        onPress={() => fileInputRef.current?.click()}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="image-outline" size={15} color="#A1A1AA" />
                        <Text style={styles.uploadBtnText}>Upload QR Image from Computer</Text>
                      </TouchableOpacity>
                    </View>
                  )
                )}

                {/* Quick Shortcuts */}
                <View style={styles.demoScanRow}>
                  <Text style={styles.demoScanTitle}>Or jump directly to:</Text>
                  <View style={styles.demoButtons}>
                    <TouchableOpacity
                      style={styles.demoBtn}
                      onPress={() => {
                        onClose();
                        router.push("/memory-wall");
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="images-outline" size={14} color="#FFFFFF" />
                      <Text style={styles.demoBtnText}>Memory Wall</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.demoBtn}
                      onPress={() => {
                        onClose();
                        router.push("/discover");
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="compass-outline" size={14} color="#FFFFFF" />
                      <Text style={styles.demoBtnText}>Discover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
  },
  card: {
    position: "relative",
    backgroundColor: "#171717",
    borderRadius: 28,
    width: "100%",
    maxWidth: 560,
    maxHeight: "92%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#303030",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 12,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  installContent: {
    alignItems: "center",
  },
  benefitPills: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  benefitPill: {
    overflow: "hidden",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 16,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#111111",
  },
  benefitPillPeach: {
    backgroundColor: "#FFB899",
  },
  benefitPillPink: {
    backgroundColor: "#FF9ECF",
  },
  benefitPillMint: {
    backgroundColor: "#8FF0C6",
  },
  installTitle: {
    maxWidth: "100%",
    marginBottom: 16,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  tabContent: {
    alignItems: "center",
    width: "100%",
  },
  scanTitle: {
    width: "100%",
    marginBottom: 6,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  instruction: {
    fontSize: 12.5,
    color: "#A1A1A1",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  installSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 16,
  },
  installStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    fontSize: 12,
    lineHeight: 26,
    fontWeight: "800",
    color: "#111111",
  },
  stepNumberMint: {
    backgroundColor: "#8FF0C6",
  },
  stepNumberPink: {
    backgroundColor: "#FF9ECF",
  },
  stepNumberPeach: {
    backgroundColor: "#FFB899",
  },
  stepLabel: {
    color: "#A1A1A1",
    fontSize: 11,
    fontWeight: "500",
  },
  linkActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  sendLinkBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
  },
  sendLinkBtnText: {
    color: "#111111",
    fontSize: 12.5,
    fontWeight: "700",
  },
  copyLinkBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#303030",
  },
  copyLinkBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  actionError: {
    marginTop: 10,
    color: "#FFB899",
    fontSize: 12,
    textAlign: "center",
  },
  scannerLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  scannerLinkText: {
    color: "#A1A1A1",
    fontSize: 10.5,
    textDecorationLine: "underline",
  },
  backToQr: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },
  backToQrText: {
    color: "#FFB899",
    fontSize: 13,
    fontWeight: "700",
  },
  scannerBox: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#09090B",
    borderWidth: 1,
    borderColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  scannerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  cameraIconHalo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#27272A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cameraPlaceholderText: {
    color: "#A1A1AA",
    fontSize: 12.5,
    marginBottom: 16,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 18,
  },
  startCameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  startCameraBtnText: {
    color: "#09090B",
    fontSize: 13,
    fontWeight: "700",
  },
  stopCameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "rgba(248, 113, 113, 0.12)",
    marginBottom: 12,
  },
  stopCameraBtnText: {
    color: "#F87171",
    fontSize: 12,
    fontWeight: "600",
  },
  scanSuccessBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(52, 211, 153, 0.14)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    width: "100%",
  },
  scanSuccessText: {
    flex: 1,
    fontSize: 12,
    color: "#34D399",
    fontWeight: "600",
  },
  uploadRow: {
    marginBottom: 14,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#27272A",
  },
  uploadBtnText: {
    fontSize: 12,
    color: "#D4D4D8",
  },
  viewfinderFrame: {
    position: "absolute",
    width: 150,
    height: 150,
    pointerEvents: "none",
  },
  corner: {
    position: "absolute",
    width: 22,
    height: 22,
    borderColor: "#34D399", // Neon Emerald Target
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  laserLine: {
    position: "absolute",
    left: "15%",
    right: "15%",
    height: 2,
    backgroundColor: "#34D399",
    shadowColor: "#34D399",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    pointerEvents: "none",
  },
  demoScanRow: {
    width: "100%",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  demoScanTitle: {
    fontSize: 12,
    color: "#71717A",
  },
  demoButtons: {
    flexDirection: "row",
    gap: 10,
  },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#27272A",
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
