import {
  YStack,
  XStack,
  TextArea,
  Button,
  Text,
  ScrollView,
  Sheet,
} from "tamagui";
import { Image, Pressable } from "react-native";
import { Send, X } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

type Attachment = {
  id: string;
  uri: string;
  type: "image" | "file";
};

export function PromptInput({
  onSubmit,
}: {
  onSubmit: (text: string, files: Attachment[]) => void;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [open, setOpen] = useState(false);

  async function addImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setFiles((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          uri: result.assets[0].uri,
          type: "image",
        },
      ]);
    }

    setOpen(false);
  }

  function submit() {
    if (!text.trim() && files.length === 0) return;
    onSubmit(text, files);
    setText("");
    setFiles([]);
  }

  return (
    <YStack
      px="$3"
      py="$2"
      gap="$3"
      borderTopWidth={1}
      borderColor="$borderColor"
      bg="$background"
      rounded="$6"
      mx={4}
    >
      {/* Attachments */}
      {files.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2">
            {files.map((f) => (
              <YStack key={f.id} position="relative">
                <Image
                  source={{ uri: f.uri }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                  }}
                />
                <Pressable
                  onPress={() =>
                    setFiles((prev) => prev.filter((x) => x.id !== f.id))
                  }
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    backgroundColor: "#000",
                    borderRadius: 10,
                    padding: 2,
                  }}
                >
                  <X size={12} color="white" />
                </Pressable>
              </YStack>
            ))}
          </XStack>
        </ScrollView>
      )}

      {/* Input Row */}
      <YStack>
        <TextArea
          numberOfLines={6}
          maxLength={2000}
          value={text}
          onChangeText={setText}
          placeholder="Ask anything…"
          unstyled
        />
        <XStack items="flex-end" justify="flex-end" gap="$2">
          <Button
            size="$2"
            circular
            disabled={!text.trim() && files.length === 0}
            onPress={submit}
          >
            <Send size={16} />
          </Button>
        </XStack>
      </YStack>

      {/* Attachment Sheet */}
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[25]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame paddingBlock="$4" paddingInline="$4" gap="$3">
          <Text fontWeight="600">Add attachment</Text>
          <Button onPress={addImage}>Choose image</Button>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
