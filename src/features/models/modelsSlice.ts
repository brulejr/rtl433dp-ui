// src/features/models/modelsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

type ModelsUiState = {
  filterText: string;
  selectedFingerprint: string | null;

  // Advanced search JSON body (as text)
  searchJson: string;

  // UI toggles
  detailsOpen: boolean;
  updateSensorsOpen: boolean;
};

const initialState: ModelsUiState = {
  filterText: "",
  selectedFingerprint: null,
  searchJson: "",
  detailsOpen: false,
  updateSensorsOpen: false,
};

const modelsSlice = createSlice({
  name: "models",
  initialState,
  reducers: {
    setFilterText(state, action: PayloadAction<string>) {
      state.filterText = action.payload;
    },

    selectModel(state, action: PayloadAction<string>) {
      state.selectedFingerprint = action.payload;
      state.detailsOpen = true;
    },

    clearSelection(state) {
      state.selectedFingerprint = null;
      state.detailsOpen = false;
      state.updateSensorsOpen = false;
    },

    setDetailsOpen(state, action: PayloadAction<boolean>) {
      state.detailsOpen = action.payload;
      if (!action.payload) state.updateSensorsOpen = false;
    },

    setSearchJson(state, action: PayloadAction<string>) {
      state.searchJson = action.payload;
    },

    resetSearch(state) {
      state.searchJson = "";
      state.filterText = "";
    },

    setUpdateSensorsOpen(state, action: PayloadAction<boolean>) {
      state.updateSensorsOpen = action.payload;
    },
  },
});

export default modelsSlice.reducer;

export const {
  setFilterText,
  selectModel,
  clearSelection,
  setDetailsOpen,
  setSearchJson,
  resetSearch,
  setUpdateSensorsOpen,
} = modelsSlice.actions;

// selectors
export const selectModelsFilterText = (s: RootState) => s.models.filterText;
export const selectModelsSelectedFingerprint = (s: RootState) => s.models.selectedFingerprint;
export const selectModelsDetailsOpen = (s: RootState) => s.models.detailsOpen;
export const selectModelsSearchJson = (s: RootState) => s.models.searchJson;
export const selectModelsUpdateSensorsOpen = (s: RootState) => s.models.updateSensorsOpen;
