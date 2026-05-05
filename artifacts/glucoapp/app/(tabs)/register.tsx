import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlucoseStatusBadge from "@/components/GlucoseStatusBadge";
import { useColors } from "@/hooks/useColors";
import { useGlucose } from "@/context/GlucoseContext";
import type { GlucoseContext } from "@/types";
import { getMascotMessage, getGlucoseStatus } from "@/utils/glucoseUtils";

const CONTEXT_OPTIONS: { id: GlucoseContext; icon: "moon" | "coffee" | "check-circle" | "zap"; label: string }[] = [
  { id: "fasting", icon: "moon", label: "Jejum" },
  { id: "before_meal", icon: "coffee", label: "Antes da refeição" },
  { id: "after_meal", icon: "check-circle", label: "Após refeição" },
  { id: "sleep", icon: "zap", label: "Dormir" },
];

export default function RegisterScreen() {
  const colors = useColors() as Record<string, string>;
  const insets = useSafeAreaInsets();
  const { addReading } = useGlucose();

  const [valueStr, setValueStr] = useState("120");
  const [context, setContext] = useState<GlucoseContext>("fasting");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const numValue = parseInt(valueStr, 10) || 0;
  const status = numValue > 0 ? getGlucoseStatus(numValue) : "normal";
  const mascotMsg = numValue > 0 ? getMascotMessage(status) : "Qual é o seu valor?";

  const statusColorMap: Record<string, string> = {
    normal: colors.statusNormal,
    elevated: colors.statusElevated,
    high: colors.statusHigh,
    low: colors.statusLow,
  };

  function adjust(delta: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = Math.max(1, Math.min(600, numValue + delta));
    setValueStr(String(next));
  }

  async function handleSave() {
    if (!numValue || numValue < 1) return;
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addReading(numValue, context, notes.trim() || undefined);
    setSaving(false);
    setValueStr("120");
    setNotes("");
    router.push("/(tabs)");
  }

  const topPad = insets.top > 0 ? insets.top : 67;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Registrar glicose
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            É rápido e ajuda no seu controle
          </Text>
        </View>
        <View style={[styles.helpBtn, { backgroundColor: colors.card }]}>
          <Feather name="help-circle" size={20} color={colors.mutedForeground} />
        </View>
      </View>

      {/* Mascot feedback */}
      <View style={[styles.mascotCard, { backgroundColor: colors.secondary }]}>
        <Image
          source={require("@/assets/images/mascot.png")}
          style={styles.mascotImg}
          resizeMode="contain"
        />
        <View style={styles.mascotBubble}>
          {numValue > 0 && (
            <View
              style={[
                styles.mascotStatus,
                { backgroundColor: statusColorMap[status] + "20" },
              ]}
            >
              <Feather
                name={
                  status === "normal"
                    ? "check-circle"
                    : status === "low"
                    ? "alert-triangle"
                    : "alert-circle"
                }
                size={12}
                color={statusColorMap[status]}
              />
              <Text style={[styles.mascotStatusText, { color: statusColorMap[status] }]}>
                {status === "normal"
                  ? "Ótimo valor para jejum!"
                  : status === "elevated"
                  ? "Um pouco elevado"
                  : status === "high"
                  ? "Valor alto"
                  : "Valor baixo"}
              </Text>
            </View>
          )}
          <Text style={[styles.mascotMsg, { color: colors.foreground }]}>
            {mascotMsg}
          </Text>
        </View>
      </View>

      {/* Value input */}
      <View style={[styles.valueCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.valuePrompt, { color: colors.mutedForeground }]}>
          Qual é o seu valor?
        </Text>
        <View style={styles.valueRow}>
          <TouchableOpacity
            onPress={() => adjust(-1)}
            onLongPress={() => adjust(-10)}
            style={[styles.adjBtn, { backgroundColor: colors.secondary }]}
          >
            <Feather name="minus" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.valueCenter}>
            <TextInput
              style={[styles.valueInput, { color: colors.foreground }]}
              value={valueStr}
              onChangeText={(t) => setValueStr(t.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={3}
              selectTextOnFocus
            />
            <Text style={[styles.valueUnit, { color: colors.mutedForeground }]}>
              mg/dL
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => adjust(1)}
            onLongPress={() => adjust(10)}
            style={[styles.adjBtn, { backgroundColor: colors.secondary }]}
          >
            <Feather name="plus" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {numValue > 0 && (
          <View style={styles.statusRow}>
            <GlucoseStatusBadge status={status} />
            <View style={styles.rangeInfo}>
              <Feather name="shield" size={12} color={colors.mutedForeground} />
              <Text style={[styles.rangeText, { color: colors.mutedForeground }]}>
                Dentro da faixa ideal
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Context */}
      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
        Contexto
      </Text>
      <View style={styles.contextGrid}>
        {CONTEXT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setContext(opt.id);
            }}
            activeOpacity={0.8}
            style={[
              styles.contextOption,
              {
                backgroundColor: context === opt.id ? colors.primary : colors.card,
                borderColor: context === opt.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Feather
              name={opt.icon}
              size={18}
              color={context === opt.id ? colors.primaryForeground : colors.mutedForeground}
            />
            <Text
              style={[
                styles.contextLabel,
                { color: context === opt.id ? colors.primaryForeground : colors.foreground },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time */}
      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
        Horário
      </Text>
      <View style={[styles.timeRow, { backgroundColor: colors.card }]}>
        <Feather name="clock" size={16} color={colors.primary} />
        <Text style={[styles.timeText, { color: colors.foreground }]}>
          Hoje,{" "}
          {(() => {
            const d = new Date();
            return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
          })()}
        </Text>
      </View>

      {/* Notes */}
      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
        Observação (opcional)
      </Text>
      <TextInput
        style={[
          styles.notesInput,
          { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
        ]}
        placeholder="Algo importante sobre esse momento?"
        placeholderTextColor={colors.mutedForeground}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        maxLength={100}
      />
      <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
        {notes.length}/100
      </Text>

      {/* Save */}
      <TouchableOpacity
        onPress={handleSave}
        activeOpacity={0.88}
        disabled={saving || numValue < 1}
        style={[
          styles.saveBtn,
          { backgroundColor: numValue > 0 && !saving ? colors.primary : colors.muted },
        ]}
      >
        <Text
          style={[
            styles.saveBtnText,
            { color: numValue > 0 && !saving ? colors.primaryForeground : colors.mutedForeground },
          ]}
        >
          {saving ? "Salvando..." : "Salvar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: 24, fontFamily: "Nunito_700Bold", fontWeight: "700" },
  subtitle: { fontSize: 13, fontFamily: "Nunito_400Regular", marginTop: 2 },
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  mascotCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mascotImg: { width: 80, height: 80 },
  mascotBubble: { flex: 1, gap: 8 },
  mascotStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  mascotStatusText: { fontSize: 12, fontFamily: "Nunito_700Bold", fontWeight: "700" },
  mascotMsg: { fontSize: 16, fontFamily: "Nunito_600SemiBold", fontWeight: "600", lineHeight: 22 },
  valueCard: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: "#3B7CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  valuePrompt: { fontSize: 13, fontFamily: "Nunito_600SemiBold", fontWeight: "600", textAlign: "center" },
  valueRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  adjBtn: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  valueCenter: { alignItems: "center" },
  valueInput: {
    fontSize: 60,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
    textAlign: "center",
    minWidth: 120,
    lineHeight: 68,
  },
  valueUnit: { fontSize: 14, fontFamily: "Nunito_400Regular" },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rangeInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  rangeText: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  sectionLabel: { fontSize: 16, fontFamily: "Nunito_700Bold", fontWeight: "700" },
  contextGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  contextOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    minWidth: "45%",
  },
  contextLabel: { fontSize: 13, fontFamily: "Nunito_600SemiBold", fontWeight: "600", flexShrink: 1 },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
  },
  timeText: { fontSize: 14, fontFamily: "Nunito_600SemiBold", fontWeight: "600" },
  notesInput: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: { fontSize: 11, fontFamily: "Nunito_400Regular", textAlign: "right", marginTop: -8 },
  saveBtn: { paddingVertical: 18, borderRadius: 18, alignItems: "center" },
  saveBtnText: { fontSize: 17, fontFamily: "Nunito_700Bold", fontWeight: "700" },
});
