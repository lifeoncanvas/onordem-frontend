import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, G } from "react-native-svg";
import { generateQRCode } from "@/utils/qrGenerator";

interface QRCodeSvgProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  quietZone?: number;
}

export default function QRCodeSvg({
  value,
  size = 200,
  color = "#1B4D3E",
  backgroundColor = "#FFFFFF",
  quietZone = 2,
}: QRCodeSvgProps) {
  const qrData = useMemo(() => {
    try {
      return generateQRCode(value);
    } catch {
      // Fallback simple 21x21 QR code if generation fails on extreme strings
      return generateQRCode("https://onodem.com");
    }
  }, [value]);

  const matrixSize = qrData.size;
  const totalSize = matrixSize + quietZone * 2;
  const cellSize = size / totalSize;

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect width={size} height={size} fill={backgroundColor} rx={12} />
        <G>
          {qrData.modules.map((row, r) =>
            row.map((isDark, c) => {
              if (!isDark) return null;
              const x = (c + quietZone) * cellSize;
              const y = (r + quietZone) * cellSize;
              return (
                <Rect
                  key={`${r}-${c}`}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill={color}
                  rx={cellSize * 0.25}
                />
              );
            })
          )}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});

