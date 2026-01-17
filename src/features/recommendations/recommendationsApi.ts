import { baseApi } from "../../services/api/baseApi";

export type ApiEnvelope<T> = {
  content: T;
  status: number;
  timestamp: string;
  messages: string[];
};

export type RecommendationCandidate = {
  source?: string;

  // identity-ish
  model?: string;
  id?: string | number;
  deviceId?: string | number; // some backends use deviceId (like known-devices)
  fingerprint?: string;

  // confidence-ish
  weight?: number;
  frequency?: number;
  rssi?: number;

  // misc
  promoted?: boolean;
  time?: string;
  lastSeen?: string;
};

export type PromoteRecommendationRequest = {
  // these must match what your backend expects
  model: string;
  deviceId: string | number; // prefer deviceId to align with known-devices response

  name: string;
  area: string;
  deviceType: string;

  fingerprint?: string;
};

export const recommendationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listRecommendations: build.query<ApiEnvelope<RecommendationCandidate[]>, void>({
      query: () => ({
        // IMPORTANT: baseApi already includes "/api"
        url: "/v1/recommendations",
        method: "GET",
      }),
      providesTags: () => [{ type: "Recommendations", id: "LIST" }],
    }),

    promoteRecommendation: build.mutation<ApiEnvelope<unknown>, PromoteRecommendationRequest>({
      query: (body) => ({
        // IMPORTANT: baseApi already includes "/api"
        url: "/v1/recommendations/promote",
        method: "POST",
        body,
      }),
      invalidatesTags: () => [{ type: "Recommendations", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListRecommendationsQuery,
  usePromoteRecommendationMutation,
} = recommendationsApi;
