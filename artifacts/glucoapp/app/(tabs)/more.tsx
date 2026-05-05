import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Image,
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
  const colors = useColors() as Record<string, string>;
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

export default function MoreScreen() {
  const colors = useColors() as Record<string, string>;
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, readings } = useGlucose();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);

  const topPad = insets.top > 0 ? insets.top : 67;

  async function handleSaveName() {
    if (!name.trim()) return;
    await updateProfile({ name: name.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
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
          {editing ? (
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
                  setEditing(true);
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
          onPress={() => setEditing(true)}
        />
        <SettingsRow
          icon="target"
          label="Faixa ideal"
          value={`${profile.targetMin}–${profile.targetMax} mg/dL`}
          onPress={() =>
            Alert.alert(
              "Faixa ideal",
              "Em breve você poderá personalizar sua faixa ideal."
            )
          }
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
});
