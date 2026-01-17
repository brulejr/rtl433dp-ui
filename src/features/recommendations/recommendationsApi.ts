import { baseApi } from "../../services/api/baseApi";

export type Recommendation = {
  // match backend
  id: string;
  model: string;
  deviceId: string;
  weight?: number;
};

export type PromoteRequest = {
  // match backend promote payload
  recommendationId: string;
  type: string;
  area: string;
  name: string;
};

export const recommendationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listRecommendations: build.query<Recommendation[], void>({
      query: () => "/api/v1/recommendations",
      providesTags: ["Recommendations"],
    }),

    promoteRecommendation: build.mutation<void, PromoteRequest>({
      query: (body) => ({
        url: "/api/v1/recommendations/promote",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Recommendations", "KnownDevices"],
    }),
  }),
});

export const { useListRecommendationsQuery, usePromoteRecommendationMutation } =
  recommendationsApi;
