import { Tabs } from "expo-router";
import { useTheme } from "tamagui";
import {
  Home,
  BookOpen,
  PenSquare,
  History,
  User,
} from "@tamagui/lucide-icons";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.background?.val,
          borderBottomColor: theme.borderColor?.val,
        },
        headerTintColor: theme.color?.val,
        tabBarStyle: {
          backgroundColor: theme.background?.val,
          borderTopColor: theme.borderColor?.val,
          borderTopWidth: 1,
          paddingBottom: 2,
          paddingTop: 2,
          height: 60,
        },
        tabBarActiveTintColor: "#E71066",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 1,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          title: "Exams",
          tabBarIcon: ({ color, size }) => (
            <PenSquare size={size} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <History size={size} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color as any} />
          ),
        }}
      />
    </Tabs>
  );
}
