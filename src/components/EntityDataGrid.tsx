// src/components/EntityDataGrid.tsx
import * as React from "react";
import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
  type GridRowId,
} from "@mui/x-data-grid";

export type EntityDataGridProps<T extends object> = {
  rows: T[];
  columns: GridColDef<T>[];

  /**
   * Canonical row id
   */
  getRowId: (row: T) => GridRowId;

  /**
   * Loading state for the grid
   */
  loading?: boolean;

  /**
   * Optional filter text + predicate.
   * If provided, EntityDataGrid will compute filtered rows internally.
   */
  filterText?: string;
  filterPredicate?: (row: T, normalizedFilter: string) => boolean;

  /**
   * Manual (Redux-driven) selection:
   * - selectedId is the currently selected row id (stringified compare)
   * - onSelect toggles selection (called with clicked id)
   * - onClear clears selection
   */
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onClear?: () => void;

  /**
   * Pagination defaults
   */
  initialPageSize?: number;
  pageSizeOptions?: number[];

  /**
   * Optional: allow callers to augment DataGrid props/sx
   */
  sx?: DataGridProps<T>["sx"];
  dataGridProps?: Omit<
    DataGridProps<T>,
    | "rows"
    | "columns"
    | "getRowId"
    | "loading"
    | "onRowClick"
    | "onCellKeyDown"
    | "getRowClassName"
    | "rowSelection"
  >;
};

export function EntityDataGrid<T extends object>({
  rows,
  columns,
  getRowId,
  loading = false,
  filterText,
  filterPredicate,
  selectedId,
  onSelect,
  onClear,
  initialPageSize = 50,
  pageSizeOptions = [25, 50, 100],
  sx,
  dataGridProps,
}: EntityDataGridProps<T>) {
  const effectiveRows = React.useMemo(() => {
    const f = (filterText ?? "").trim().toLowerCase();
    if (!f || !filterPredicate) return rows ?? [];
    return (rows ?? []).filter((r) => filterPredicate(r, f));
  }, [rows, filterText, filterPredicate]);

  const selectedKeyString = String(selectedId ?? "");

  return (
    <DataGrid
      rows={effectiveRows}
      columns={columns}
      getRowId={getRowId}
      loading={loading}
      // ✅ We do manual selection; do not use DataGrid's selection model
      rowSelection={false as any}
      disableRowSelectionOnClick
      hideFooterSelectedRowCount
      onRowClick={(params) => {
        if (!onSelect) return;

        const clickedId = String(params.id);
        if (clickedId === selectedKeyString) {
          onClear?.();
        } else {
          onSelect(clickedId);
        }
      }}
      onCellKeyDown={(_params, event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClear?.();
        }
      }}
      getRowClassName={(params) => {
        const stripe =
          params.indexRelativeToCurrentPage % 2 === 0
            ? "rtl433dp-row-even"
            : "rtl433dp-row-odd";

        const selected =
          selectedKeyString && String(params.id) === selectedKeyString
            ? " rtl433dp-row-selected"
            : "";

        return `${stripe}${selected}`;
      }}
      sx={{
        "& .rtl433dp-row-selected": {
          backgroundColor: "action.selected",
        },
        "& .rtl433dp-row-selected:hover": {
          backgroundColor: "action.selected",
        },
        ...sx,
      }}
      initialState={{
        pagination: { paginationModel: { pageSize: initialPageSize, page: 0 } },
        ...(dataGridProps?.initialState ?? {}),
      }}
      pageSizeOptions={pageSizeOptions}
      {...dataGridProps}
    />
  );
}
