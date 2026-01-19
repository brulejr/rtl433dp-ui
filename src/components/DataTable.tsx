import React from "react";

export type DataColumn<Row> = {
  header: React.ReactNode;
  width?: string | number;
  align?: "left" | "right" | "center";
  render: (row: Row, idx: number) => React.ReactNode;
};

type DataTableProps<Row> = {
  columns: Array<DataColumn<Row>>;
  rows: Row[];
  keyForRow?: (row: Row, idx: number) => string;
};

export function DataTable<Row>({
  columns,
  rows,
  keyForRow,
}: DataTableProps<Row>) {
  return (
    <div style={{ marginTop: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
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

        <tbody>
          {rows.map((row, idx) => (
            <tr key={keyForRow ? keyForRow(row, idx) : String(idx)}>
              {columns.map((c, colIdx) => (
                <td
                  key={colIdx}
                  style={{
                    padding: 8,
                    borderBottom: "1px solid #f0f0f0",
                    textAlign: c.align ?? "left",
                    verticalAlign: "top",
                  }}
                >
                  {c.render(row, idx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
