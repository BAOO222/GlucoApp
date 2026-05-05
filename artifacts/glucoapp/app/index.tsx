import { Redirect } from "expo-router";
import { useGlucose } from "@/context/GlucoseContext";

export default function RootIndex() {
  const { profile, isLoaded } = useGlucose();
  if (!isLoaded) return null;
  if (!profile.name) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
