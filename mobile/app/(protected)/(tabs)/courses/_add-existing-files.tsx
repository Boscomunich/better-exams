import { LoadingButton } from "@/components/ui/loading-button";
import { useAppSelector } from "@/libs/store";
import {
  useAddDocumentsTocourseMutation,
  useGetDocumentsInfiniteQuery,
} from "@/services/document.api";
import { Document } from "@/types/types";
import { X } from "@tamagui/lucide-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList } from "react-native";
import { Text, YStack } from "tamagui";
import { Button, Dialog, Unspaced, View, XStack } from "tamagui";
import Feather from "@expo/vector-icons/Feather";

export function DocumentsDialog({ courseId }: { courseId: string }) {
  return (
    <View gap="$4" justify="center" items="center">
      <DialogInstance courseId={courseId} />
    </View>
  );
}

function DialogInstance({ courseId }: { courseId: string }) {
  return (
    <Dialog modal>
      <Dialog.Trigger asChild>
        <Button width="100%">Add Documents</Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          bg="$shadow6"
          animateOnly={["transform", "opacity"]}
          animation={[
            "quickest",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.FocusScope focusOnIdle>
          <Dialog.Content
            bordered
            py="$4"
            px="$6"
            elevate
            width="95%"
            height={600}
            rounded="$6"
            key="content"
            animateOnly={["transform", "opacity"]}
            animation={[
              "quickest",
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: 20, opacity: 0 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            gap="$4"
          >
            <MultiSelectDocumentsDemo courseId={courseId} />

            <Unspaced>
              <Dialog.Close asChild>
                <Button
                  position="absolute"
                  r="$3"
                  t="$3"
                  size="$2"
                  circular
                  icon={X}
                />
              </Dialog.Close>
            </Unspaced>
          </Dialog.Content>
        </Dialog.FocusScope>
      </Dialog.Portal>
    </Dialog>
  );
}

function MultiSelectDocumentsDemo({ courseId }: { courseId: string }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { data } = useGetDocumentsInfiniteQuery({
    limit: 50,
  });

  const [addDocuments, { isLoading, isError, error }] =
    useAddDocumentsTocourseMutation();

  const documents = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    // Convert Set<string> to string[]
    const idsOnly = Array.from(selectedIds);
    const response = await addDocuments({
      courseId,
      documentIds: idsOnly,
    }).unwrap();
  }, [selectedIds]);

  const renderItem = useCallback(
    ({ item }: { item: Document }) => {
      const isSelected = selectedIds.has(item.id);

      return (
        <XStack
          pressStyle={{ opacity: 0.7 }}
          onPress={() => toggleSelection(item.id)}
          items="center"
          justify="space-between"
          p="$3"
          rounded="$3"
          bg={isSelected ? "$green2" : "transparent"}
        >
          <Text
            flex={1}
            numberOfLines={1}
            fontSize="$2"
            fontWeight={isSelected ? "600" : "400"}
          >
            {item.title}
          </Text>

          <Feather
            name={isSelected ? "check-circle" : "circle"}
            size={12}
            color={isSelected ? "#2e7d32" : "#9e9e9e"}
          />
        </XStack>
      );
    },
    [selectedIds, toggleSelection]
  );

  return (
    <YStack flex={1} gap="$4" width="100%">
      <Text fontSize="$3" fontWeight="600">
        add Documents documents to chat context
      </Text>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <YStack height={1} bg="$borderColor" />}
      />

      <LoadingButton
        loading={isLoading}
        spinnerColor="$color"
        theme="green"
        onPress={() => handleConfirm()}
      >
        Submit
      </LoadingButton>
    </YStack>
  );
}
