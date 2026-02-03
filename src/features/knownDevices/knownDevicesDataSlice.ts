// src/features/knownDevices/knownDevicesDataSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { selectAccessToken } from "../session/sessionSlice";

export type KnownDevice = {
  // ✅ Canonical unique identity for a known device
  fingerprint: string;

  model?: string;
  deviceId?: string | number;

  name?: string;
  type?: string; // matches API response
  area?: string;

  time?: string; // matches API response
  version?: number;

  // keep flexible for future fields
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

function resolveApiUrl(path: string): string {
  const base =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

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

/**
 * ✅ Minimal, safe normalization:
 * Accept either:
 *  - [...]
 *  - { content: [...] }  (your current backend)
 *  - { items: [...] }
 */
function extractKnownDevices(payload: unknown): unknown[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const content = obj.content;
    const items = obj.items;

    if (Array.isArray(content)) return content;
    if (Array.isArray(items)) return items;
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn("Unexpected /v1/known-devices payload shape:", payload);
  }
  return [];
}

/**
 * Ensure:
 * - fingerprint is present and non-empty string
 * - keep API fields as-is (type/time)
 */
function canonicalizeKnownDevice(raw: unknown): KnownDevice | null {
  if (!raw || typeof raw !== "object") return null;

  const o = raw as Record<string, unknown>;

  const fp = o.fingerprint;
  if (fp === null || fp === undefined) return null;

  const fingerprint = String(fp).trim();
  if (!fingerprint) return null;

  return {
    ...(o as Record<string, unknown>),
    fingerprint,
  } as KnownDevice;
}

/**
 * De-dupe by fingerprint. If duplicates arrive, keep the newest by time.
 */
function dedupeByFingerprint(devices: KnownDevice[]): KnownDevice[] {
  const byFp = new Map<string, KnownDevice>();

  const score = (d: KnownDevice): number => {
    const s = (d.time ?? "") as string;
    const ms = Date.parse(s);
    return Number.isFinite(ms) ? ms : 0;
  };

  for (const d of devices) {
    const existing = byFp.get(d.fingerprint);
    if (!existing) {
      byFp.set(d.fingerprint, d);
      continue;
    }
    if (score(d) >= score(existing)) {
      byFp.set(d.fingerprint, d);
    }
  }

  return Array.from(byFp.values());
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

    const arr = extractKnownDevices(json);

    const canonical = arr
      .map(canonicalizeKnownDevice)
      .filter((d): d is KnownDevice => d !== null);

    return dedupeByFingerprint(canonical);
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
      });
  },
});

export default knownDevicesDataSlice.reducer;

// selectors
export const selectKnownDevicesItems = (s: RootState) => s.knownDevicesData.items;
export const selectKnownDevicesStatus = (s: RootState) => s.knownDevicesData.status;
export const selectKnownDevicesError = (s: RootState) => s.knownDevicesData.error;
export const selectKnownDevicesLastFetchedAt = (s: RootState) =>
  s.knownDevicesData.lastFetchedAt;
