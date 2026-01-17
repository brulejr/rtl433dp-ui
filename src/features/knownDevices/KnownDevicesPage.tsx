import React from "react";
import { useListKnownDevicesQuery } from "./knownDevicesApi";

export function KnownDevicesPage() {
  const {
    data: devices = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useListKnownDevicesQuery();

  if (isLoading) {
    return <div style={{ padding: 16 }}>Loading...</div>;
  }

  if (isError) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>
          Failed to load known devices
        </div>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(error, null, 2)}
        </pre>
        <button onClick={() => refetch()} style={{ marginTop: 12 }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Known Devices</h2>

        <button onClick={() => refetch()} style={{ padding: "6px 10px" }}>
          Refresh
        </button>

        {/* ✅ isFetching is *background* fetching; do NOT block the page on it */}
        {isFetching ? (
          <span style={{ opacity: 0.7, fontSize: 12 }}>Refreshing…</span>
        ) : null}
      </div>

      <div style={{ marginTop: 12 }}>
        {devices.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No known devices found.</div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 8,
            }}
          >
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Area</th>
                <th style={th}>Type</th>
                <th style={th}>Model</th>
                <th style={th}>Device ID</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d, idx) => (
                <tr
                  key={d.id ?? `${d.model ?? "m"}:${d.deviceId ?? "id"}:${idx}`}
                >
                  <td style={td}>{String(d.name ?? "")}</td>
                  <td style={td}>{String(d.area ?? "")}</td>
                  <td style={td}>{String(d.deviceType ?? "")}</td>
                  <td style={td}>{String(d.model ?? "")}</td>
                  <td style={td}>{String(d.deviceId ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid #ddd",
  fontWeight: 600,
  fontSize: 13,
};

const td: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  fontSize: 13,
};
