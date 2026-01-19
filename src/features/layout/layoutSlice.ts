import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LayoutState = {
  leftNavOpen: boolean;
};

const initialState: LayoutState = {
  leftNavOpen: true,
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setLeftNavOpen(state, action: PayloadAction<boolean>) {
      state.leftNavOpen = action.payload;
    },
    toggleLeftNav(state) {
      state.leftNavOpen = !state.leftNavOpen;
    },
  },
});

export const { setLeftNavOpen, toggleLeftNav } = layoutSlice.actions;
export default layoutSlice.reducer;
