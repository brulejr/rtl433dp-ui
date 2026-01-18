// src/components/DataTable.tsx
import React from "react";

export type DataTableColumn = {
  key: string;
  header: React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string | number;
};

type Props = {
  columns: DataTableColumn[];
  children: React.ReactNode; // <tr>...</tr> rows
};

export function DataTable({ columns, children }: Props) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              style={{
                textAlign: c.align ?? "left",
                borderBottom: "1px solid #ddd",
                padding: 8,
                width: c.width,
              }}
            >
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export function DataTableCell({
  align,
  children,
}: {
  align?: "left" | "right" | "center";
  children: React.ReactNode;
}) {
  return (
    <td
      style={{
        padding: 8,
        borderBottom: "1px solid #f0f0f0",
        textAlign: align ?? "left",
      }}
    >
      {children}
    </td>
  );
}
