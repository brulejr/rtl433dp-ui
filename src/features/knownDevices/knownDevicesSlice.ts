import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

type KnownDevicesUiState = {
  filterText: string;
  selectedKey: string | null;
};

const initialState: KnownDevicesUiState = {
  filterText: "",
  selectedKey: null,
};

const knownDevicesSlice = createSlice({
  name: "knownDevices",
  initialState,
  reducers: {
    setFilterText(state, action: PayloadAction<string>) {
      state.filterText = action.payload;
    },
    selectKnownDevice(state, action: PayloadAction<string | null>) {
      state.selectedKey = action.payload;
    },
    clearSelection(state) {
      state.selectedKey = null;
    },
  },
});

export const { setFilterText, selectKnownDevice, clearSelection } =
  knownDevicesSlice.actions;

export default knownDevicesSlice.reducer;

// selectors
export const selectKnownDevicesFilterText = (s: RootState) =>
  s.knownDevices.filterText;

export const selectKnownDevicesSelectedKey = (s: RootState) =>
  s.knownDevices.selectedKey;
