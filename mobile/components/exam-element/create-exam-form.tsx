import React, { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { YStack, XStack, Text, Input, Checkbox, View, useTheme } from "tamagui";
import {
  CreateExamFormData,
  createExamSchema,
  Difficulty,
  ExamType,
} from "@/types/exams";
import { Check as CheckIcon, ChevronDown } from "@tamagui/lucide-icons";
import { Dropdown } from "react-native-element-dropdown";
import { ExamStructurePreview } from "./examstructure-preview";
import { useCreateExamMutation } from "@/services/exams.api";
import { LoadingButton } from "../ui/loading-button";

export default function CreateExamForm({ courseId }: { courseId: string }) {
  const theme = useTheme();
  const { control, watch, setValue } = useForm<CreateExamFormData>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      title: "",
      type: [],
      courseId: courseId,
    },
  });

  useEffect(() => {
    if (courseId) {
      setValue("courseId", courseId);
    }
  }, [courseId, setValue]);

  const [createExam, { isLoading, isError }] = useCreateExamMutation();

  async function onSubmit() {
    try {
      const response = await createExam(values).unwrap();
      console.log(response);
    } catch (e) {
      // Error handled by mutation state
    }
  }

  const values = watch();

  const preview = useMemo(() => {
    if (
      !values.title ||
      values.type.length === 0 ||
      !values.duration ||
      !values.numberOfQuestions
    )
      return null;

    return {
      title: values.title,
      duration: values.duration,
      difficulty: values.difficulty,
      totalQuestions: values.numberOfQuestions,
      passScore: values.passScore,
      types: values.type,
    };
  }, [values]);

  return (
    <View mx="$3">
      <YStack gap="$4">
        <Text fontSize="$7" fontWeight="700" text="center">
          Create New Exam
        </Text>

        {/* Title */}
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Input
              size="$5"
              placeholder="Exam title"
              value={field.value}
              onChangeText={field.onChange}
              rounded={6}
              bg={theme.backgroundHover.val as any}
              borderColor={theme.shadow4.val as any}
              focusStyle={{
                borderColor: "#E71066",
              }}
            />
          )}
        />

        {/* Exam Types */}
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <YStack gap="$2">
              <Text fontWeight="600">Exam Type</Text>
              {Object.values(ExamType).map((type) => (
                <XStack key={type} gap="$2" items="center">
                  <Checkbox
                    checked={field.value.includes(type)}
                    onCheckedChange={() => {
                      field.onChange(
                        field.value.includes(type)
                          ? field.value.filter((t) => t !== type)
                          : [...field.value, type],
                      );
                    }}
                    borderColor={
                      field.value.includes(type)
                        ? "#E71066"
                        : (theme.shadow4.val as any)
                    }
                    bg={theme.backgroundHover.val as any}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon color="#E71066" fontSize={32} />
                    </Checkbox.Indicator>
                  </Checkbox>
                  <Text>{type}</Text>
                </XStack>
              ))}
            </YStack>
          )}
        />

        {/* Difficulty */}
        <Controller
          control={control}
          name="difficulty"
          render={({ field }) => (
            <Dropdown
              style={{
                height: 52, // Matches Tamagui size $5 approx
                borderWidth: 1,
                borderColor: theme.shadow4.val as string,
                borderRadius: 6,
                paddingHorizontal: 12,
                backgroundColor: theme.backgroundHover.val as string,
              }}
              placeholderStyle={{ color: theme.accent11.val, fontSize: 16 }}
              selectedTextStyle={{
                color: theme.color.val as string,
                fontSize: 16,
              }}
              containerStyle={{
                borderRadius: 8,
                marginTop: 5,
                backgroundColor: theme.background.val as string,
              }}
              itemTextStyle={{ color: theme.color.val as string }}
              activeColor="#E71066" // Light pink tint for selected item
              data={Object.values(Difficulty).map((d) => ({
                label: d,
                value: d,
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select difficulty"
              value={field.value}
              onChange={(item) => field.onChange(item.value)}
              // Custom icon to match your previous Chevron
              renderRightIcon={() => (
                <ChevronDown color={theme.accent11.val as any} />
              )}
              // Replicates Tamagui's focusStyle
              onFocus={() => {}}
              onBlur={() => {}}
            />
          )}
        />

        {/* Duration */}
        <Controller
          control={control}
          name="duration"
          render={({ field }) => (
            <Input
              bg={theme.backgroundHover.val as any}
              height="$5"
              keyboardType="numeric"
              borderColor={theme.shadow4.val as any}
              placeholder="Duration (minutes)"
              value={field.value?.toString() ?? ""}
              rounded={6}
              onChangeText={(v) => field.onChange(v ? Number(v) : undefined)}
              focusStyle={{
                borderColor: "#E71066",
              }}
            />
          )}
        />

        {/* Number of Questions */}
        <Controller
          control={control}
          name="numberOfQuestions"
          render={({ field }) => (
            <Input
              bg={theme.backgroundHover.val as any}
              height="$5"
              rounded={6}
              borderColor={theme.shadow4.val as any}
              keyboardType="numeric"
              placeholder="Number of questions"
              value={field.value?.toString() ?? ""}
              onChangeText={(v) => field.onChange(v ? Number(v) : undefined)}
              focusStyle={{
                borderColor: "#E71066",
              }}
            />
          )}
        />

        {/* Pass Score */}
        <Controller
          control={control}
          name="passScore"
          render={({ field }) => (
            <Input
              bg={theme.backgroundHover.val as any}
              borderColor={theme.shadow4.val as any}
              height="$5"
              rounded={6}
              keyboardType="numeric"
              placeholder="Pass score (%)"
              value={field.value?.toString() ?? ""}
              onChangeText={(v) => field.onChange(v ? Number(v) : undefined)}
              focusStyle={{
                borderColor: "#E71066",
              }}
            />
          )}
        />

        {/* ===== Exam Structure Preview ===== */}
        {preview && <ExamStructurePreview structure={preview} />}

        {/* Submit */}
        <LoadingButton
          onPress={onSubmit}
          disabled={isLoading}
          spinnerColor={"#E71066" as any}
        >
          Create Exam
        </LoadingButton>
      </YStack>
    </View>
  );
}
