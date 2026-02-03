import { createDrawerNavigator } from "@react-navigation/drawer";
import { ActivityIndicator, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, useTheme, XStack, YStack } from "tamagui";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CourseCard } from "@/components/ui/course-card";
import { Course } from "@/types/types";
import { useCallback, useMemo, useRef } from "react";
import { useGetCoursesInfiniteQuery } from "@/services/course.api";
import CreateCourseDialog, {
  CreateCourseDialogHandle,
} from "./create-course-dialog";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { EmptyState } from "@/components/ui/empty";
import { DataStateHandler } from "@/components/ui/data-state-handler";

const Drawer = createDrawerNavigator();

function CourseScreen() {
  const navigation = useNavigation<any>();
  const dialogRef = useRef<CreateCourseDialogHandle>(null);
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack mt="$4" height={30}>
        <XStack
          pointerEvents="box-none"
          justify="space-between"
          px="$4"
          position="absolute"
          t={0}
          l={0}
          r={0}
          z={1000}
        >
          <MaterialCommunityIcons
            name="menu-open"
            size={24}
            color={theme.accent1.val}
            onPress={() => navigation.openDrawer()}
          />
          <Text
            fontSize={16}
            overflow="hidden"
            numberOfLines={1}
            width="75%"
            text="center"
          >
            Courses
          </Text>
          <CreateCourseDialog ref={dialogRef} />
        </XStack>
      </YStack>
      <CoursesGrid dialogRef={dialogRef} />
    </SafeAreaView>
  );
}

const CARD_COLORS = [
  "#E1338A",
  "#006450",
  "#8C67AC",
  "#1E3264",
  "#B49BC8",
  "#477D95",
  "#8D6F00",
];

function CoursesGrid({
  dialogRef,
}: {
  dialogRef: React.RefObject<CreateCourseDialogHandle | null>;
}) {
  const { isOffline, refetchNetworkStatus } = useNetworkStatus();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    error,
    isError,
  } = useGetCoursesInfiniteQuery({
    limit: 50,
    order: "desc",
  });

  const courses: Course[] = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  );

  const handleRefresh = useCallback(async () => {
    const networkState = await refetchNetworkStatus();
    if (networkState.isConnected && networkState.isInternetReachable) {
      refetch();
    }
  }, [refetch, refetchNetworkStatus]);

  // Custom empty state handler for courses
  const renderCustomEmptyState = () => {
    const theme = useTheme();
    return (
      <EmptyState
        variant="default"
        title="No courses yet"
        description="Create your first course to get started"
        actionLabel="Create Course"
        onAction={() => {
          dialogRef.current?.present();
          console.log("Create course clicked");
        }}
        icon={
          <MaterialCommunityIcons
            name="book-education-outline"
            size={48}
            color={theme.accent1.val}
          />
        }
        fullScreen
      />
    );
  };

  const shouldShowEmpty =
    !isLoading && !isFetchingNextPage && courses.length === 0;

  return (
    <>
      <DataStateHandler
        isLoading={isLoading}
        isError={isError}
        error={error}
        isOffline={isOffline}
        isEmpty={false}
        onRetry={() => refetch()}
        onRefresh={handleRefresh}
      >
        <FlatList
          data={courses}
          onRefresh={handleRefresh}
          refreshing={isLoading}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 8,
          }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
          renderItem={({ item, index }) => (
            <CourseCard
              course={item}
              backgroundColor={CARD_COLORS[index % CARD_COLORS.length]}
            />
          )}
          onEndReached={fetchNextPage}
          onEndReachedThreshold={0.6}
          ListFooterComponent={
            isFetchingNextPage ? (
              <YStack py="$4" items="center">
                <ActivityIndicator />
              </YStack>
            ) : null
          }
          ListEmptyComponent={shouldShowEmpty ? renderCustomEmptyState : null}
        />
      </DataStateHandler>
    </>
  );
}

export default function Courses() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            swipeEnabled: false,
            drawerType: "slide",
            drawerContentContainerStyle: {
              flex: 1,
              backgroundColor: "white",
              borderRadius: 0,
            },
          }}
          drawerContent={() => (
            <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
              <Text>Course sidebar</Text>
            </SafeAreaView>
          )}
        >
          <Drawer.Screen name="ChatScreen" component={CourseScreen} />
        </Drawer.Navigator>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
