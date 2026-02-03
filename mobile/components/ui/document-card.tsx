import { Card, XStack, YStack, Text, Button, Checkbox } from "tamagui";
import {
  FileText,
  File as FileIcon,
  Download,
  Eye,
  Check as CheckIcon,
} from "@tamagui/lucide-icons";
import { Document } from "@/types/types";
import { formatFileSize } from "@/libs/utils";
import { File, Directory, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { memo } from "react";

interface DocumentCardProps {
  document: Document;
  isSelectionMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onLongPress: (id: string) => void;
}

const downloadsFolder = new Directory(Paths.document, "downloads");

export async function downloadAndOpenFile(url: string, fileName: string) {
  if (!downloadsFolder.exists) {
    downloadsFolder.create();
  }
  const file = new File(downloadsFolder, fileName);
  if (!file.exists) {
    await File.downloadFileAsync(url, file);
  }
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device");
  }
  await Sharing.shareAsync(file.uri);
}

const DocumentCard = memo(
  ({
    document,
    isSelectionMode,
    isSelected,
    onSelect,
    onLongPress,
  }: DocumentCardProps) => {
    const [isDownloaded, setIsDownloaded] = useState(false);

    useEffect(() => {
      const checkFile = async () => {
        const file = new File(downloadsFolder, document.title);
        setIsDownloaded(file.exists);
      };
      checkFile();
    }, [document.title]);

    const getVectorizedColor = () => {
      if (document.isVectorized === "COMPLETED") return "$green5";
      if (document.isVectorized === "PENDING") return "$yellow5";
      return "$gray5";
    };

    const getFileIcon = (fileType: string) => {
      if (fileType.includes("pdf"))
        return <AntDesign name="file-pdf" size={24} color="#FF0000" />;
      if (fileType.includes("word") || fileType.includes("document"))
        return <FileText color="#0072C6" />;
      if (fileType.includes("powerpoint") || fileType.includes("presentation"))
        return (
          <MaterialCommunityIcons
            name="microsoft-powerpoint"
            size={24}
            color="#FF6F61"
          />
        );
      if (fileType.includes("text")) return <FileText color="#8E8E93" />;
      return <FileIcon />;
    };

    return (
      <Pressable
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onLongPress(document.id);
        }}
        onPress={() => {
          isSelectionMode ? onSelect(document.id) : undefined;
        }}
      >
        <Card elevate size="$3" bordered scale={isSelected ? 0.95 : 1}>
          <Card.Header>
            <YStack
              justify="space-between"
              items="flex-start"
              overflow="hidden"
            >
              <XStack
                gap="$3"
                items="center"
                width="100%"
                justify="space-between"
              >
                <XStack gap="$3" items="center" flex={1}>
                  {isSelectionMode ? (
                    <Checkbox
                      size="$4"
                      checked={isSelected}
                      onCheckedChange={() => onSelect(document.id)}
                      borderWidth={2}
                      borderColor={isSelected ? "#E71066" : "unset"}
                    >
                      <Checkbox.Indicator>
                        <CheckIcon color="#E71066" fontSize={32} />
                      </Checkbox.Indicator>
                    </Checkbox>
                  ) : (
                    getFileIcon(document.fileType)
                  )}
                  <YStack flex={1}>
                    <Text
                      fontWeight="600"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {document.title}
                    </Text>
                    <Text fontSize="$2">
                      {formatFileSize(parseInt(document.fileSize))} •
                      {new Date(document.createdAt).toLocaleDateString()}
                    </Text>
                  </YStack>
                </XStack>

                <Text
                  fontSize="$1"
                  bg={getVectorizedColor() as any}
                  px="$2"
                  py="$1"
                  rounded="$1"
                >
                  {document.isVectorized?.toLowerCase() || "pending"}
                </Text>
              </XStack>
            </YStack>
          </Card.Header>

          <Card.Footer px="$3" pb="$2">
            <XStack flex={1} justify="space-between">
              <Button
                icon={isDownloaded ? Eye : Download}
                size="$3"
                variant="outlined"
                width={100}
                onPress={async () => {
                  if (isSelectionMode) return;
                  await downloadAndOpenFile(document.fileUrl, document.title);
                  setIsDownloaded(true);
                }}
              >
                Open
              </Button>
            </XStack>
          </Card.Footer>

          <Card.Background>
            <YStack bg="$background06" fullscreen />
          </Card.Background>
        </Card>
      </Pressable>
    );
  }
);

export default DocumentCard;
