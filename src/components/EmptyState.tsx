import React from "react";

type EmptyStateProps = {
  children: React.ReactNode;
};

export function EmptyState({ children }: EmptyStateProps) {
  return <div style={{ marginTop: 12 }}>{children}</div>;
}
