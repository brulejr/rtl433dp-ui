// src/features/models/modelsDataSlice.ts
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { selectAccessToken } from "../session/sessionSlice";
import { unwrapContent } from "../../app/apiEnvelope";

/**
 * --- API path helpers ---
 * Adjust these in ONE place if your backend differs.
 */
function resolveApiBase(): string {
  const raw = (import.meta as any).env?.VITE_API_BASE_URL ?? "/api";

  // Allow absolute (https://host/api) or relative (/api)
  try {
    // eslint-disable-next-line no-new
    new URL(raw);
    return String(raw).replace(/\/$/, "");
  } catch {
    return new URL(String(raw).replace(/\/$/, ""), window.location.origin).toString();
  }
}

const API_BASE = resolveApiBase();

function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

async function httpJson<T>(
  url: string,
  token: string | null,
  init?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as any),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const resp = await fetch(url, { ...init, headers });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`${resp.status} ${resp.statusText}${text ? ` - ${text}` : ""}`);
  }

  if (resp.status === 204) return undefined as T;
  return (await resp.json()) as T;
}

/**
 * Endpoint mapping (matches repo README):
 * - list: GET /v1/models
 * - search: POST /v1/models/search
 * - details: GET /v1/models/{modelName}/{fingerprint}
 * - update sensors: POST /v1/models/{modelName}/{fingerprint}/sensors
 */
const modelsApi = {
  list: () => apiUrl("/v1/models"),
  search: () => apiUrl("/v1/models/search"),
  details: (modelName: string, fingerprint: string) =>
    apiUrl(`/v1/models/${encodeURIComponent(modelName)}/${encodeURIComponent(fingerprint)}`),
  updateSensors: (modelName: string, fingerprint: string) =>
    apiUrl(`/v1/models/${encodeURIComponent(modelName)}/${encodeURIComponent(fingerprint)}/sensors`),
};

export type ModelSummary = {
  model: string;
  fingerprint: string;
  category?: string;
};

export type ModelDetails = {
  model: string;
  fingerprint: string;
  sensors?: unknown;
  updatedAt?: string;
  createdAt?: string;
};

type Status = "idle" | "loading" | "succeeded" | "failed";

type ModelsState = {
  items: ModelSummary[];
  status: Status;
  error: string | null;

  detailsByFingerprint: Record<string, ModelDetails | undefined>;
  detailsStatusByFingerprint: Record<string, Status | undefined>;
  detailsErrorByFingerprint: Record<string, string | null | undefined>;

  updateSensorsStatus: Status;
  updateSensorsError: string | null;
};

const initialState: ModelsState = {
  items: [],
  status: "idle",
  error: null,

  detailsByFingerprint: {},
  detailsStatusByFingerprint: {},
  detailsErrorByFingerprint: {},

  updateSensorsStatus: "idle",
  updateSensorsError: null,
};

export const fetchModels = createAsyncThunk<ModelSummary[], void, { state: RootState }>(
  "models/fetchModels",
  async (_arg, thunkApi) => {
    const token = selectAccessToken(thunkApi.getState());
    const json = await httpJson<unknown>(modelsApi.list(), token);
    return unwrapContent<ModelSummary>(json);
  },
);

export const searchModels = createAsyncThunk<
  ModelSummary[],
  { body: unknown },
  { state: RootState }
>("models/searchModels", async ({ body }, thunkApi) => {
  const token = selectAccessToken(thunkApi.getState());
  const json = await httpJson<unknown>(modelsApi.search(), token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return unwrapContent<ModelSummary>(json);
});

export const fetchModelDetails = createAsyncThunk<
  { fingerprint: string; details: ModelDetails },
  { modelName: string; fingerprint: string },
  { state: RootState }
>("models/fetchModelDetails", async ({ modelName, fingerprint }, thunkApi) => {
  const token = selectAccessToken(thunkApi.getState());

  // details may be enveloped too
  const json = await httpJson<unknown>(modelsApi.details(modelName, fingerprint), token);
  const details = unwrapContent<ModelDetails>(json)[0] ?? (json as ModelDetails);

  return { fingerprint, details };
});

export const updateModelSensors = createAsyncThunk<
  { fingerprint: string; details?: ModelDetails },
  { modelName: string; fingerprint: string; payload: unknown },
  { state: RootState }
>("models/updateModelSensors", async ({ modelName, fingerprint, payload }, thunkApi) => {
  const token = selectAccessToken(thunkApi.getState());

  // may return 204 OR an envelope OR a details object
  const json = await httpJson<unknown | undefined>(
    modelsApi.updateSensors(modelName, fingerprint),
    token,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (json === undefined) return { fingerprint, details: undefined };

  const unwrapped = unwrapContent<ModelDetails>(json);
  const details = unwrapped[0] ?? (json as ModelDetails);

  return { fingerprint, details };
});

const modelsDataSlice = createSlice({
  name: "modelsData",
  initialState,
  reducers: {
    clearModelsError(state) {
      state.error = null;
    },
    clearUpdateSensorsError(state) {
      state.updateSensorsError = null;
    },
    invalidateDetails(state, action: PayloadAction<{ fingerprint: string }>) {
      const fp = action.payload.fingerprint;
      delete state.detailsByFingerprint[fp];
      delete state.detailsStatusByFingerprint[fp];
      delete state.detailsErrorByFingerprint[fp];
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchModels.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload ?? [];
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load models.";
      })

      // search
      .addCase(searchModels.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(searchModels.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload ?? [];
      })
      .addCase(searchModels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Search failed.";
      })

      // details
      .addCase(fetchModelDetails.pending, (state, action) => {
        const fp = action.meta.arg.fingerprint;
        state.detailsStatusByFingerprint[fp] = "loading";
        state.detailsErrorByFingerprint[fp] = null;
      })
      .addCase(fetchModelDetails.fulfilled, (state, action) => {
        const { fingerprint, details } = action.payload;
        state.detailsStatusByFingerprint[fingerprint] = "succeeded";
        state.detailsByFingerprint[fingerprint] = details;
      })
      .addCase(fetchModelDetails.rejected, (state, action) => {
        const fp = action.meta.arg.fingerprint;
        state.detailsStatusByFingerprint[fp] = "failed";
        state.detailsErrorByFingerprint[fp] =
          action.error.message ?? "Failed to load model details.";
      })

      // update sensors
      .addCase(updateModelSensors.pending, (state) => {
        state.updateSensorsStatus = "loading";
        state.updateSensorsError = null;
      })
      .addCase(updateModelSensors.fulfilled, (state, action) => {
        state.updateSensorsStatus = "succeeded";
        const { fingerprint, details } = action.payload;

        if (details) {
          state.detailsByFingerprint[fingerprint] = details;
          state.detailsStatusByFingerprint[fingerprint] = "succeeded";
          state.detailsErrorByFingerprint[fingerprint] = null;
        } else {
          delete state.detailsByFingerprint[fingerprint];
          delete state.detailsStatusByFingerprint[fingerprint];
          delete state.detailsErrorByFingerprint[fingerprint];
        }
      })
      .addCase(updateModelSensors.rejected, (state, action) => {
        state.updateSensorsStatus = "failed";
        state.updateSensorsError = action.error.message ?? "Failed to update sensors.";
      });
  },
});

export const { clearModelsError, clearUpdateSensorsError, invalidateDetails } =
  modelsDataSlice.actions;

export default modelsDataSlice.reducer;

// selectors
export const selectModelsItems = (s: RootState) => s.modelsData.items;
export const selectModelsStatus = (s: RootState) => s.modelsData.status;
export const selectModelsError = (s: RootState) => s.modelsData.error;

export const selectModelDetails = (fingerprint: string) => (s: RootState) =>
  s.modelsData.detailsByFingerprint[fingerprint];

export const selectModelDetailsStatus = (fingerprint: string) => (s: RootState) =>
  s.modelsData.detailsStatusByFingerprint[fingerprint] ?? "idle";

export const selectModelDetailsError = (fingerprint: string) => (s: RootState) =>
  s.modelsData.detailsErrorByFingerprint[fingerprint] ?? null;

export const selectUpdateSensorsStatus = (s: RootState) =>
  s.modelsData.updateSensorsStatus;
export const selectUpdateSensorsError = (s: RootState) =>
  s.modelsData.updateSensorsError;
