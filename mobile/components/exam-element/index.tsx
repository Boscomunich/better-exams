import { Question, QuestionType, StudentAnswer } from "@/types/exams";
import React from "react";
import {
  YStack,
  XStack,
  Text,
  Card,
  Checkbox,
  RadioGroup,
  Input,
  TextArea,
  Progress,
} from "tamagui";

// ----------------------------------
// Shared props
// ----------------------------------
interface QuestionProps<T = any> {
  question: Question;
  value?: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

// ----------------------------------
// Question Wrapper (shadcn-like Card)
// ----------------------------------
export const QuestionCard: React.FC<{
  title: string;
  points: number;
  timeLimit?: number;
  timeRemaining?: number;
  children: React.ReactNode;
}> = ({ title, points, timeLimit, timeRemaining, children }) => {
  const progress =
    timeLimit && timeRemaining !== undefined
      ? Math.max(0, (timeRemaining / timeLimit) * 100)
      : undefined;

  return (
    <Card bordered elevate size="$4">
      <YStack gap="$3">
        <XStack justify="space-between" items="center">
          <Text fontSize="$6" fontWeight="700">
            {title}
          </Text>

          <XStack gap="$3" items="center">
            {progress !== undefined && (
              <YStack minW={80}>
                <Text fontSize="$2" opacity={0.6}>
                  Time left
                </Text>
                <Progress value={progress} />
              </YStack>
            )}
            <Text opacity={0.6}>{points} pts</Text>
          </XStack>
        </XStack>

        {children}
      </YStack>
    </Card>
  );
};

// ----------------------------------
// Multiple Choice (Single Select)
// ----------------------------------
export const MultipleChoiceQuestionView: React.FC<QuestionProps<string>> = ({
  question,
  value,
  onChange,
  disabled,
}) => {
  if (question.type !== QuestionType.MULTIPLE_CHOICE) return null;

  return (
    <QuestionCard title={question.text} points={question.points}>
      <RadioGroup value={value} onValueChange={onChange}>
        <YStack gap="$2">
          {question.options.map((opt) => (
            <XStack key={opt.id} items="center" gap="$2">
              <RadioGroup.Item value={opt.id} disabled={disabled} />
              <Text>{opt.text}</Text>
            </XStack>
          ))}
        </YStack>
      </RadioGroup>
    </QuestionCard>
  );
};

// ----------------------------------
// True / False
// ----------------------------------
export const TrueFalseQuestionView: React.FC<QuestionProps<boolean>> = ({
  question,
  value,
  onChange,
  disabled,
}) => {
  if (question.type !== QuestionType.TRUE_FALSE) return null;

  return (
    <QuestionCard title={question.text} points={question.points}>
      <RadioGroup
        value={value === undefined ? undefined : value ? "true" : "false"}
        onValueChange={(v) => onChange(v === "true")}
      >
        <YStack gap="$2">
          <XStack items="center" gap="$2">
            <RadioGroup.Item value="true" disabled={disabled} />
            <Text>True</Text>
          </XStack>
          <XStack items="center" gap="$2">
            <RadioGroup.Item value="false" disabled={disabled} />
            <Text>False</Text>
          </XStack>
        </YStack>
      </RadioGroup>
    </QuestionCard>
  );
};

// ----------------------------------
// Multi Select (Checkboxes)
// ----------------------------------
export const MultiSelectQuestionView: React.FC<QuestionProps<string[]>> = ({
  question,
  value = [],
  onChange,
  disabled,
}) => {
  if (question.type !== QuestionType.MULTI_SELECT) return null;

  const toggle = (id: string) => {
    if (disabled) return;
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  };

  return (
    <QuestionCard title={question.text} points={question.points}>
      <YStack gap="$2">
        {question.options.map((opt) => (
          <XStack key={opt.id} items="center" gap="$2">
            <Checkbox
              checked={value.includes(opt.id)}
              disabled={disabled}
              onCheckedChange={() => toggle(opt.id)}
            />
            <Text>{opt.text}</Text>
          </XStack>
        ))}
      </YStack>
    </QuestionCard>
  );
};

// ----------------------------------
// Short Answer
// ----------------------------------
export const ShortAnswerQuestionView: React.FC<QuestionProps<string>> = ({
  question,
  value,
  onChange,
  disabled,
}) => {
  if (question.type !== QuestionType.SHORT_ANSWER) return null;

  return (
    <QuestionCard title={question.text} points={question.points}>
      <Input
        value={value ?? ""}
        onChangeText={onChange}
        placeholder="Type your answer"
        maxLength={question.maxLength}
        disabled={disabled}
      />
    </QuestionCard>
  );
};

// ----------------------------------
// Essay + Rubric Display
// ----------------------------------
export const EssayQuestionView: React.FC<QuestionProps<string>> = ({
  question,
  value,
  onChange,
  disabled,
}) => {
  if (question.type !== QuestionType.ESSAY) return null;

  return (
    <QuestionCard title={question.prompt} points={question.points}>
      <TextArea
        value={value ?? ""}
        onChangeText={onChange}
        minH={140}
        placeholder="Write your response here"
        disabled={disabled}
      />

      {question.wordLimit && (
        <Text opacity={0.6} fontSize="$2">
          Word limit: {question.wordLimit.min}–{question.wordLimit.max}
        </Text>
      )}

      {question.rubric && (
        <YStack gap="$2" mt="$3">
          <Text fontWeight="700">Rubric</Text>
          {question.rubric.criteria.map((c) => (
            <Card key={c.name} bordered size="$2">
              <YStack gap="$1">
                <XStack justify="space-between">
                  <Text fontWeight="600">{c.name}</Text>
                  <Text opacity={0.6}>{c.maxPoints} pts</Text>
                </XStack>
                <Text fontSize="$2" opacity={0.7}>
                  {c.description}
                </Text>
              </YStack>
            </Card>
          ))}
        </YStack>
      )}
    </QuestionCard>
  );
};

// ----------------------------------
// Question Renderer (Dispatcher)
// ----------------------------------
export const QuestionRenderer: React.FC<{
  question: Question;
  answer?: StudentAnswer;
  onAnswer: (value: any) => void;
  mode?: "active" | "review";
}> = ({ question, answer, onAnswer, mode = "active" }) => {
  const disabled = mode === "review";

  switch (question.type) {
    case QuestionType.MULTIPLE_CHOICE:
      return (
        <MultipleChoiceQuestionView
          question={question}
          value={answer?.value}
          onChange={onAnswer}
          disabled={disabled}
        />
      );
    case QuestionType.TRUE_FALSE:
      return (
        <TrueFalseQuestionView
          question={question}
          value={answer?.value}
          onChange={onAnswer}
          disabled={disabled}
        />
      );
    case QuestionType.MULTI_SELECT:
      return (
        <MultiSelectQuestionView
          question={question}
          value={answer?.value}
          onChange={onAnswer}
          disabled={disabled}
        />
      );
    case QuestionType.SHORT_ANSWER:
      return (
        <ShortAnswerQuestionView
          question={question}
          value={answer?.value}
          onChange={onAnswer}
          disabled={disabled}
        />
      );
    case QuestionType.ESSAY:
      return (
        <EssayQuestionView
          question={question}
          value={answer?.value}
          onChange={onAnswer}
          disabled={disabled}
        />
      );
    default:
      return null;
  }
};
