import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllLetters } from "../../API/letters";

export interface Letter {
  [x: string]: any;
  symbol: string;
  letter: string;
  name: string;
  emoji?: string;
}

interface LettersState {
  letters: Letter[];
  loading: boolean;
  error: string | null;
}

const initialState: LettersState = {
  letters: [],
  loading: false,
  error: null,
};

export const fetchLetters = createAsyncThunk(
  "letters/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllLetters();
      return res.data.data; // 👈 هون .data
    } catch (err: any) {
      return rejectWithValue("Failed to fetch letters");
    }
  }
);

const lettersSlice = createSlice({
  name: "letters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLetters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLetters.fulfilled, (state, action) => {
        state.loading = false;
        state.letters = action.payload;
      })
      .addCase(fetchLetters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default lettersSlice.reducer;