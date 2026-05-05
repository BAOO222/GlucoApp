import React from "react";
import { Platform, View, ViewStyle } from "react-native";
import Animated, { AnimationCallback, EntryExitAnimationFunction } from "react-native-reanimated";

interface Props {
  entering?: EntryExitAnimationFunction | AnimationCallback;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
}

export default function AnimatedView({ entering, style, children }: Props) {
  if (Platform.OS === "web") {
    return <View style={style as ViewStyle}>{children}</View>;
  }
  return (
    <Animated.View entering={entering as EntryExitAnimationFunction} style={style}>
      {children}
    </Animated.View>
  );
}
