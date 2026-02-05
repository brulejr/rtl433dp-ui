// src/features/recommendations/recommendationsDataSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

import {
  recommendationsApi,
  type RecommendationCandidate,
  type PromoteRecommendationRequest,
} from "./recommendationsApi";

/**
 * Slice-owned model (do NOT export API models from redux).
 * A Recommendation is uniquely identified by deviceFingerprint.
 */
export type Recommendation = {
  // ✅ Canonical unique identity for a recommendation
  deviceFingerprint: string;

  model?: string;
  id?: string | number;
  deviceId?: string | number;

  source?: string;

  weight?: number;
  signalStrengthDbm?: number;
  bucketCount?: number;

  lastSeen?: string;
  time?: string;

  // keep flexible for forward/backward compatible fields
  [k: string]: unknown;
};

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

type RecommendationsDataState = {
  items: Recommendation[];
  status: LoadStatus;
  error: string | null;

  promoteStatus: LoadStatus;
  promoteError: string | null;

  lastFetchedAt: number | null;
};

const initialState: RecommendationsDataState = {
  items: [],
  status: "idle",
  error: null,

  promoteStatus: "idle",
  promoteError: null,

  lastFetchedAt: null,
};

function asErrorMessage(e: unknown): string {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  if (typeof e === "object") {
    const anyE = e as any;
    return (
      anyE?.data?.message ||
      anyE?.error ||
      anyE?.message ||
      JSON.stringify(e)
    );
  }
  return String(e);
}

function toNumberOrUndefined(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function toStringOrUndefined(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s ? s : undefined;
}

function extractDeviceFingerprint(raw: Record<string, unknown>): string | null {
  // Prefer explicit "deviceFingerprint", but tolerate older/alternate fields
  const fp =
    raw.deviceFingerprint ??
    raw.fingerprint ??
    (raw as any).device_fingerprint ??
    (raw as any).device_fingerprint;

  if (fp === null || fp === undefined) return null;

  const s = String(fp).trim();
  return s ? s : null;
}

/**
 * API -> slice model mapping.
 * This is the only place that "knows" the REST model.
 *
 * Enforces:
 * - deviceFingerprint must exist and be non-empty
 */
function canonicalizeRecommendation(
  c: RecommendationCandidate,
): Recommendation | null {
  if (!c || typeof c !== "object") return null;

  const raw = c as unknown as Record<string, unknown>;
  const deviceFingerprint = extractDeviceFingerprint(raw);
  if (!deviceFingerprint) return null;

  return {
    // ✅ identity
    deviceFingerprint,

    // fields we care about (normalize)
    model: (c as any).model ?? undefined,
    id: (c as any).id ?? undefined,
    deviceId: (c as any).deviceId ?? (c as any).device_id ?? undefined,

    source: (c as any).source ?? undefined,

    weight: toNumberOrUndefined((c as any).weight),
    signalStrengthDbm: toNumberOrUndefined(
      (c as any).signalStrengthDbm ?? (c as any).rssi,
    ),
    bucketCount: toNumberOrUndefined((c as any).bucketCount ?? (c as any).frequency),

    lastSeen: toStringOrUndefined((c as any).lastSeen),
    time: toStringOrUndefined((c as any).time),

    // keep any extra fields for forward compatibility
    ...raw,
  } as Recommendation;
}

/**
 * De-dupe by deviceFingerprint. If duplicates arrive, keep the newest by time/lastSeen.
 */
function dedupeByDeviceFingerprint(recs: Recommendation[]): Recommendation[] {
  const byFp = new Map<string, Recommendation>();

  const score = (r: Recommendation): number => {
    const primary = (r.lastSeen ?? r.time ?? "") as string;
    const ms = Date.parse(primary);
    return Number.isFinite(ms) ? ms : 0;
  };

  for (const r of recs) {
    const existing = byFp.get(r.deviceFingerprint);
    if (!existing) {
      byFp.set(r.deviceFingerprint, r);
      continue;
    }
    if (score(r) >= score(existing)) {
      byFp.set(r.deviceFingerprint, r);
    }
  }

  return Array.from(byFp.values());
}

export const fetchRecommendations = createAsyncThunk<
  Recommendation[],
  void,
  { rejectValue: string }
>(
  "recommendationsData/fetchRecommendations",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await dispatch(
        recommendationsApi.endpoints.listRecommendations.initiate(undefined, {
          forceRefetch: true,
        }),
      ).unwrap();

      const content = (res?.content ?? []) as RecommendationCandidate[];

      const canonical = content
        .map(canonicalizeRecommendation)
        .filter((r): r is Recommendation => r !== null);

      return dedupeByDeviceFingerprint(canonical);
    } catch (e) {
      return rejectWithValue(asErrorMessage(e));
    }
  },
);

export const promoteRecommendation = createAsyncThunk<
  void,
  PromoteRecommendationRequest,
  { rejectValue: string }
>(
  "recommendationsData/promoteRecommendation",
  async (body, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(
        recommendationsApi.endpoints.promoteRecommendation.initiate(body),
      ).unwrap();

      // Keep the slice authoritative: refresh list after promote
      await dispatch(fetchRecommendations()).unwrap();
    } catch (e) {
      return rejectWithValue(asErrorMessage(e));
    }
  },
);

const recommendationsDataSlice = createSlice({
  name: "recommendationsData",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchRecommendations.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchRecommendations.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.items = a.payload ?? [];
      s.error = null;
      s.lastFetchedAt = Date.now();
    });
    b.addCase(fetchRecommendations.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload ?? "Failed to load recommendations";
    });

    b.addCase(promoteRecommendation.pending, (s) => {
      s.promoteStatus = "loading";
      s.promoteError = null;
    });
    b.addCase(promoteRecommendation.fulfilled, (s) => {
      s.promoteStatus = "succeeded";
      s.promoteError = null;
    });
    b.addCase(promoteRecommendation.rejected, (s, a) => {
      s.promoteStatus = "failed";
      s.promoteError = a.payload ?? "Failed to promote recommendation";
    });
  },
});

export default recommendationsDataSlice.reducer;

// selectors
export const selectRecommendationsItems = (s: RootState) =>
  s.recommendationsData.items;

export const selectRecommendationsStatus = (s: RootState) =>
  s.recommendationsData.status;

export const selectRecommendationsError = (s: RootState) =>
  s.recommendationsData.error;

export const selectRecommendationsPromoteStatus = (s: RootState) =>
  s.recommendationsData.promoteStatus;

export const selectRecommendationsPromoteError = (s: RootState) =>
  s.recommendationsData.promoteError;

export const selectRecommendationsLastFetchedAt = (s: RootState) =>
  s.recommendationsData.lastFetchedAt;
