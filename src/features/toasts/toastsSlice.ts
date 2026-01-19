import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

export type ToastLevel = "info" | "success" | "warning" | "error";

export type Toast = {
  id: string;
  message: string;
  level: ToastLevel;
  createdAt: number;
};

type ToastsState = {
  items: Toast[];
};

const initialState: ToastsState = {
  items: [],
};

const toastsSlice = createSlice({
  name: "toasts",
  initialState,
  reducers: {
    enqueueToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.items.push(action.payload);
      },
      prepare(message: string, level: ToastLevel = "info") {
        return {
          payload: {
            id: nanoid(),
            message,
            level,
            createdAt: Date.now(),
          } satisfies Toast,
        };
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.items = [];
    },
  },
});

export const { enqueueToast, dismissToast, clearToasts } = toastsSlice.actions;
export default toastsSlice.reducer;
