import {
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { X } from "@tamagui/lucide-icons";
import {
  Button,
  Fieldset,
  Input,
  Label,
  Paragraph,
  XStack,
  Text,
  YStack,
  Theme,
  Form,
  useTheme,
} from "tamagui";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { LoadingButton } from "@/components/ui/loading-button";
import { useCreateCourseMutation } from "@/services/course.api";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Schema Definition
const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

// 2. Handle Type for External Refs
export interface CreateCourseDialogHandle {
  present: () => void;
  dismiss: () => void;
}

const CreateCourseDialog = forwardRef<CreateCourseDialogHandle, {}>(
  (props, ref) => {
    const internalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["90%"], []);
    const theme = useTheme();

    // Expose methods to parents using the ref
    useImperativeHandle(ref, () => ({
      present: () => internalRef.current?.present(),
      dismiss: () => internalRef.current?.dismiss(),
    }));

    const [createCourse, { isLoading, error }] = useCreateCourseMutation();

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<CourseFormData>({
      resolver: zodResolver(courseSchema),
      defaultValues: {
        title: "",
        description: "",
      },
    });

    const handleClosePress = useCallback(() => {
      internalRef.current?.dismiss();
      reset();
    }, [reset]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    async function onSubmit(data: CourseFormData) {
      try {
        await createCourse(data).unwrap();
        handleClosePress();
      } catch (e) {
        // Error handled by mutation state
      }
    }

    return (
      <YStack>
        {/* Internal Trigger */}
        <AntDesign
          name="plus-circle"
          size={24}
          color={theme.accent1.val}
          onPress={() => internalRef.current?.present()}
        />

        <BottomSheetModal
          ref={internalRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          keyboardBehavior="extend"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backgroundStyle={{
            backgroundColor: theme.color2.val,
            borderRadius: 24,
          }}
          handleIndicatorStyle={{ backgroundColor: "#ccc" }}
        >
          <BottomSheetView style={{ flex: 1 }}>
            <YStack p="$5" gap="$2" flex={1}>
              <XStack justify="space-between" items="center">
                <Text fontSize="$8" fontWeight="700">
                  Create Course
                </Text>
                <Button
                  size="$3"
                  circular
                  icon={X}
                  onPress={handleClosePress}
                  chromeless
                />
              </XStack>

              <Paragraph color="$accent11">
                Fill in the course details to create a new course.
              </Paragraph>

              <Form gap="$2" onSubmit={handleSubmit(onSubmit)}>
                <Fieldset gap="$1">
                  <Label fontWeight="600" htmlFor="title">
                    Title
                  </Label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <YStack>
                        <Input
                          id="title"
                          size="$4"
                          placeholder="Course name"
                          value={value}
                          onChangeText={onChange}
                          borderColor={errors.title ? "$red8" : undefined}
                        />
                        {errors.title && (
                          <Text color="$red10" fontSize={12} mt="$1">
                            {errors.title.message}
                          </Text>
                        )}
                      </YStack>
                    )}
                  />
                </Fieldset>

                <Fieldset gap="$1">
                  <Label fontWeight="600" htmlFor="description">
                    Description
                  </Label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        id="description"
                        size="$4"
                        placeholder="Optional"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </Fieldset>

                {error && (
                  <Text color="$red10" fontSize={14} text="center">
                    {"status" in error
                      ? "Failed to save course"
                      : (error as any).message}
                  </Text>
                )}

                <XStack justify="flex-end" mt="$4">
                  <Form.Trigger asChild>
                    <LoadingButton
                      loading={isLoading}
                      disabled={isLoading}
                      themeInverse
                      fontWeight="700"
                      spinnerColor="white"
                      bg="#E71066"
                      color="white"
                      width={120}
                    >
                      Save Course
                    </LoadingButton>
                  </Form.Trigger>
                </XStack>
              </Form>
            </YStack>
          </BottomSheetView>
        </BottomSheetModal>
      </YStack>
    );
  }
);

export default CreateCourseDialog;
