import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ReadingListItem from "@/components/ReadingListItem";
import { useColors } from "@/hooks/useColors";
import { useGlucose } from "@/context/GlucoseContext";
import type { GlucoseStatus } from "@/types";
import { formatDate } from "@/utils/glucoseUtils";

type Filter = "all" | GlucoseStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "normal", label: "Normal" },
  { id: "elevated", label: "Elevado" },
  { id: "high", label: "Alto" },
  { id: "low", label: "Baixo" },
];

export default function HistoryScreen() {
  const colors = useColors() as unknown as Record<string, string>;
  const insets = useSafeAreaInsets();
  const { readings, deleteReading } = useGlucose();
  const [filter, setFilter] = useState<Filter>("all");

  const topPad = insets.top > 0 ? insets.top : 67;

  const filtered = useMemo(() => {
    if (filter === "all") return readings;
    return readings.filter((r) => r.status === filter);
  }, [readings, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof readings>();
    for (const r of filtered) {
      const key = formatDate(r.timestamp);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const avg =
    filtered.length > 0
      ? Math.round(filtered.reduce((s, r) => s + r.value, 0) / filtered.length)
      : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Histórico
        </Text>
        {avg !== null && (
          <View style={[styles.avgBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.avgLabel, { color: colors.mutedForeground }]}>
              Média
            </Text>
            <Text style={[styles.avgValue, { color: colors.primary }]}>
              {avg} mg/dL
            </Text>
          </View>
        )}
      </View>

      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(f) => f.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.id)}
              activeOpacity={0.8}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === item.id ? colors.primary : colors.card,
                  borderColor: filter === item.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: filter === item.id ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {grouped.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Feather name="activity" size={44} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Nenhum registro encontrado
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            {filter !== "all"
              ? "Tente outro filtro"
              : "Registre sua primeira glicose na aba Registrar"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={([date]) => date}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: [date, group] }) => (
            <View>
              <Text style={[styles.dateHeader, { color: colors.mutedForeground }]}>
                {date}
              </Text>
              {group.map((reading) => (
                <ReadingListItem
                  key={reading.id}
                  reading={reading}
                  onDelete={deleteReading}
                  showDate={false}
                />
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontFamily: "Nunito_700Bold", fontWeight: "700" },
  avgBadge: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  avgLabel: {
    fontSize: 10,
    fontFamily: "Nunito_600SemiBold",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  avgValue: { fontSize: 16, fontFamily: "Nunito_700Bold", fontWeight: "700" },
  filterWrap: { marginBottom: 8 },
  filterList: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterLabel: { fontSize: 13, fontFamily: "Nunito_600SemiBold", fontWeight: "600" },
  listContent: { paddingHorizontal: 20, paddingTop: 8 },
  dateHeader: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Nunito_700Bold", fontWeight: "700", textAlign: "center" },
  emptySub: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
