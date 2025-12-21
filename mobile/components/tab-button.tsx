import { useEffect } from "react";
import { Text } from "@react-navigation/elements";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { PlatformPressable } from "@react-navigation/elements";
import { useTheme } from "tamagui";

export default function TabBarButton({
  label,
  Icon,
  isFocused,
  onPress,
  onLongPress,
  href,
}: {
  label: string;
  Icon: any;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  href: string | undefined;
}) {
  const scale = useSharedValue(isFocused ? 1.1 : 1);

  const theme = useTheme();

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1);
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[{ flex: 1, alignItems: "center", margin: 8 }, animatedStyle]}
    >
      <PlatformPressable
        href={href}
        onPress={onPress}
        onLongPress={onLongPress}
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Icon color={isFocused ? "#E71066" : theme.accent4.val} size={18} />
        <Text
          style={{
            color: isFocused ? "#E71066" : theme.accent1.val,
            fontSize: 12,
            fontWeight: isFocused ? "600" : "400",
          }}
        >
          {label}
        </Text>
      </PlatformPressable>
    </Animated.View>
  );
}
