import { useCallback, useMemo, useState } from "react";
import { FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text, Button, XStack, View, useTheme } from "tamagui";
import {
  useDeleDocumentMutation,
  useGetDocumentsInfiniteQuery,
} from "@/services/document.api";
import DocumentCard from "@/components/ui/document-card";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useAppToast } from "@/app/CurrentToast";
import { DataStateHandler } from "@/components/ui/data-state-handler";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { EmptyState } from "@/components/ui/empty";
import { formatCount } from "@/utils";
import { Spinner } from "tamagui";

export default function Library() {
  const router = useRouter();
  const { isOffline, refetchNetworkStatus } = useNetworkStatus();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isSelectionMode = selectedIds.size > 0;
  const theme = useTheme();

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isError,
  } = useGetDocumentsInfiniteQuery({ limit: 50 });

  const documents = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const [deleteDocument, { isLoading: isLoadingDelete }] =
    useDeleDocumentMutation();
  const toast = useAppToast();

  const handleRefresh = useCallback(async () => {
    const networkState = await refetchNetworkStatus();
    if (networkState.isConnected) {
      refetch();
    }
  }, [refetch, refetchNetworkStatus]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleLongPress = useCallback((id: string) => {
    setSelectedIds(new Set([id]));
  }, []);

  const handleDelete = async () => {
    const idsOnly = Array.from(selectedIds);
    const response = await deleteDocument({
      ids: idsOnly,
    }).unwrap();

    if (response.message) {
      toast.show({
        title: response.message,
        preset: "success",
      });
    }
    setSelectedIds(new Set());
  };

  const shouldShowEmpty = !isLoading && documents.length === 0;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <YStack height={60}>
        <XStack
          justify="space-between"
          items="center"
          px="$4"
          flex={1}
          bg="$background"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          {isSelectionMode ? (
            <>
              <AntDesign
                name="close"
                color={theme.accent1.val}
                size={24}
                onPress={() => setSelectedIds(new Set())}
              />
              <Text fontSize={16} fontWeight="600">
                {selectedIds.size} Selected
              </Text>
              <View>
                {isLoadingDelete ? (
                  <Spinner color="red" />
                ) : (
                  <MaterialCommunityIcons
                    name="delete"
                    size={24}
                    color="red"
                    onPress={handleDelete}
                  />
                )}
              </View>
            </>
          ) : (
            <>
              <Text fontSize={16} fontWeight="600" numberOfLines={1} maxW={80}>
                {formatCount(data?.pages[0]?.meta?.totalCount ?? 0)} Files
              </Text>

              <Text fontSize={16} fontWeight="600">
                Library
              </Text>
              <AntDesign
                name="plus-circle"
                size={24}
                color={theme.accent1.val}
                onPress={() => router.push("/upload")}
              />
            </>
          )}
        </XStack>
      </YStack>

      <DataStateHandler
        isLoading={isLoading}
        isError={isError}
        error={error}
        isOffline={isOffline}
        isEmpty={false}
        onRetry={refetch}
        onRefresh={handleRefresh}
      >
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <YStack px="$2" py="$2">
              <DocumentCard
                document={item}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.has(item.id)}
                onSelect={toggleSelection}
                onLongPress={handleLongPress}
              />
            </YStack>
          )}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          onRefresh={handleRefresh}
          refreshing={isLoading}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          ListEmptyComponent={
            shouldShowEmpty ? (
              <EmptyState
                title="No documents found"
                description="Upload your first document to see it here"
                actionLabel="Upload Now"
                onAction={() => router.push("/upload")}
              />
            ) : null
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <YStack p="$4">
                <ActivityIndicator />
              </YStack>
            ) : null
          }
        />
      </DataStateHandler>
    </SafeAreaView>
  );
}
