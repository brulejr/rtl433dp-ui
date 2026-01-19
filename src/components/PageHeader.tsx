import React from "react";

type PageHeaderProps = {
  title: React.ReactNode;
  actions?: React.ReactNode;
  isBusy?: boolean;
  busyText?: string;
};

export function PageHeader({
  title,
  actions,
  isBusy,
  busyText = "Loading…",
}: PageHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <h2 style={{ margin: 0 }}>{title}</h2>

      {actions ? (
        <div style={{ display: "flex", gap: 8 }}>{actions}</div>
      ) : null}

      {isBusy ? <span style={{ opacity: 0.7 }}>{busyText}</span> : null}
    </div>
  );
}
