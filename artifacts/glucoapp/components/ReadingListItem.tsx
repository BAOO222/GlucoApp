import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GlucoseStatusBadge from "@/components/GlucoseStatusBadge";
import { useColors } from "@/hooks/useColors";
import type { GlucoseReading } from "@/types";
import {
  formatDate,
  formatTime,
  getContextLabel,
} from "@/utils/glucoseUtils";

interface Props {
  reading: GlucoseReading;
  onDelete: (id: string) => void;
  showDate?: boolean;
}

export default function ReadingListItem({
  reading,
  onDelete,
  showDate = true,
}: Props) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function handleDelete() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Excluir registro",
      "Tem certeza que deseja excluir este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => onDelete(reading.id),
        },
      ]
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[styles.container, { backgroundColor: colors.card }]}
      >
        <View style={styles.left}>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: colors.foreground }]}>
              {reading.value}
            </Text>
            <Text style={[styles.unit, { color: colors.mutedForeground }]}>
              {" "}mg/dL
            </Text>
          </View>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {getContextLabel(reading.context)}
            {showDate
              ? ` · ${formatDate(reading.timestamp)}, ${formatTime(reading.timestamp)}`
              : ` · ${formatTime(reading.timestamp)}`}
          </Text>
        </View>
        <View style={styles.right}>
          <GlucoseStatusBadge status={reading.status} size="sm" />
          <TouchableOpacity onPress={handleDelete} hitSlop={8} style={styles.deleteBtn}>
            <Feather name="trash-2" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  left: {
    gap: 3,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
  unit: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
  },
  meta: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deleteBtn: {
    padding: 4,
  },
});
