import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useGlucose } from "@/context/GlucoseContext";

interface RowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, label, value, onPress, danger }: RowProps) {
  const colors = useColors() as unknown as Record<string, string>;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.row, { backgroundColor: colors.card }]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: danger ? colors.statusHighBg : colors.secondary },
        ]}
      >
        <Feather
          name={icon as "user"}
          size={18}
          color={danger ? colors.statusHigh : colors.primary}
        />
      </View>
      <Text
        style={[
          styles.rowLabel,
          { color: danger ? colors.statusHigh : colors.foreground },
        ]}
      >
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value && (
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
            {value}
          </Text>
        )}
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

function RangeAdjuster({
  label,
  value,
  onDecrease,
  onIncrease,
  unit,
  colors,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  unit: string;
  colors: Record<string, string>;
}) {
  return (
    <View style={[styles.adjuster, { backgroundColor: colors.background }]}>
      <Text style={[styles.adjusterLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <View style={styles.adjusterRow}>
        <TouchableOpacity
          onPress={onDecrease}
          onLongPress={onDecrease}
          style={[styles.adjBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="minus" size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.adjValue}>
          <Text style={[styles.adjValueText, { color: colors.foreground }]}>
            {value}
          </Text>
          <Text style={[styles.adjUnit, { color: colors.mutedForeground }]}>
            {unit}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onIncrease}
          onLongPress={onIncrease}
          style={[styles.adjBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MoreScreen() {
  const colors = useColors() as unknown as Record<string, string>;
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, readings } = useGlucose();

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(profile.name);

  const [showRangeModal, setShowRangeModal] = useState(false);
  const [draftMin, setDraftMin] = useState(profile.targetMin);
  const [draftMax, setDraftMax] = useState(profile.targetMax);

  const topPad = insets.top > 0 ? insets.top : 67;

  async function handleSaveName() {
    if (!name.trim()) return;
    await updateProfile({ name: name.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditingName(false);
  }

  function openRangeModal() {
    setDraftMin(profile.targetMin);
    setDraftMax(profile.targetMax);
    setShowRangeModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function handleSaveRange() {
    if (draftMin >= draftMax) {
      Alert.alert(
        "Faixa inválida",
        "O valor mínimo deve ser menor que o máximo."
      );
      return;
    }
    await updateProfile({ targetMin: draftMin, targetMax: draftMax });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowRangeModal(false);
  }

  function adjustMin(delta: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraftMin((v) => Math.max(40, Math.min(draftMax - 1, v + delta)));
  }

  function adjustMax(delta: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraftMax((v) => Math.max(draftMin + 1, Math.min(400, v + delta)));
  }

  const totalReadings = readings.length;
  const normalCount = readings.filter((r) => r.status === "normal").length;
  const normalPct =
    totalReadings > 0 ? Math.round((normalCount / totalReadings) * 100) : 0;
  const avgValue =
    totalReadings > 0
      ? Math.round(readings.reduce((s, r) => s + r.value, 0) / totalReadings)
      : null;

  return (
    <>
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 8, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <Image
            source={require("@/assets/images/mascot.png")}
            style={styles.profileMascot}
            resizeMode="contain"
          />
          <View style={styles.profileInfo}>
            {editingName ? (
              <View style={styles.editRow}>
                <TextInput
                  style={[
                    styles.nameInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.foreground,
                    },
                  ]}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  placeholder="Seu nome"
                  placeholderTextColor={colors.mutedForeground}
                  onSubmitEditing={handleSaveName}
                />
                <TouchableOpacity onPress={handleSaveName}>
                  <Feather name="check" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={[styles.profileName, { color: colors.foreground }]}>
                  {profile.name || "Seu nome"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setName(profile.name);
                    setEditingName(true);
                  }}
                >
                  <Feather name="edit-2" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            )}
            <Text style={[styles.profileSub, { color: colors.mutedForeground }]}>
              Membro GlucoApp
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {totalReadings}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Registros
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.statusNormal }]}>
              {normalPct}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Na faixa ideal
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {avgValue ?? "--"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Média mg/dL
            </Text>
          </View>
        </View>

        {/* Settings */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Configurações
        </Text>
        <View style={styles.section}>
          <SettingsRow
            icon="user"
            label="Meu perfil"
            value={profile.name || "Definir nome"}
            onPress={() => setEditingName(true)}
          />
          <SettingsRow
            icon="target"
            label="Faixa ideal"
            value={`${profile.targetMin}–${profile.targetMax} mg/dL`}
            onPress={openRangeModal}
          />
          <SettingsRow
            icon="bell"
            label="Lembretes"
            value="Em breve"
            onPress={() =>
              Alert.alert("Lembretes", "Notificações estarão disponíveis em breve.")
            }
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Sobre o app
        </Text>
        <View style={styles.section}>
          <SettingsRow
            icon="heart"
            label="Sobre o GlucoApp"
            onPress={() =>
              Alert.alert(
                "GlucoApp",
                "Um app feito com carinho para quem convive com diabetes. Monitoramento simples, humano e acolhedor."
              )
            }
          />
          <SettingsRow icon="info" label="Versão" value="1.0.0" />
        </View>

        <View style={styles.footer}>
          <Image
            source={require("@/assets/images/mascot.png")}
            style={styles.footerMascot}
            resizeMode="contain"
          />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Feito com muito carinho para você
          </Text>
        </View>
      </ScrollView>

      {/* Range Modal */}
      <Modal
        visible={showRangeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRangeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRangeModal(false)}
        />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Faixa ideal de glicose
              </Text>
              <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
                Ajuste conforme orientação do seu médico
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowRangeModal(false)}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Visual range preview */}
          <View style={[styles.rangePreview, { backgroundColor: colors.background }]}>
            <View style={styles.rangePreviewBar}>
              <View style={[styles.rangeTrackFull, { backgroundColor: colors.statusLowBg }]}>
                <View
                  style={[
                    styles.rangeTrackIdeal,
                    {
                      backgroundColor: colors.statusNormal + "50",
                      left: `${Math.max(0, ((draftMin - 40) / 360) * 100)}%` as unknown as number,
                      right: `${Math.max(0, 100 - ((draftMax - 40) / 360) * 100)}%` as unknown as number,
                    },
                  ]}
                />
              </View>
              <View style={styles.rangePreviewLabels}>
                <Text style={[styles.rangePreviewLabel, { color: colors.statusLow }]}>
                  40
                </Text>
                <Text style={[styles.rangePreviewLabel, { color: colors.statusNormal }]}>
                  {draftMin} – {draftMax}
                </Text>
                <Text style={[styles.rangePreviewLabel, { color: colors.statusHigh }]}>
                  400
                </Text>
              </View>
            </View>
          </View>

          {/* Adjusters */}
          <View style={styles.adjusters}>
            <RangeAdjuster
              label="Mínimo"
              value={draftMin}
              onDecrease={() => adjustMin(-1)}
              onIncrease={() => adjustMin(1)}
              unit="mg/dL"
              colors={colors}
            />
            <View style={[styles.adjusterDivider, { backgroundColor: colors.border }]} />
            <RangeAdjuster
              label="Máximo"
              value={draftMax}
              onDecrease={() => adjustMax(-1)}
              onIncrease={() => adjustMax(1)}
              unit="mg/dL"
              colors={colors}
            />
          </View>

          {/* Preset suggestions */}
          <View style={styles.presets}>
            <Text style={[styles.presetsLabel, { color: colors.mutedForeground }]}>
              Sugestões comuns
            </Text>
            <View style={styles.presetChips}>
              {[
                { label: "Padrão (70–180)", min: 70, max: 180 },
                { label: "Restrito (70–140)", min: 70, max: 140 },
                { label: "Gestacional (60–130)", min: 60, max: 130 },
              ].map((p) => (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDraftMin(p.min);
                    setDraftMax(p.max);
                  }}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        draftMin === p.min && draftMax === p.max
                          ? colors.primary
                          : colors.secondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      {
                        color:
                          draftMin === p.min && draftMax === p.max
                            ? colors.primaryForeground
                            : colors.foreground,
                      },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSaveRange}
            activeOpacity={0.88}
            style={[styles.saveBtn, { backgroundColor: colors.primary, marginHorizontal: 20 }]}
          >
            <Feather name="check" size={18} color={colors.primaryForeground} />
            <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
              Salvar faixa ideal
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileMascot: { width: 72, height: 72 },
  profileInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  profileName: { fontSize: 22, fontFamily: "Nunito_700Bold", fontWeight: "700" },
  profileSub: { fontSize: 13, fontFamily: "Nunito_400Regular" },
  editRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  nameInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: { fontSize: 24, fontFamily: "Nunito_700Bold", fontWeight: "700" },
  statLabel: { fontSize: 11, fontFamily: "Nunito_400Regular", textAlign: "center" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: -8,
  },
  section: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: "Nunito_600SemiBold", fontWeight: "600" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { fontSize: 13, fontFamily: "Nunito_400Regular" },
  footer: { alignItems: "center", gap: 8, paddingTop: 8 },
  footerMascot: { width: 56, height: 56 },
  footerText: { fontSize: 13, fontFamily: "Nunito_400Regular" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
  modalSub: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
  },

  // Range preview
  rangePreview: {
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
  },
  rangePreviewBar: { gap: 6 },
  rangeTrackFull: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    position: "relative",
  },
  rangeTrackIdeal: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: 5,
  },
  rangePreviewLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rangePreviewLabel: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },

  // Adjusters
  adjusters: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  adjuster: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    alignItems: "center",
  },
  adjusterLabel: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  adjusterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adjBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  adjValue: { alignItems: "center", minWidth: 50 },
  adjValueText: {
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
    lineHeight: 34,
  },
  adjUnit: { fontSize: 11, fontFamily: "Nunito_400Regular" },
  adjusterDivider: { width: 1, alignSelf: "stretch", marginVertical: 8 },

  // Presets
  presets: { paddingHorizontal: 20, gap: 8 },
  presetsLabel: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  presetChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  presetChipText: {
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
    fontWeight: "600",
  },

  // Save
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
});
