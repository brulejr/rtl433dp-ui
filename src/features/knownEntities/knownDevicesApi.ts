import { baseApi } from "../../services/api/baseApi";

export type KnownDevice = {
  id: string;
  name: string;
  type: string;
  area: string;
};

export const knownDevicesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listKnownDevices: build.query<KnownDevice[], void>({
      query: () => "/api/v1/known-devices",
      providesTags: ["KnownDevices"],
    }),
  }),
});

export const { useListKnownDevicesQuery } = knownDevicesApi;
