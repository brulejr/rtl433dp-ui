import { apiFetch } from "../../api/http";
import { unwrap, type ResourceWrapper } from "../../api/resourceWrapper";

// TODO: Replace with exact RecommendationResource fields.
export type RecommendationResource = {
  // Typical fields in rtl433 pipeline
  model?: string;
  id?: string;
  fingerprint?: string;
  weight?: number;
  rssi?: number;
  frequency?: number;
  [k: string]: unknown;
};

// TODO: Match your PromotionRequest DTO exactly.
export type PromotionRequest = {
  // include whatever your backend expects (this is a placeholder)
  model: string;
  id: string;
  name: string;
  area: string;
  deviceType: string;
};

export type KnownDeviceResource = {
  id: string;
  name: string;
  area: string;
  deviceType: string;
  [k: string]: unknown;
};

export function recommendationsApi(token: string | null) {
  return {
    listCandidates: async () => {
      const w = await apiFetch<ResourceWrapper<RecommendationResource[]>>(`/api/v1/recommendations`, {}, token);
      return unwrap(w);
    },

    promote: async (req: PromotionRequest) => {
      const w = await apiFetch<ResourceWrapper<KnownDeviceResource>>(
        `/api/v1/recommendations/promote`,
        { method: "POST", body: JSON.stringify(req) },
        token
      );
      return unwrap(w);
    }
  };
}
