import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { generateId, getGlucoseStatus } from "@/utils/glucoseUtils";
import type { GlucoseContext as GlucoseCtxType, GlucoseReading, UserProfile } from "@/types";

const READINGS_KEY = "@glucoapp_readings";
const PROFILE_KEY = "@glucoapp_profile";

interface GlucoseContextValue {
  readings: GlucoseReading[];
  profile: UserProfile;
  isLoaded: boolean;
  addReading: (
    value: number,
    context: GlucoseCtxType,
    notes?: string
  ) => Promise<void>;
  deleteReading: (id: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  latestReading: GlucoseReading | null;
}

const GlucoseContext = createContext<GlucoseContextValue | null>(null);

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  targetMin: 70,
  targetMax: 180,
};

export function GlucoseProvider({ children }: { children: React.ReactNode }) {
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [rawReadings, rawProfile] = await Promise.all([
          AsyncStorage.getItem(READINGS_KEY),
          AsyncStorage.getItem(PROFILE_KEY),
        ]);
        if (rawReadings) setReadings(JSON.parse(rawReadings));
        if (rawProfile) setProfile(JSON.parse(rawProfile));
      } catch {
      } finally {
        setIsLoaded(true);
      }
    }
    load();
  }, []);

  const addReading = useCallback(
    async (value: number, context: GlucoseCtxType, notes?: string) => {
      const reading: GlucoseReading = {
        id: generateId(),
        value,
        timestamp: Date.now(),
        context,
        notes,
        status: getGlucoseStatus(value),
      };
      const next = [reading, ...readings];
      setReadings(next);
      await AsyncStorage.setItem(READINGS_KEY, JSON.stringify(next));
    },
    [readings]
  );

  const deleteReading = useCallback(
    async (id: string) => {
      const next = readings.filter((r) => r.id !== id);
      setReadings(next);
      await AsyncStorage.setItem(READINGS_KEY, JSON.stringify(next));
    },
    [readings]
  );

  const updateProfile = useCallback(
    async (partial: Partial<UserProfile>) => {
      const next = { ...profile, ...partial };
      setProfile(next);
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    },
    [profile]
  );

  const latestReading = readings.length > 0 ? readings[0] : null;

  return (
    <GlucoseContext.Provider
      value={{
        readings,
        profile,
        isLoaded,
        addReading,
        deleteReading,
        updateProfile,
        latestReading,
      }}
    >
      {children}
    </GlucoseContext.Provider>
  );
}

export function useGlucose() {
  const ctx = useContext(GlucoseContext);
  if (!ctx) throw new Error("useGlucose must be used inside GlucoseProvider");
  return ctx;
}
