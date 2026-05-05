import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlucoseStatusBadge from "@/components/GlucoseStatusBadge";
import ReadingListItem from "@/components/ReadingListItem";
import { useColors } from "@/hooks/useColors";
import { useGlucose } from "@/context/GlucoseContext";
import {
  formatDate,
  formatTime,
  getInsightMessage,
} from "@/utils/glucoseUtils";

const QUICK_ACTIONS = [
  { id: "glucose", icon: "droplet" as const, label: "Registrar\nglicose" },
  { id: "meal", icon: "coffee" as const, label: "Registrar\nrefeição" },
  { id: "insulin", icon: "activity" as const, label: "Aplicar\ninsulina" },
];

export default function HomeScreen() {
  const colors = useColors() as unknown as Record<string, string>;
  const insets = useSafeAreaInsets();
  const { latestReading, readings, deleteReading, profile } = useGlucose();

  const recentReadings = readings.slice(0, 4);
  const topPad = insets.top > 0 ? insets.top : 67;

  function handleQuickAction() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/register");
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("@/assets/images/mascot.png")}
            style={styles.headerMascot}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.greeting, { color: colors.foreground }]}>
              {greeting}
            </Text>
            <Text style={[styles.greetingName, { color: colors.mutedForeground }]}>
              {profile.name ? `${profile.name}!` : "Vamos cuidar da sua saúde!"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.card }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="bell" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Main Glucose Card */}
      <View style={[styles.glucoseCard, { backgroundColor: colors.card }]}>
        <View style={styles.glucoseCardTop}>
          <Text style={[styles.glucoseLabel, { color: colors.mutedForeground }]}>
            Glicose atual
          </Text>
          {latestReading && (
            <GlucoseStatusBadge status={latestReading.status} />
          )}
        </View>

        {latestReading ? (
          <>
            <View style={styles.glucoseValueRow}>
              <View style={styles.glucoseNumbers}>
                <Text style={[styles.glucoseValue, { color: colors.foreground }]}>
                  {latestReading.value}
                </Text>
                <Text style={[styles.glucoseUnit, { color: colors.mutedForeground }]}>
                  mg/dL
                </Text>
              </View>
              <Image
                source={require("@/assets/images/mascot.png")}
                style={styles.cardMascot}
                resizeMode="contain"
              />
            </View>

            {/* Range bar */}
            <View style={styles.rangeBarWrap}>
              <View style={[styles.rangeTrack, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.rangeFill,
                    {
                      width: `${Math.min(Math.max(((latestReading.value - 40) / 260) * 100, 2), 96)}%` as unknown as number,
                      backgroundColor: latestReading.status === "normal"
                        ? colors.statusNormal
                        : latestReading.status === "elevated"
                        ? colors.statusElevated
                        : latestReading.status === "high"
                        ? colors.statusHigh
                        : colors.statusLow,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.rangeLabels}>
              <Text style={[styles.rangeLabel, { color: colors.mutedForeground }]}>70</Text>
              <Text style={[styles.rangeLabel, { color: colors.mutedForeground }]}>180</Text>
            </View>
            <Text style={[styles.rangeIdeal, { color: colors.mutedForeground }]}>
              Faixa ideal: 70–180 mg/dL · {formatDate(latestReading.timestamp)},{" "}
              {formatTime(latestReading.timestamp)}
            </Text>
          </>
        ) : (
          <View style={styles.noReadingWrap}>
            <Image
              source={require("@/assets/images/mascot.png")}
              style={styles.emptyMascot}
              resizeMode="contain"
            />
            <Text style={[styles.noReading, { color: colors.mutedForeground }]}>
              Nenhum registro ainda.{"\n"}Registre sua primeira glicose!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/register")}
              style={[styles.addFirstBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="plus" size={18} color={colors.primaryForeground} />
              <Text style={[styles.addFirstBtnText, { color: colors.primaryForeground }]}>
                Registrar agora
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={handleQuickAction}
            activeOpacity={0.8}
            style={[styles.quickAction, { backgroundColor: colors.card }]}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary }]}>
              <Feather name={action.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Insight card */}
      {latestReading && (
        <View style={[styles.insightCard, { backgroundColor: colors.secondary }]}>
          <View style={styles.insightHeader}>
            <View style={[styles.insightTag, { backgroundColor: colors.primary }]}>
              <Text style={[styles.insightTagText, { color: colors.primaryForeground }]}>
                Insight
              </Text>
            </View>
          </View>
          <Text style={[styles.insightTitle, { color: colors.foreground }]}>
            {latestReading.status === "normal"
              ? "Tudo certo hoje! Continue assim!"
              : latestReading.status === "elevated"
              ? "Atenção: glicose um pouco elevada"
              : latestReading.status === "high"
              ? "Glicose alta detectada"
              : "Glicose baixa detectada"}
          </Text>
          <Text style={[styles.insightText, { color: colors.mutedForeground }]}>
            {getInsightMessage(latestReading.status)}
          </Text>
        </View>
      )}

      {/* Recent history */}
      {recentReadings.length > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Histórico recente
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Ver tudo</Text>
            </TouchableOpacity>
          </View>
          {recentReadings.map((reading) => (
            <ReadingListItem
              key={reading.id}
              reading={reading}
              onDelete={deleteReading}
              showDate
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerMascot: { width: 44, height: 44 },
  greeting: {
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
  greetingName: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  glucoseCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#3B7CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  glucoseCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  glucoseLabel: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  glucoseValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  glucoseNumbers: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  glucoseValue: {
    fontSize: 56,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
    lineHeight: 64,
  },
  glucoseUnit: {
    fontSize: 18,
    fontFamily: "Nunito_400Regular",
    marginBottom: 8,
  },
  cardMascot: {
    width: 72,
    height: 72,
  },
  rangeBarWrap: { marginBottom: 6 },
  rangeTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  rangeFill: {
    height: "100%",
    borderRadius: 3,
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  rangeLabel: {
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
  },
  rangeIdeal: {
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
  },
  noReadingWrap: { alignItems: "center", gap: 12, paddingVertical: 12 },
  emptyMascot: { width: 80, height: 80 },
  noReading: {
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  addFirstBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addFirstBtnText: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 11,
    fontFamily: "Nunito_600SemiBold",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
  insightCard: {
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  insightHeader: { flexDirection: "row", alignItems: "center" },
  insightTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  insightTagText: {
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  insightTitle: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
  insightText: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    fontWeight: "600",
  },
});
