// src/features/models/modelsApi.ts
import { baseApi } from "../../services/api/baseApi";

export type ApiEnvelope<T> = {
  content: T;
  status: number;
  timestamp: string;
  messages: string[];
};

export type ModelSummary = {
  source: string;
  model: string;
  fingerprint: string;
  category?: string;
};

export const modelsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getModels: build.query<ApiEnvelope<ModelSummary[]>, void>({
      query: () => ({
        url: "/v1/models", // ✅ NOT /api/v1/models
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetModelsQuery } = modelsApi;
