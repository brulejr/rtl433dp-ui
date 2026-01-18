// src/services/api/baseApi.ts
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";
import { config } from "../../app/config";
import { signedOut } from "../../features/session/sessionSlice";

function normalizeBaseUrl(url: string | undefined) {
  const u = (url ?? "").trim();
  if (!u) return "";
  return u.endsWith("/") ? u.slice(0, -1) : u;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: normalizeBaseUrl(config.apiBaseUrl),
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).session.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    headers.set("accept", "application/json");
    return headers;
  },
});

// Central place to react to auth failures (401)
const baseQueryWith401: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      // Clear session; ProtectedRoute should do the redirect behavior.
      api.dispatch(signedOut());
    }

    return result;
  };

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWith401,
  tagTypes: ["Models", "ModelDetails", "Recommendations", "KnownDevices"],
  endpoints: () => ({}),
});
