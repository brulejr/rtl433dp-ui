import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { RecommendationCandidate } from "./recommendationsApi";

export type PromoteFormState = {
  name: string;
  area: string;
  deviceType: string;
};

type RecommendationsUiState = {
  promoteOpen: boolean;
  selected: RecommendationCandidate | null;
  promoteForm: PromoteFormState;
};

const initialState: RecommendationsUiState = {
  promoteOpen: false,
  selected: null,
  promoteForm: {
    name: "",
    area: "",
    deviceType: "",
  },
};

const recommendationsSlice = createSlice({
  name: "recommendationsUi",
  initialState,
  reducers: {
    openPromote(state, action: PayloadAction<RecommendationCandidate>) {
      state.promoteOpen = true;
      state.selected = action.payload;
      // keep any previous form values? usually better to reset for clarity:
      state.promoteForm = { name: "", area: "", deviceType: "" };
    },

    closePromote(state) {
      state.promoteOpen = false;
      state.selected = null;
    },

    setPromoteField(
      state,
      action: PayloadAction<{ field: keyof PromoteFormState; value: string }>,
    ) {
      state.promoteForm[action.payload.field] = action.payload.value;
    },

    resetPromoteForm(state) {
      state.promoteForm = { name: "", area: "", deviceType: "" };
    },
  },
});

export const {
  openPromote,
  closePromote,
  setPromoteField,
  resetPromoteForm,
} = recommendationsSlice.actions;

export default recommendationsSlice.reducer;

// selectors
export const selectPromoteOpen = (s: RootState) => s.recommendationsUi.promoteOpen;
export const selectSelectedCandidate = (s: RootState) => s.recommendationsUi.selected;
export const selectPromoteForm = (s: RootState) => s.recommendationsUi.promoteForm;
