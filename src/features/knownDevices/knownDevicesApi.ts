import { baseApi } from "../../services/api/baseApi";

const KNOWN_DEVICES_PATH = "/v1/known-devices"; // baseApi baseUrl should contribute "/api" if you configured it that way

export type KnownDevice = {
  id?: string;

  name?: string;
  area?: string;
  deviceType?: string;

  model?: string;
  deviceId?: string | number;

  [key: string]: unknown;
};

/**
 * Backend responses in this project commonly look like:
 * { content: T, status: number, timestamp: string, messages: string[] }
 */
export type ApiEnvelope<T> = {
  content: T;
  status?: number;
  timestamp?: string;
  messages?: string[];
};

export const knownDevicesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listKnownDevices: build.query<ApiEnvelope<KnownDevice[]>, void>({
      query: () => ({
        url: KNOWN_DEVICES_PATH,
        method: "GET",
      }),

      providesTags: (result) => {
        const devices = result?.content ?? [];
        return devices.length
          ? [
              { type: "KnownDevices" as const, id: "LIST" },
              ...devices.map((d) => ({
                type: "KnownDevices" as const,
                id:
                  (d.id ??
                    `${d.model ?? "unknown"}:${d.deviceId ?? "unknown"}`) as string,
              })),
            ]
          : [{ type: "KnownDevices" as const, id: "LIST" }];
      },
    }),
  }),
  overrideExisting: false,
});

export const { useListKnownDevicesQuery } = knownDevicesApi;
