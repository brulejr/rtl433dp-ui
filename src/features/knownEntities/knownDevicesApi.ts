import { apiFetch } from "../../api/http";
import { unwrap, type ResourceWrapper } from "../../api/resourceWrapper";

// TODO: Replace with exact KnownDeviceResource fields.
export type KnownDeviceResource = {
  id: string;
  name?: string;
  area?: string;
  deviceType?: string;
  [k: string]: unknown;
};

export function knownDevicesApi(token: string | null) {
  return {
    listAll: async () => {
      const w = await apiFetch<ResourceWrapper<KnownDeviceResource[]>>(`/api/v1/known-devices`, {}, token);
      return unwrap(w);
    }
  };
}
