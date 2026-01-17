// src/services/api/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";
import { config } from "../../app/config";

function normalizeBaseUrl(url: string | undefined) {
  const u = (url ?? "").trim();
  // allow empty meaning "same-origin"
  if (!u) return "";
  // remove trailing slash so "/api" + "/v1/models" doesn't become "/api//v1/models"
  return u.endsWith("/") ? u.slice(0, -1) : u;
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: normalizeBaseUrl(config.apiBaseUrl),
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).session.accessToken;
      if (token) headers.set("authorization", `Bearer ${token}`);
      headers.set("accept", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Models", "ModelDetails", "Recommendations", "KnownDevices"],
  endpoints: () => ({}),
});
