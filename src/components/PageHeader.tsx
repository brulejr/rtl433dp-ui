// src/components/PageHeader.tsx
import React from "react";

type Props = {
  title: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
};

export function PageHeader({ title, actions, loading }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {actions}
        {loading && <span style={{ opacity: 0.7 }}>Loading…</span>}
      </div>
    </div>
  );
}
