import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { getStatusLabel } from "@/utils/glucoseUtils";
import type { GlucoseStatus } from "@/types";

interface Props {
  status: GlucoseStatus;
  size?: "sm" | "md";
}

export default function GlucoseStatusBadge({ status, size = "md" }: Props) {
  const colors = useColors() as unknown as Record<string, string>;

  const statusColorMap: Record<GlucoseStatus, { bg: string; text: string }> = {
    normal: { bg: colors.statusNormalBg, text: colors.statusNormal },
    elevated: { bg: colors.statusElevatedBg, text: colors.statusElevated },
    high: { bg: colors.statusHighBg, text: colors.statusHigh },
    low: { bg: colors.statusLowBg, text: colors.statusLow },
  };

  const { bg, text } = statusColorMap[status];
  const isSm = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        isSm && styles.badgeSm,
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: text },
          isSm && styles.dotSm,
        ]}
      />
      <Text
        style={[
          styles.label,
          { color: text },
          isSm && styles.labelSm,
        ]}
      >
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotSm: {
    width: 5,
    height: 5,
  },
  label: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
  labelSm: {
    fontSize: 11,
  },
});
