import { forwardRef, useImperativeHandle, useRef, useMemo } from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { YStack, XStack, Text, Input, Button, Fieldset, Label } from "tamagui";
import { z } from "zod";
import { X } from "@tamagui/lucide-icons";

const studyGoalSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),

  type: z.enum([
    "COURSE_MASTERY",
    "TOPIC_MASTERY",
    "STUDY_TIME",
    "PRACTICE_COUNT",
    "EXAM_PREP",
    "CONSISTENCY",
  ]),

  targetValue: z.number().optional(),
  unit: z.string().optional(),
  topic: z.string().optional(),
  targetDate: z.date().optional(),
  startDate: z.date().optional(),
  isRecurring: z.boolean().default(false),
});

type StudyGoalFormData = z.infer<typeof studyGoalSchema>;

export interface CreateStudyGoalDialogHandle {
  present: () => void;
  dismiss: () => void;
}

export const CreateStudyGoalDialog = forwardRef<CreateStudyGoalDialogHandle>(
  (_, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["90%"], []);

    const { control, handleSubmit, watch, reset } = useForm<StudyGoalFormData>({
      resolver: zodResolver(studyGoalSchema),
      defaultValues: { type: "STUDY_TIME", isRecurring: false },
    });

    const goalType = watch("type");

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const onSubmit = (data: StudyGoalFormData) => {
      console.log("Submitted goal:", data);
      sheetRef.current?.dismiss();
      reset();
    };

    const renderBackdrop = (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: "white", borderRadius: 24 }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <YStack p="$5" gap="$3" flex={1}>
            <XStack justify="space-between" items="center">
              <Text fontSize="$8" fontWeight="700">
                Add Study Goal
              </Text>
              <Button
                circular
                icon={X}
                onPress={() => sheetRef.current?.dismiss()}
              />
            </XStack>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Title */}
              <Fieldset>
                <Label>Title</Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Goal title" {...field} />
                  )}
                />
              </Fieldset>

              {/* Description */}
              <Fieldset>
                <Label>Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Optional" {...field} />
                  )}
                />
              </Fieldset>

              {/* Type selector */}
              <Fieldset>
                <Label>Goal Type</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <XStack gap="$2" flexWrap="wrap">
                      {[
                        "COURSE_MASTERY",
                        "TOPIC_MASTERY",
                        "STUDY_TIME",
                        "PRACTICE_COUNT",
                        "EXAM_PREP",
                        "CONSISTENCY",
                      ].map((t) => (
                        <Button
                          key={t}
                          theme={field.value === t ? "active" : "gray"}
                          onPress={() => field.onChange(t)}
                        >
                          {t.replace("_", " ")}
                        </Button>
                      ))}
                    </XStack>
                  )}
                />
              </Fieldset>

              {/* Conditional fields */}
              {(goalType === "STUDY_TIME" ||
                goalType === "PRACTICE_COUNT" ||
                goalType === "COURSE_MASTERY" ||
                goalType === "TOPIC_MASTERY") && (
                <XStack gap="$2">
                  <Controller
                    name="targetValue"
                    control={control}
                    render={({ field }) => (
                      <Input
                        keyboardType="numeric"
                        placeholder="Target"
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder={
                          goalType === "STUDY_TIME"
                            ? "hours"
                            : goalType === "PRACTICE_COUNT"
                            ? "questions"
                            : "%"
                        }
                        {...field}
                      />
                    )}
                  />
                </XStack>
              )}

              {goalType === "EXAM_PREP" && (
                <Controller
                  name="targetDate"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Target date" {...field} />
                  )}
                />
              )}

              {goalType === "CONSISTENCY" && (
                <Controller
                  name="targetValue"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Days per week" {...field} />
                  )}
                />
              )}

              <Button type="submit">Save Goal</Button>
            </form>
          </YStack>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
