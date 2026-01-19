// src/features/models/modelsApi.ts
import { baseApi } from "../../services/api/baseApi";
import type { ApiEnvelope } from "../../services/api/envelope";

export type ModelSummary = {
  source?: string;
  model: string;
  fingerprint: string;
  category?: string;
};

export type ModelSensor = {
  name: string;
  deviceClass?: string;
  stateClass?: string;
  unitOfMeasurement?: string;
  icon?: string;
  valuePath?: string;
  enabled?: boolean;
};

export type ModelDetails = ModelSummary & {
  sensors?: ModelSensor[];
};

export type ModelsSearchRequest = Record<string, unknown>;

export const modelsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listModels: build.query<ApiEnvelope<ModelSummary[]>, void>({
      query: () => ({
        url: "/v1/models",
        method: "GET",
      }),
      providesTags: () => [{ type: "Models", id: "LIST" }],
    }),

    searchModels: build.mutation<ApiEnvelope<ModelSummary[]>, ModelsSearchRequest>({
      query: (body) => ({
        url: "/v1/models/search",
        method: "POST",
        body,
      }),
      invalidatesTags: () => [{ type: "Models", id: "LIST" }],
    }),

    getModelDetails: build.query<
      ApiEnvelope<ModelDetails>,
      { modelName: string; fingerprint: string }
    >({
      query: ({ modelName, fingerprint }) => ({
        url: `/v1/models/${encodeURIComponent(modelName)}/${encodeURIComponent(
          fingerprint
        )}`,
        method: "GET",
      }),
      providesTags: (_result, _err, arg) => [
        { type: "Models", id: "LIST" },
        { type: "ModelDetails", id: `${arg.modelName}:${arg.fingerprint}` },
      ],
    }),

    updateModelSensors: build.mutation<
      ApiEnvelope<ModelDetails>,
      { modelName: string; fingerprint: string; sensors: ModelSensor[] }
    >({
      query: ({ modelName, fingerprint, sensors }) => ({
        url: `/v1/models/${encodeURIComponent(modelName)}/${encodeURIComponent(
          fingerprint
        )}/sensors`,
        method: "PUT",
        body: sensors,
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: "Models", id: "LIST" },
        { type: "ModelDetails", id: `${arg.modelName}:${arg.fingerprint}` },
      ],
    }),
  }),
});

export const {
  useListModelsQuery,
  useSearchModelsMutation,
  useGetModelDetailsQuery,
  useUpdateModelSensorsMutation,
} = modelsApi;
