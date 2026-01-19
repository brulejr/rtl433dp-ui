// src/features/knownEntities/knownDevicesApi.ts
import { baseApi } from "../../services/api/baseApi";
import type { ApiEnvelope } from "../../services/api/envelope";

const KNOWN_DEVICES_PATH = "/v1/known-devices";

export type KnownDevice = {
  id?: string;

  name?: string;
  area?: string;
  deviceType?: string;

  model?: string;
  deviceId?: string | number;

  [key: string]: unknown;
};

export const knownDevicesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listKnownDevices: build.query<ApiEnvelope<KnownDevice[]>, void>({
      query: () => ({
        url: KNOWN_DEVICES_PATH,
        method: "GET",
      }),
      providesTags: (_result) => [{ type: "KnownDevices", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useListKnownDevicesQuery } = knownDevicesApi;
