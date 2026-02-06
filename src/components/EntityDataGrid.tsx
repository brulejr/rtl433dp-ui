// src/components/EntityDataGrid.tsx
import * as React from "react";
import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
  type GridRowId,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";

export type EntityDataGridProps<T extends object> = {
  rows: T[];
  columns: GridColDef<T>[];
  getRowId: (row: T) => GridRowId;

  loading?: boolean;

  filterText?: string;
  filterPredicate?: (row: T, normalizedFilter: string) => boolean;

  // ✅ Redux-owned single selection
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onClear?: () => void;

  initialPageSize?: number;
  pageSizeOptions?: number[];

  sx?: DataGridProps<T>["sx"];
  dataGridProps?: Omit<
    DataGridProps<T>,
    | "rows"
    | "columns"
    | "getRowId"
    | "loading"
    | "rowSelection"
    | "rowSelectionModel"
    | "onRowSelectionModelChange"
    | "getRowClassName"
    | "onCellKeyDown"
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

  // ✅ MUI X v8 selection model shape: { type, ids: Set }
  const rowSelectionModel = React.useMemo<GridRowSelectionModel>(() => {
    const id = String(selectedId ?? "").trim();
    return {
      type: "include",
      ids: id ? new Set<GridRowId>([id]) : new Set<GridRowId>(),
    };
  }, [selectedId]);

  const selectedKeyString = String(selectedId ?? "");

  return (
    <DataGrid
      rows={effectiveRows}
      columns={columns}
      getRowId={getRowId}
      loading={loading}
      rowSelection
      // ✅ keep selection fully controlled by Redux
      rowSelectionModel={rowSelectionModel}
      onRowSelectionModelChange={(model) => {
        // model is { type: "include" | "exclude", ids: Set<GridRowId> }
        const ids =
          model?.ids instanceof Set ? model.ids : new Set<GridRowId>();
        const first = ids.size ? Array.from(ids)[0] : undefined;
        const next = first !== undefined && first !== null ? String(first) : "";

        if (!next) onClear?.();
        else onSelect?.(next);
      }}
      // ✅ single selection UX
      disableMultipleRowSelection
      checkboxSelection={false}
      hideFooterSelectedRowCount
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
        "& .MuiDataGrid-columnSeparator": { display: "none" },
        "& .rtl433dp-row-selected": { backgroundColor: "action.selected" },
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
