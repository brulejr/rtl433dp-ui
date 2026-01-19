// src/features/knownDevices/knownDevicesDataSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { selectAccessToken } from "../session/sessionSlice";

export type KnownDevice = {
  key?: string;
  model?: string;
  id?: string | number;
  name?: string;
  deviceType?: string;
  area?: string;
  lastSeen?: string;
  rssi?: number;
  freq?: number;
  [k: string]: unknown;
};

type Status = "idle" | "loading" | "succeeded" | "failed";

type KnownDevicesDataState = {
  items: KnownDevice[];
  status: Status;
  error: string | null;
  lastFetchedAt: number | null;
};

const initialState: KnownDevicesDataState = {
  items: [],
  status: "idle",
  error: null,
  lastFetchedAt: null,
};

/**
 * Normalize any of these common API shapes into a KnownDevice[]:
 *  - [...]
 *  - { items: [...] }
 *  - { content: [...] }
 *  - { data: [...] }
 *  - { knownDevices: [...] }
 *  - { results: [...] }
 *  - { <map>: { a:{}, b:{} } } -> Object.values(map)
 */
function normalizeKnownDevices(payload: unknown): KnownDevice[] {
  if (!payload) return [];

  // case 1: already an array
  if (Array.isArray(payload)) return payload as KnownDevice[];

  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    // common envelope keys
    const candidates = [
      obj.items,
      obj.content,
      obj.data,
      obj.knownDevices,
      obj.results,
      obj.value,
    ];

    for (const c of candidates) {
      if (Array.isArray(c)) return c as KnownDevice[];
    }

    // map/object-of-objects -> values
    // e.g. { "foo:1": {...}, "bar:2": {...} }
    const values = Object.values(obj);
    if (values.length > 0 && values.every((v) => v && typeof v === "object")) {
      // If it looks like a map of devices, return values.
      // If it's just metadata, it'll fail the "device-ish" check below.
      const maybeDevices = values as KnownDevice[];
      const looksDeviceish = maybeDevices.some(
        (d) => d && (d.model !== undefined || d.id !== undefined || d.name !== undefined),
      );
      if (looksDeviceish) return maybeDevices;
    }
  }

  return [];
}

function resolveApiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

  // If base is relative like "/api", do NOT use new URL(base) (it throws).
  if (base.startsWith("/")) {
    const b = base.endsWith("/") ? base.slice(0, -1) : base;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${b}${p}`;
  }

  // Full URL base like "http://localhost:5001/api"
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${b}${p}`).toString();
}

export const fetchKnownDevices = createAsyncThunk<
  KnownDevice[],
  void,
  { state: RootState; rejectValue: string }
>("knownDevicesData/fetchKnownDevices", async (_arg, thunkApi) => {
  try {
    const token = selectAccessToken(thunkApi.getState());
    const url = resolveApiUrl("/v1/known-devices");

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return thunkApi.rejectWithValue(
        `HTTP ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
      );
    }

    const json = (await res.json()) as unknown;
    return normalizeKnownDevices(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return thunkApi.rejectWithValue(msg);
  }
});

const knownDevicesDataSlice = createSlice({
  name: "knownDevicesData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKnownDevices.pending, (state) => {
        state.status = "loading";
        state.error = null;
        // ✅ Do NOT clear items here. Avoids "no rows" flicker while refetching.
      })
      .addCase(fetchKnownDevices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload ?? [];
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchKnownDevices.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Request failed";
        // ✅ Keep prior items so UI doesn't instantly become empty.
      });
  },
});

export default knownDevicesDataSlice.reducer;

// selectors
export const selectKnownDevicesItems = (s: RootState) =>
  s.knownDevicesData.items;

export const selectKnownDevicesStatus = (s: RootState) =>
  s.knownDevicesData.status;

export const selectKnownDevicesError = (s: RootState) =>
  s.knownDevicesData.error;

export const selectKnownDevicesLastFetchedAt = (s: RootState) =>
  s.knownDevicesData.lastFetchedAt;
