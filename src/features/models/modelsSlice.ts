import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { modelsApi, type ModelSensor, type ModelSummary, type ModelsSearchRequest } from "./modelsApi";

export type ModelsMode = "list" | "search";

type SensorEditState = {
  modelKey: string | null; // `${modelName}:${fingerprint}`
  isEditing: boolean;
  draftSensors: ModelSensor[];
  isSaving: boolean;
  saveError: string | null;
};

export type ModelsState = {
  mode: ModelsMode;

  // Search UI state
  searchJson: string;
  isSearching: boolean;
  searchError: string | null;
  searchResults: ModelSummary[] | null;

  // Details admin editing state
  sensorsEdit: SensorEditState;
};

const initialState: ModelsState = {
  mode: "list",

  searchJson: "{\n  \n}\n",
  isSearching: false,
  searchError: null,
  searchResults: null,

  sensorsEdit: {
    modelKey: null,
    isEditing: false,
    draftSensors: [],
    isSaving: false,
    saveError: null,
  },
};

export const runModelsSearch = createAsyncThunk<
  ModelSummary[],
  string,
  { rejectValue: string }
>("models/runSearch", async (searchJson, { dispatch, rejectWithValue }) => {
  let body: ModelsSearchRequest;
  try {
    body = searchJson?.trim() ? (JSON.parse(searchJson) as ModelsSearchRequest) : {};
  } catch (e) {
    return rejectWithValue("Invalid JSON in search body.");
  }

  try {
    const envelope = await dispatch(modelsApi.endpoints.searchModels.initiate(body)).unwrap();
    return envelope.content ?? [];
  } catch (e) {
    return rejectWithValue("Search request failed.");
  }
});

export const saveModelSensors = createAsyncThunk<
  void,
  { modelName: string; fingerprint: string; sensors: ModelSensor[] },
  { rejectValue: string }
>("models/saveModelSensors", async ({ modelName, fingerprint, sensors }, { dispatch, rejectWithValue }) => {
  try {
    await dispatch(
      modelsApi.endpoints.updateModelSensors.initiate({ modelName, fingerprint, sensors })
    ).unwrap();
  } catch (e) {
    return rejectWithValue("Failed to save sensors.");
  }
});

const modelsSlice = createSlice({
  name: "models",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<ModelsMode>) {
      state.mode = action.payload;
      if (state.mode === "list") {
        // don’t clear searchJson (user may come back), but clear results/errors for clarity
        state.searchError = null;
        state.isSearching = false;
        state.searchResults = null;
      }
    },

    setSearchJson(state, action: PayloadAction<string>) {
      state.searchJson = action.payload;
    },

    clearSearch(state) {
      state.searchError = null;
      state.isSearching = false;
      state.searchResults = null;
    },

    beginEditSensors(
      state,
      action: PayloadAction<{ modelName: string; fingerprint: string; sensors: ModelSensor[] }>
    ) {
      const modelKey = `${action.payload.modelName}:${action.payload.fingerprint}`;
      state.sensorsEdit.modelKey = modelKey;
      state.sensorsEdit.isEditing = true;
      state.sensorsEdit.draftSensors = action.payload.sensors ?? [];
      state.sensorsEdit.isSaving = false;
      state.sensorsEdit.saveError = null;
    },

    cancelEditSensors(state) {
      state.sensorsEdit = {
        modelKey: null,
        isEditing: false,
        draftSensors: [],
        isSaving: false,
        saveError: null,
      };
    },

    addDraftSensor(state) {
      state.sensorsEdit.draftSensors.push({
        name: "",
        valuePath: "",
        enabled: true,
      });
    },

    removeDraftSensor(state, action: PayloadAction<number>) {
      state.sensorsEdit.draftSensors.splice(action.payload, 1);
    },

    patchDraftSensor(
      state,
      action: PayloadAction<{ index: number; patch: Partial<ModelSensor> }>
    ) {
      const { index, patch } = action.payload;
      const cur = state.sensorsEdit.draftSensors[index];
      if (!cur) return;
      state.sensorsEdit.draftSensors[index] = { ...cur, ...patch };
    },
  },
  extraReducers: (builder) => {
    builder
      // search
      .addCase(runModelsSearch.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
        state.searchResults = null;
      })
      .addCase(runModelsSearch.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(runModelsSearch.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload ?? "Search failed.";
      })

      // save sensors
      .addCase(saveModelSensors.pending, (state) => {
        state.sensorsEdit.isSaving = true;
        state.sensorsEdit.saveError = null;
      })
      .addCase(saveModelSensors.fulfilled, (state) => {
        state.sensorsEdit.isSaving = false;
        // close editor on success
        state.sensorsEdit = {
          modelKey: null,
          isEditing: false,
          draftSensors: [],
          isSaving: false,
          saveError: null,
        };
      })
      .addCase(saveModelSensors.rejected, (state, action) => {
        state.sensorsEdit.isSaving = false;
        state.sensorsEdit.saveError = action.payload ?? "Failed to save sensors.";
      });
  },
});

export const {
  setMode,
  setSearchJson,
  clearSearch,
  beginEditSensors,
  cancelEditSensors,
  addDraftSensor,
  removeDraftSensor,
  patchDraftSensor,
} = modelsSlice.actions;

export default modelsSlice.reducer;

// selectors
export const selectModelsMode = (s: RootState) => s.models.mode;
export const selectModelsSearchJson = (s: RootState) => s.models.searchJson;
export const selectModelsIsSearching = (s: RootState) => s.models.isSearching;
export const selectModelsSearchError = (s: RootState) => s.models.searchError;
export const selectModelsSearchResults = (s: RootState) => s.models.searchResults;

export const selectSensorsEdit = (s: RootState) => s.models.sensorsEdit;
export const selectIsEditingSensorsFor = (modelName: string, fingerprint: string) => (s: RootState) =>
  s.models.sensorsEdit.isEditing && s.models.sensorsEdit.modelKey === `${modelName}:${fingerprint}`;
