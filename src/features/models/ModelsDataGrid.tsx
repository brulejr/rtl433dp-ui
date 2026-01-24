// src/features/models/ModelsDataGrid.tsx
import * as React from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

import {
  selectModelsItems,
  selectModelsStatus,
  type ModelSummary,
} from "./modelsDataSlice";

import {
  selectModel,
  selectModelsFilterText,
  selectModelsSelectedFingerprint,
} from "./modelsSlice";

function getRowId(m: ModelSummary): string {
  return String(m.fingerprint ?? "");
}

export function ModelsDataGrid() {
  const { t } = useTranslation(["common"]);
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectModelsItems);
  const status = useAppSelector(selectModelsStatus);

  const filterText = useAppSelector(selectModelsFilterText);

  const selectedFingerprint = useAppSelector(selectModelsSelectedFingerprint);

  const loading = status === "loading";

  const columns = React.useMemo<GridColDef<ModelSummary>[]>(
    () => [
      {
        field: "model",
        headerName: t("models:fields.modelName"),
        flex: 1,
        minWidth: 220,
      },
      {
        field: "category",
        headerName: t("models:fields.category"),
        flex: 0.6,
        minWidth: 160,
      },
      {
        field: "fingerprint",
        headerName: t("models:fields.fingerprint"),
        flex: 1,
        minWidth: 280,
      },
    ],
    [],
  );

  const rows = React.useMemo(() => {
    const f = (filterText ?? "").trim().toLowerCase();
    if (!f) return items;

    return items.filter((m) => {
      const hay = [m.model, m.fingerprint]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(f);
    });
  }, [items, filterText]);

  return (
    <DataGrid
      rows={rows ?? []}
      columns={columns}
      getRowId={getRowId}
      loading={loading}
      // DO NOT use DataGrid selection system at all
      rowSelection={false as any}
      disableRowSelectionOnClick
      hideFooterSelectedRowCount
      onRowClick={(params) => dispatch(selectModel(String(params.id)))}
      getRowClassName={(params) =>
        String(params.id) === String(selectedFingerprint ?? "")
          ? "rtl433dp-row-selected"
          : ""
      }
      sx={{
        "& .rtl433dp-row-selected": {
          backgroundColor: "action.selected",
        },
        "& .rtl433dp-row-selected:hover": {
          backgroundColor: "action.selected",
        },
      }}
      initialState={{
        pagination: { paginationModel: { pageSize: 50, page: 0 } },
      }}
      pageSizeOptions={[25, 50, 100]}
    />
  );
}
