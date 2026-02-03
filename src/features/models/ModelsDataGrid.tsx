// src/features/models/ModelsDataGrid.tsx
import * as React from "react";
import { type GridColDef } from "@mui/x-data-grid";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

import {
  selectModelsItems,
  selectModelsStatus,
  type ModelSummary,
} from "./modelsDataSlice";

import {
  clearSelection,
  selectModel,
  selectModelsFilterText,
  selectModelsSelectedFingerprint,
} from "./modelsSlice";

import { EntityDataGrid } from "../../components/EntityDataGrid";

function getRowId(m: ModelSummary): string {
  return String(m.fingerprint ?? "");
}

export function ModelsDataGrid() {
  const { t } = useTranslation(["common", "models"]);
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
    [t],
  );

  return (
    <EntityDataGrid<ModelSummary>
      rows={items ?? []}
      columns={columns}
      getRowId={getRowId}
      loading={loading}
      filterText={filterText}
      filterPredicate={(m, f) => {
        const hay = [m.model, m.fingerprint]
          .filter((x) => x !== null && x !== undefined)
          .join(" ")
          .toLowerCase();
        return hay.includes(f);
      }}
      selectedId={selectedFingerprint}
      onSelect={(id) => dispatch(selectModel(id))}
      onClear={() => dispatch(clearSelection())}
      initialPageSize={50}
      pageSizeOptions={[25, 50, 100]}
    />
  );
}
