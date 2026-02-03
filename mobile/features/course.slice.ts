import { Course } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Course[] = [];

export const courseSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    populateCourses: (state, action: PayloadAction<Course[]>) => {
      return action.payload;
    },

    addCourse: (state, action: PayloadAction<Course[]>) => {
      state.push(...action.payload);
    },

    removeCourse: (state, action: PayloadAction<string>) => {
      return state.filter((doc) => doc.id !== action.payload);
    },

    clearCourses: () => {
      return initialState;
    },
  },
});

export const { populateCourses, addCourse, removeCourse, clearCourses } =
  courseSlice.actions;

export default courseSlice.reducer;
