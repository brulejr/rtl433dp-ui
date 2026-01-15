import { apiFetch } from "../../api/http";
import { unwrap, type ResourceWrapper } from "../../api/resourceWrapper";

export type ModelKey = { modelName: string; fingerprint: string };

// TODO: Replace these with your exact ModelResource shapes.
export type ModelResourceList = {
  modelName: string;
  fingerprint: string;
  // any additional list fields (JsonView.List)
  [k: string]: unknown;
};

export type ModelResourceDetails = ModelResourceList & {
  // any additional details fields (JsonView.Details)
  sensors?: unknown;
};

export type Rtl433Search = Record<string, unknown>;

export type SensorsUpdateRequest = {
  // Match your SensorsUpdateRequest DTO.
  sensors: unknown;
};

export function modelsApi(token: string | null) {
  return {
    list: async () => {
      const w = await apiFetch<ResourceWrapper<ModelResourceList[]>>(`/api/v1/models`, {}, token);
      return unwrap(w);
    },

    get: async (key: ModelKey) => {
      const w = await apiFetch<ResourceWrapper<ModelResourceDetails>>(
        `/api/v1/models/${encodeURIComponent(key.modelName)}/${encodeURIComponent(key.fingerprint)}`,
        {},
        token
      );
      return unwrap(w);
    },

    search: async (req: Rtl433Search) => {
      const w = await apiFetch<ResourceWrapper<ModelResourceList[]>>(
        `/api/v1/models/search`,
        { method: "POST", body: JSON.stringify(req) },
        token
      );
      return unwrap(w);
    },

    updateSensors: async (key: ModelKey, req: SensorsUpdateRequest) => {
      const w = await apiFetch<ResourceWrapper<ModelResourceDetails>>(
        `/api/v1/models/${encodeURIComponent(key.modelName)}/${encodeURIComponent(key.fingerprint)}/sensors`,
        { method: "POST", body: JSON.stringify(req) },
        token
      );
      return unwrap(w);
    }
  };
}
