import React, { useEffect } from "react";
import { Image, View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

interface MascotViewProps {
  size?: number;
  mood?: "happy" | "neutral" | "worried" | "sad";
  animate?: boolean;
  style?: object;
}

export default function MascotView({
  size = 120,
  mood = "happy",
  animate = true,
  style,
}: MascotViewProps) {
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!animate) return;
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle, style]}>
      <Image
        source={require("@/assets/images/mascot.png")}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
