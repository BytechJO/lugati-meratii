import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMyClass,getAllClasses } from "../../API/classes";

export interface ClassState {
  myClass: any | null;
  allClasses: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ClassState = {
  myClass: null,
  allClasses: [],
  loading: false,
  error: null,
};
export const fetchMyClass = createAsyncThunk(
  "class/fetchMyClass",
  async (_, { rejectWithValue }) => {
   
    try {
      const res = await getMyClass();
       console.log("MY CLASS FROM API:", res.data);
      return res.data; // null أو class
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class"
      );
    }
  }
);
export const fetchAllClasses = createAsyncThunk(
  "class/fetchAllClasses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllClasses();
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue("Failed to fetch classes");
    }
  }
);

const classSlice = createSlice({
  name: "class",
  initialState,
  reducers: {
    clearMyClass: (state) => {
      state.myClass = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyClass.fulfilled, (state, action) => {
        state.loading = false;
        state.myClass = action.payload;
      })
      .addCase(fetchMyClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllClasses.fulfilled, (state, action) => {
    state.allClasses = action.payload;
  });
  },
});

export const { clearMyClass } = classSlice.actions;
export default classSlice.reducer;
