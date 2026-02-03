import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import CreateExamForm from "@/components/exam-element/create-exam-form";

export default function FormPage() {
  const { courseId } = useLocalSearchParams();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView>
          <CreateExamForm courseId={courseId as string} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
