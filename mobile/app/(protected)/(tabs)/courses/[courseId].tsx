import { EmptyState } from "@/components/ui/empty";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useGetCourseByIdQuery } from "@/services/course.api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  H4,
  ScrollView,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FileText, File, EllipsisVertical } from "@tamagui/lucide-icons";
import { Document } from "@/types/types";
import { RefreshControl } from "react-native";
import { Popover, Paragraph } from "tamagui";
import { useRemoveDocumentsFromcourseMutation } from "@/services/document.api";
import { LoadingButton } from "@/components/ui/loading-button";
import { useAppToast } from "@/app/CurrentToast";
import { DocumentsDialog } from "./_add-existing-files";

export default function CourseDetail() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const { data, isLoading, isError, refetch, isFetching } =
    useGetCourseByIdQuery(courseId as string);
  const { isOffline, refetchNetworkStatus } = useNetworkStatus();

  const handleRefresh = useCallback(async () => {
    const networkState = await refetchNetworkStatus();
    if (networkState.isConnected && networkState.isInternetReachable) {
      refetch();
    }
  }, [refetch, refetchNetworkStatus]);

  if (isOffline) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <EmptyState
          variant="offline"
          fullScreen
          showRefresh
          onRefresh={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} justify="center" items="center">
          <Spinner size="large" />
        </YStack>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <EmptyState
          variant="error"
          title="Unable to load course"
          description="Please try again"
          showRefresh
          onRefresh={refetch}
          fullScreen
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            tintColor="#6B1301"
            colors={["#6B1301"]}
          />
        }
      >
        <View width="100%" height={150} bg="#6B1301" p="$6">
          <Text color="white" fontSize={32} fontWeight="$12">
            {data?.title}
          </Text>
          <Text color="white" fontSize={16}>
            {data.description}
          </Text>
          <Text fontSize="$2" color="white">
            {new Date(data.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        <YStack mt="$6">
          <Text fontWeight="900" fontSize={16} ml="$3" mb="$2">
            Course Files
          </Text>

          {data.documents.length > 0 ? (
            data.documents.map((document, index) => (
              <FileCard
                document={document}
                courseId={courseId as string}
                key={index}
              />
            ))
          ) : (
            <EmptyState
              title="No files yet"
              description="Upload your first document to this course"
              actionLabel="Upload files"
              onAction={() => {
                router.navigate(`/upload?courseId=${data.id}`);
              }}
            />
          )}
        </YStack>
        <YStack gap="$3" mx="$3" mt="$6">
          <DocumentsDialog courseId={courseId as string} />
          <Button onPress={() => router.navigate(`/chat?courseId=${data.id}`)}>
            Start Learning with AI
          </Button>
          <Button
            bg="$blue9"
            color="white"
            onPress={() => router.push(`/exams/form?courseId=${data.id}`)}
          >
            Generate Practice Exam
          </Button>
        </YStack>
      </ScrollView>
      <Button
        bg="white"
        position="absolute"
        b={8}
        r={8}
        p="$2"
        size="$4"
        rounded={12}
        onPress={() => router.navigate(`/upload?courseId=${data.id}`)}
      >
        <AntDesign name="plus-circle" size={24} color="black" />
      </Button>
    </SafeAreaView>
  );
}

function FileCard({
  document,
  courseId,
}: {
  document: Document;
  courseId: string;
}) {
  const [removeDocuments, { isLoading, isError, error }] =
    useRemoveDocumentsFromcourseMutation();

  const toast = useAppToast();

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
    return <File />;
  };

  async function handleRemove() {
    const response = await removeDocuments({
      courseId,
      documentIds: [document.id],
    }).unwrap();
    if (response.message) {
      toast.show({
        title: response.message,
        preset: "success",
      });
    }
  }

  return (
    <XStack mx="$3" my="$1" justify="space-between">
      <XStack gap="$2" items="center">
        {getFileIcon(document.fileType)}
        <Text fontWeight="600" numberOfLines={1} ellipsizeMode="tail">
          {document.title}
        </Text>
      </XStack>
      <Popover size="$5" allowFlip placement="top-end">
        <Popover.Trigger asChild>
          <Button icon={EllipsisVertical} circular chromeless />
        </Popover.Trigger>

        <Popover.Content
          borderWidth={1}
          borderColor="$borderColor"
          enterStyle={{ y: -10, opacity: 0 }}
          exitStyle={{ y: -10, opacity: 0 }}
          elevate
          animation={[
            "quickest",
            {
              opacity: { overshootClamping: true },
            },
          ]}
        >
          <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
          <YStack gap="$3">
            <Paragraph size="$2">File Actions</Paragraph>
            <LoadingButton
              width={100}
              theme="red"
              loading={isLoading}
              disabled={isLoading}
              onPress={async () => await handleRemove()}
            >
              Remove
            </LoadingButton>
          </YStack>
        </Popover.Content>
      </Popover>
    </XStack>
  );
}
