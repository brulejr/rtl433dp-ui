import { baseApi } from "../../services/api/baseApi";

const KNOWN_DEVICES_PATH = "/v1/known-devices"; // baseApi already contributes "/api"

export type KnownDevice = {
  id?: string;

  name?: string;
  area?: string;
  deviceType?: string;

  model?: string;
  deviceId?: string | number;

  [key: string]: unknown;
};

type ApiEnvelope<T> = {
  content: T;
  status?: number;
  timestamp?: string;
  messages?: string[];
};

export const knownDevicesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listKnownDevices: build.query<KnownDevice[], void>({
      query: () => ({
        url: KNOWN_DEVICES_PATH,
        method: "GET",
      }),

      // ✅ Backend commonly returns { content: [...] } in this app
      transformResponse: (raw: ApiEnvelope<KnownDevice[]> | KnownDevice[]) => {
        if (Array.isArray(raw)) return raw;
        return raw?.content ?? [];
      },

      providesTags: (result) =>
        result
          ? [
              { type: "KnownDevices" as const, id: "LIST" },
              ...result.map((d) => ({
                type: "KnownDevices" as const,
                id:
                  (d.id ??
                    `${d.model ?? "unknown"}:${d.deviceId ?? "unknown"}`) as string,
              })),
            ]
          : [{ type: "KnownDevices" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useListKnownDevicesQuery } = knownDevicesApi;
