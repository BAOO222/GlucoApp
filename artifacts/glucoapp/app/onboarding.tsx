import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
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

export default function OnboardingScreen() {
  const colors = useColors() as unknown as Record<string, string>;
  const insets = useSafeAreaInsets();
  const { updateProfile } = useGlucose();
  const [name, setName] = useState("");
  const [step, setStep] = useState<"welcome" | "name">("welcome");

  function handleStart() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep("name");
  }

  async function handleConfirm() {
    if (!name.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateProfile({ name: name.trim() });
    router.replace("/(tabs)");
  }

  const topPad = insets.top > 0 ? insets.top : 67;

  if (step === "name") {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.flex, { backgroundColor: colors.background }]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.nameContainer,
            { paddingTop: topPad + 60, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.nameContent}>
            <Image
              source={require("@/assets/images/mascot.png")}
              style={styles.nameMascot}
              resizeMode="contain"
            />
            <Text style={[styles.nameTitle, { color: colors.foreground }]}>
              Como posso te chamar?
            </Text>
            <Text style={[styles.nameSubtitle, { color: colors.mutedForeground }]}>
              Vou usar seu nome para deixar tudo mais pessoal
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                  fontFamily: "Nunito_600SemiBold",
                },
              ]}
              placeholder="Seu nome"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleConfirm}
            />
            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={0.85}
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: name.trim() ? colors.primary : colors.muted,
                },
              ]}
            >
              <Text
                style={[
                  styles.confirmBtnText,
                  {
                    color: name.trim()
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  },
                ]}
              >
                Vamos começar!
              </Text>
              <Feather
                name="arrow-right"
                size={20}
                color={name.trim() ? colors.primaryForeground : colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.welcome, { backgroundColor: colors.background }]}>
      <View style={[styles.blob, { backgroundColor: colors.primary + "18" }]} />
      <View style={[styles.blob2, { backgroundColor: colors.accent + "18" }]} />

      <View style={[styles.mascotWrap, { marginTop: topPad + 40 }]}>
        <Image
          source={require("@/assets/images/mascot.png")}
          style={styles.mascotHero}
          resizeMode="contain"
        />
        <View style={[styles.heartBadge, { backgroundColor: colors.primary }]}>
          <Feather name="heart" size={14} color="#fff" />
        </View>
      </View>

      <View style={styles.welcomeText}>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          Vamos continuar{"\n"}
          <Text style={{ color: colors.primary }}>juntos?</Text>
        </Text>
        <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
          Entre para continuar cuidando{"\n"}da sua saúde com facilidade.
        </Text>
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 32 }]}>
        <TouchableOpacity
          onPress={handleStart}
          activeOpacity={0.88}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
            Começar agora
          </Text>
          <Feather name="arrow-right" size={20} color={colors.primaryForeground} />
        </TouchableOpacity>
        <Text style={[styles.legal, { color: colors.mutedForeground }]}>
          Seus dados ficam protegidos no seu dispositivo
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  welcome: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  blob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    left: -100,
  },
  blob2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 80,
    right: -70,
  },
  mascotWrap: {
    alignItems: "center",
    position: "relative",
  },
  mascotHero: {
    width: 220,
    height: 220,
  },
  heartBadge: {
    position: "absolute",
    top: 20,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  heroTitle: {
    fontSize: 34,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 42,
  },
  heroSub: {
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  actions: {
    width: "100%",
    paddingHorizontal: 24,
    gap: 16,
    alignItems: "center",
  },
  primaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
    borderRadius: 18,
    shadowColor: "#3B7CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
  legal: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
  },
  nameContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  nameContent: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  nameMascot: {
    width: 140,
    height: 140,
    marginBottom: 8,
  },
  nameTitle: {
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
    textAlign: "center",
  },
  nameSubtitle: {
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  input: {
    width: "100%",
    fontSize: 17,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 8,
  },
  confirmBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
    borderRadius: 18,
    marginTop: 8,
  },
  confirmBtnText: {
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
});
