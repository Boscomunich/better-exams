import { SafeAreaView } from "react-native-safe-area-context";
import {
  YStack,
  H5,
  XStack,
  SizableText,
  View,
  Paragraph,
  Avatar,
  Text,
  Button,
} from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "tamagui";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { authClient } from "@/libs/better-auth-client";

export default function Profile() {
  const theme = useTheme();
  const overview = [
    {
      title: "1hr 36min",
      icon: <MaterialCommunityIcons name="clock" size={26} color="#243abf" />,
      text: "Study Time",
    },
    {
      title: "4 days",
      icon: (
        <MaterialIcons name="local-fire-department" size={26} color="#e8840f" />
      ),
      text: "Streak",
    },
    {
      title: "26",
      icon: <MaterialIcons name="library-books" size={26} color="#0fe82e" />,
      text: "Courses",
    },
  ];
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} gap="$3" paddingBlockStart={36} paddingInline={12}>
        <View
          style={{ backgroundColor: theme.background08.val as string }}
          paddingBlock={12}
          rounded={8}
        >
          <XStack justify="flex-end" paddingInlineEnd={24}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={theme.accentColor.val}
            />
          </XStack>

          <YStack
            justify="center"
            paddingBlockStart={24}
            items="center"
            gap={8}
            marginBlockEnd={12}
            borderBlockStyle="solid"
          >
            <Avatar circular size="$6">
              <Avatar.Image src="http://picsum.photos/200/300" />
              <Avatar.Fallback />
            </Avatar>

            <H5 textTransform="capitalize">Chidera Solomon</H5>
            <SizableText textTransform="capitalize">premium member</SizableText>
            <SizableText textTransform="capitalize">
              joined Aug 5, 2025
            </SizableText>

            <Button fontSize={16} color="#E71066" width={100} paddingInline={2}>
              premium
            </Button>
          </YStack>
        </View>
        <XStack
          justify="space-evenly"
          gap="$-4"
          paddingBlock={8}
          style={{ backgroundColor: theme.background08.val as string }}
          rounded={8}
        >
          {overview.map((item, index) => (
            <View
              flexDirection="column"
              justify="center"
              items="center"
              key={index}
            >
              {item.icon}
              <Text fontSize={16} fontWeight={700}>
                {item.title}
              </Text>
              <Paragraph>{item.text}</Paragraph>
            </View>
          ))}
        </XStack>

        <Button
          fontSize={16}
          color="#E71066"
          width={100}
          px={2}
          onPress={async () => await authClient.signOut()}
        >
          Log Out
        </Button>
      </YStack>
    </SafeAreaView>
  );
}
