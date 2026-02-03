import {
  Card,
  Text,
  YStack,
  XStack,
  AlertDialog,
  Button,
  Checkbox,
  Label,
} from "tamagui";
import { Course } from "@/types/types";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import { useState, Dispatch, SetStateAction } from "react";
import * as Haptics from "expo-haptics";
import { Check as CheckIcon } from "@tamagui/lucide-icons";
import { LoadingButton } from "./loading-button";
import { useDeleteCourseMutation } from "@/services/course.api";
import { useAppToast } from "@/app/CurrentToast";

interface Props {
  course: Course;
  backgroundColor: string;
}

export function CourseCard({ course, backgroundColor }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handlePress = () => {
    router.push(`/courses/${course.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{ width: "49%" }}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setOpen(true);
      }}
    >
      <Card
        elevate
        bordered={false}
        p="$4"
        mt="$2"
        height={160}
        borderRadius="$2"
        bg={backgroundColor as any}
        justifyContent="space-evenly"
      >
        <YStack gap="$2">
          <Text color="white" fontSize="$6" fontWeight="700" numberOfLines={2}>
            {course.title}
          </Text>

          {course.description && (
            <Text
              color="rgba(255,255,255,0.85)"
              fontSize="$3"
              numberOfLines={2}
            >
              {course.description}
            </Text>
          )}
        </YStack>

        <YStack justify="space-between" items="flex-start">
          <Text fontSize="$2" color="rgba(255,255,255,0.8)">
            {course.documents.length} docs
          </Text>

          <Text fontSize="$2" color="rgba(255,255,255,0.8)">
            {new Date(course.createdAt).toLocaleDateString()}
          </Text>
        </YStack>
      </Card>
      <DeleteCourseDialog open={open} setOpen={setOpen} courseId={course.id} />
    </Pressable>
  );
}

function DeleteCourseDialog({
  open,
  setOpen,
  courseId,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  courseId: string;
}) {
  const [willDeleteDocuments, setWillDeleteDocuments] = useState(false);
  const [deleteCourse, { isLoading }] = useDeleteCourseMutation();
  const toast = useAppToast();

  async function handleDelete() {
    const response = await deleteCourse({
      id: courseId,
      willDeleteDocuments: willDeleteDocuments,
    }).unwrap();

    if (response.message) {
      toast.show({
        title: response.message,
        preset: "success",
      });
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quickest"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quickest",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
        >
          <YStack gap="$4">
            <AlertDialog.Title fontSize={24} color="$red9">
              Delete Course
            </AlertDialog.Title>
            <AlertDialog.Description>
              By pressing yes, you are going to delete the course
            </AlertDialog.Description>

            <XStack width={300} items="center" gap="$4">
              <Checkbox
                size="$4"
                onCheckedChange={(val) => setWillDeleteDocuments(val === true)}
              >
                <Checkbox.Indicator>
                  <CheckIcon />
                </Checkbox.Indicator>
              </Checkbox>

              <Label>delete documents in this course</Label>
            </XStack>

            <XStack gap="$3" justify="flex-end">
              <AlertDialog.Cancel asChild>
                <Button width={100}>Cancel</Button>
              </AlertDialog.Cancel>

              <LoadingButton
                bg="#E71066"
                color="white"
                width={100}
                loading={isLoading}
                disabled={isLoading}
                onPress={handleDelete}
              >
                Continue
              </LoadingButton>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
