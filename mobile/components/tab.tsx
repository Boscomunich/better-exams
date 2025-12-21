import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { Home, PenSquare, History, User } from "@tamagui/lucide-icons";
import TabBarButton from "./tab-button";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

export default function TabBar({ state, descriptors, navigation }) {
  const { buildHref } = useLinkBuilder();
  const theme = useTheme();

  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });
  const buttonWidth = dimensions.width / state.routes.length;

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  const icons = {
    index: Home,
    test: PenSquare,
    history: History,
    profile: User,
  };

  // Determine if dark mode is active
  const isDark = theme.dark;

  // Light mode remains unchanged
  const overlayColor = isDark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.25)";
  const specularColor = isDark
    ? "rgba(255,255,255,0.05)"
    : "rgba(255,255,255,0.15)";
  const blurTint = isDark ? "dark" : "light";

  return (
    <View onLayout={onTabbarLayout} style={styles.tabbarContainer}>
      <BlurView intensity={20} tint={blurTint} style={styles.glassFilter} />
      <View style={[styles.glassOverlay, { backgroundColor: overlayColor }]} />
      <View
        style={[styles.glassSpecular, { backgroundColor: specularColor }]}
      />

      <Animated.View
        style={[
          animatedStyle,
          {
            position: "absolute",
            height: dimensions.height - 5,
            width: buttonWidth - 20,
            marginHorizontal: 10,
            borderRadius: 12,
            overflow: "hidden",
          },
        ]}
      >
        {/* Slider blur */}
        <BlurView intensity={50} tint={blurTint} style={{ flex: 1 }} />

        {/* Slider specular */}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: 12,
            backgroundColor: specularColor,
            shadowColor: isDark ? "#000" : "#fff",
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
          }}
        />
      </Animated.View>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, {
            duration: 500,
          });

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        const Icon = icons[route.name] || Home;

        return (
          <TabBarButton
            key={route.name}
            label={label}
            Icon={Icon}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            href={buildHref(route.name, route.params)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbarContainer: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  glassFilter: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  glassSpecular: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
});
