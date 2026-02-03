import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, YStack, XStack, Card, View } from "tamagui";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { ScrollView } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LoadingButton } from "@/components/ui/loading-button";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUploadDocumentsMutation } from "@/services/document.api";
import { PickedFile } from "@/types/types";

export default function DocumentUpload() {
  const [files, setFiles] = useState<PickedFile[]>([]);
  const router = useRouter();

  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  console.log(courseId);

  const [uploadDocument, { isLoading, isError, error }] =
    useUploadDocumentsMutation();

  const pickMultipleDocs = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      type: [
        "text/plain",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setFiles(result.assets);
    }
  };

  const removeFile = (uri: string) => {
    setFiles((prev) => prev.filter((f) => f.uri !== uri));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} p="$4" gap="$4">
        <View mt="$4">
          <Text fontSize="$8" fontWeight="700" text="left">
            Document Upload
          </Text>
          <Text fontSize="$4" fontWeight="500" text="left">
            You can upload multiple documents. The combined size must not exceed
            20 MB.
          </Text>
        </View>

        <Button onPress={pickMultipleDocs} flex="unset" justify="flex-start">
          {" "}
          <AntDesign name="plus" size={24} color="black" />
          Add Documents
        </Button>

        {files.length === 0 && <Text opacity={0.6}>No documents selected</Text>}

        <ScrollView>
          <YStack space="$3">
            {files.map((file) => (
              <Card key={file.uri} bordered padding="$3">
                <XStack justify="space-between" items="center">
                  <YStack flex={1}>
                    <Text numberOfLines={1} fontWeight="600">
                      {file.name}
                    </Text>
                    <Text fontSize="$2" opacity={0.6}>
                      {((file.size ?? 0) / 1024) | 0} KB
                    </Text>
                  </YStack>

                  <Button
                    size="$2"
                    bg="$red10"
                    color="white"
                    onPress={() => removeFile(file.uri)}
                  >
                    Remove
                  </Button>
                </XStack>
              </Card>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
      <XStack justify="space-evenly" mb="$4">
        <Button width={100} onPress={() => router.back()}>
          Back
        </Button>
        <LoadingButton
          loading={isLoading}
          spinnerColor="white"
          bg="#E71066"
          color="white"
          width={100}
          onPress={async () => await uploadDocument({ files, courseId })}
        >
          Upload
        </LoadingButton>
      </XStack>
    </SafeAreaView>
  );
}
