import React from "react";

type ErrorPanelProps = {
  message?: React.ReactNode;
  error?: unknown;
};

export function ErrorPanel({
  message = "Something went wrong.",
  error,
}: ErrorPanelProps) {
  return (
    <div style={{ marginTop: 12, color: "crimson" }}>
      <div>{message}</div>
      {error !== undefined ? (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
