import { baseApi } from "../../services/api/baseApi";

/**
 * The backend responses in this project commonly look like:
 * { content: T, status: number, timestamp: string, messages: string[] }
 */
export type ApiEnvelope<T> = {
  content: T;
  status: number;
  timestamp: string;
  messages: string[];
};

export type ModelSummary = {
  source?: string;
  model: string;
  fingerprint: string;
  category?: string;
};

export type ModelSensor = {
  // Keep this flexible; backend can evolve
  name: string;
  deviceClass?: string;
  stateClass?: string;
  unitOfMeasurement?: string;
  icon?: string;
  valuePath?: string; // e.g. "temperature_C"
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
        // baseApi already prefixes with /api
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
      // Search results depend on models list; invalidate list tag
      invalidatesTags: () => [{ type: "Models", id: "LIST" }],
    }),

    getModelDetails: build.query<
      ApiEnvelope<ModelDetails>,
      { modelName: string; fingerprint: string }
    >({
      query: ({ modelName, fingerprint }) => ({
        url: `/v1/models/${encodeURIComponent(modelName)}/${encodeURIComponent(fingerprint)}`,
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
