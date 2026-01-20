// src/features/recommendations/recommendationsDataSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

import {
  recommendationsApi,
  type RecommendationCandidate,
  type PromoteRecommendationRequest,
} from "./recommendationsApi";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

type RecommendationsDataState = {
  items: RecommendationCandidate[];
  status: LoadStatus;
  error: string | null;

  promoteStatus: LoadStatus;
  promoteError: string | null;
};

const initialState: RecommendationsDataState = {
  items: [],
  status: "idle",
  error: null,

  promoteStatus: "idle",
  promoteError: null,
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

export const fetchRecommendations = createAsyncThunk<
  RecommendationCandidate[],
  void,
  { rejectValue: string }
>("recommendationsData/fetchRecommendations", async (_, { dispatch, rejectWithValue }) => {
  try {
    const res = await dispatch(
      recommendationsApi.endpoints.listRecommendations.initiate(undefined, {
        forceRefetch: true,
      }),
    ).unwrap();

    return res.content ?? [];
  } catch (e) {
    return rejectWithValue(asErrorMessage(e));
  }
});

export const promoteRecommendation = createAsyncThunk<
  void,
  PromoteRecommendationRequest,
  { rejectValue: string }
>("recommendationsData/promoteRecommendation", async (body, { dispatch, rejectWithValue }) => {
  try {
    await dispatch(
      recommendationsApi.endpoints.promoteRecommendation.initiate(body),
    ).unwrap();

    // Keep the slice authoritative: refresh list after promote
    await dispatch(fetchRecommendations()).unwrap();
  } catch (e) {
    return rejectWithValue(asErrorMessage(e));
  }
});

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
