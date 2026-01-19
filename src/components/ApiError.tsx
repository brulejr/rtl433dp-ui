// src/components/ApiError.tsx
import React from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

type Props = {
  title?: string;
  error: FetchBaseQueryError | SerializedError | unknown;
};

function isFetchBaseQueryError(e: unknown): e is FetchBaseQueryError {
  return typeof e === "object" && e !== null && "status" in e;
}

function safeJson(v: unknown) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export function ApiError({ title, error }: Props) {
  let headline = title ?? "Something went wrong.";
  let details: unknown = error;

  if (isFetchBaseQueryError(error)) {
    // RTKQ fetchBaseQuery error format
    const status = error.status;
    headline = `${headline} (HTTP ${status})`;
    details = error.data ?? error;
  } else if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as any).message === "string"
  ) {
    details = (error as any).message;
  }

  return (
    <div style={{ marginTop: 12, color: "crimson" }}>
      <div style={{ fontWeight: 600 }}>{headline}</div>
      <pre style={{ whiteSpace: "pre-wrap", margin: "8px 0 0 0" }}>
        {safeJson(details)}
      </pre>
    </div>
  );
}
