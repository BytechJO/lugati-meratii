import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/auth";
import classReducer from "./reducers/classSlice";
import lettersReducer from "./reducers/lettersSlice";
import videoLessonsReducer from "./reducers/videoLessonsSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    class: classReducer,
    letters: lettersReducer,
    videoLessons: videoLessonsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
