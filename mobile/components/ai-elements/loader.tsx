import { useEffect } from "react";
import { YStack } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

type LoaderProps = {
  size?: number;
  color?: string;
};

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export function Loader({ size = 18, color = "#999" }: LoaderProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 900,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <YStack items="center" justify="center">
      <AnimatedIcon
        name="refresh"
        size={size}
        color={color}
        style={animatedStyle}
      />
    </YStack>
  );
}
