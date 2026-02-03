// components/ExamStructurePreview.tsx
import React from "react";
import { Card, YStack, XStack, Text, useTheme } from "tamagui";
import { ExamStructurePreview as Preview } from "@/types/exams";

export const ExamStructurePreview: React.FC<{
  structure: Preview;
}> = ({ structure }) => {
  const theme = useTheme();
  return (
    <Card
      bordered
      size="$4"
      bg={theme.backgroundHover.val as any}
      p="$4"
      rounded={6}
    >
      <YStack gap="$3">
        <Text fontSize="$6" fontWeight="700">
          Exam Structure Preview
        </Text>

        <XStack justify="space-between">
          <Text fontWeight={700}>Title</Text>
          <Text>{structure.title}</Text>
        </XStack>

        <XStack justify="space-between">
          <Text fontWeight={700}>Duration</Text>
          <Text>{structure.duration} minutes</Text>
        </XStack>

        {structure.difficulty && (
          <XStack justify="space-between">
            <Text fontWeight={700}>Difficulty</Text>
            <Text>{structure.difficulty}</Text>
          </XStack>
        )}

        <XStack justify="space-between" gap="$2">
          <Text fontWeight={700}>Question Types</Text>

          <XStack flexWrap="wrap" gap="$2">
            {structure.types.map((type) => (
              <Text
                key={type}
                px="$3"
                py="$1"
                fontSize="$2"
                rounded="$4"
                bg="$backgroundHover"
                borderWidth={1}
                borderColor="$shadow4"
              >
                {type}
              </Text>
            ))}
          </XStack>
        </XStack>

        {structure.totalQuestions !== undefined && (
          <XStack justify="space-between">
            <Text fontWeight={700}>Total Questions</Text>
            <Text>{structure.totalQuestions}</Text>
          </XStack>
        )}

        {structure.passScore !== undefined && (
          <XStack justify="space-between">
            <Text fontWeight={700}>Pass Score</Text>
            <Text>{structure.passScore}%</Text>
          </XStack>
        )}
      </YStack>
    </Card>
  );
};
