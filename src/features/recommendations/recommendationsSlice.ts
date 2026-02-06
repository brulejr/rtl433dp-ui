// src/features/recommendations/recommendationsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { Recommendation } from "./recommendationsDataSlice";

export type PromoteFormState = {
  name: string;
  area: string;
  deviceType: string;
};

type RecommendationsUiState = {
  // ✅ table UI
  filterText: string;
  selectedDeviceFingerprint: string | null;

  // ✅ promote dialog UI
  promoteOpen: boolean;
  selected: Recommendation | null;
  promoteForm: PromoteFormState;
};

const initialState: RecommendationsUiState = {
  filterText: "",
  selectedDeviceFingerprint: null,

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
    // =========================
    // Table UI (like Models)
    // =========================
    setFilterText(state, action: PayloadAction<string>) {
      state.filterText = action.payload ?? "";

      // Optional but nice: if the filter changes, selection is often invalidated.
      // We keep it and let the grid auto-clear if needed (same behavior as other pages).
      // If you want immediate clear, uncomment:
      // state.selectedDeviceFingerprint = null;
    },

    setSelectedDeviceFingerprint(state, action: PayloadAction<string>) {
      const v = String(action.payload ?? "").trim();
      state.selectedDeviceFingerprint = v ? v : null;
    },

    clearSelection(state) {
      state.selectedDeviceFingerprint = null;
    },

    // =========================
    // Promote dialog UI
    // =========================
    openPromote(state, action: PayloadAction<Recommendation>) {
      state.promoteOpen = true;
      state.selected = action.payload;

      // Keep grid selection in sync with the opened item (nice UX)
      state.selectedDeviceFingerprint =
        action.payload?.deviceFingerprint ?? state.selectedDeviceFingerprint;

      // Reset for clarity
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
  setFilterText,
  setSelectedDeviceFingerprint,
  clearSelection,
  openPromote,
  closePromote,
  setPromoteField,
  resetPromoteForm,
} = recommendationsSlice.actions;

export default recommendationsSlice.reducer;

// selectors
export const selectRecommendationsFilterText = (s: RootState) =>
  s.recommendationsUi.filterText;

export const selectRecommendationsSelectedDeviceFingerprint = (s: RootState) =>
  s.recommendationsUi.selectedDeviceFingerprint;

export const selectPromoteOpen = (s: RootState) => s.recommendationsUi.promoteOpen;
export const selectSelectedCandidate = (s: RootState) => s.recommendationsUi.selected;
export const selectPromoteForm = (s: RootState) => s.recommendationsUi.promoteForm;
