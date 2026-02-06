// src/features/recommendations/RecommendationsDataGrid.tsx
import * as React from "react";
import { Button, Stack } from "@mui/material";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import { type GridColDef, type GridRowId } from "@mui/x-data-grid";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAuth } from "../../auth/AuthProvider";

import {
  selectRecommendationsItems,
  selectRecommendationsStatus,
  type Recommendation,
} from "./recommendationsDataSlice";

import {
  clearSelection,
  openPromote,
  selectRecommendationsFilterText,
  selectRecommendationsSelectedDeviceFingerprint,
  setSelectedDeviceFingerprint,
} from "./recommendationsSlice";

import { EntityDataGrid } from "../../components/EntityDataGrid";

function getRowId(r: Recommendation): GridRowId {
  return String(r.deviceFingerprint ?? "");
}

export function RecommendationsDataGrid() {
  const { t } = useTranslation(["common", "recommendations"]);
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const canPromote = auth.hasPermission("recommendation:promote");

  const items = useAppSelector(selectRecommendationsItems);
  const status = useAppSelector(selectRecommendationsStatus);

  const filterText = useAppSelector(selectRecommendationsFilterText);
  const selectedId = useAppSelector(
    selectRecommendationsSelectedDeviceFingerprint,
  );

  const loading = status === "loading";

  const selectedRow = React.useMemo(() => {
    const fp = String(selectedId ?? "").trim();
    if (!fp) return null;
    return (
      (items ?? []).find((r) => String(r.deviceFingerprint) === fp) ?? null
    );
  }, [items, selectedId]);

  const promoteDisabled = React.useMemo(() => {
    if (!canPromote) return true;
    if (!selectedRow) return true;

    // ✅ backend promote needs model + deviceId; here deviceId comes from row.id
    if (!selectedRow.model) return true;
    if (selectedRow.id === undefined || selectedRow.id === null) return true;

    return false;
  }, [canPromote, selectedRow]);

  const onPromote = () => {
    if (!selectedRow) return;
    if (promoteDisabled) return;
    dispatch(openPromote(selectedRow));
  };

  const columns = React.useMemo<GridColDef<Recommendation>[]>(
    () => [
      { field: "model", headerName: "Model", flex: 1, minWidth: 160 },
      { field: "id", headerName: "ID", flex: 0.7, minWidth: 130 },
      {
        field: "weight",
        headerName: "Weight",
        flex: 0.6,
        minWidth: 110,
        type: "number",
      },
      {
        field: "signalStrengthDbm",
        headerName: "RSSI",
        flex: 0.6,
        minWidth: 90,
        type: "number",
      },
      {
        field: "bucketCount",
        headerName: "Freq",
        flex: 0.7,
        minWidth: 100,
        type: "number",
      },
    ],
    [],
  );

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          size="small"
          variant="outlined"
          startIcon={<SystemUpdateAltIcon />}
          onClick={onPromote}
          disabled={promoteDisabled}
        >
          {t("common:actions.promote")}
        </Button>
      </Stack>

      <EntityDataGrid<Recommendation>
        rows={items ?? []}
        columns={columns}
        getRowId={getRowId}
        loading={loading}
        filterText={filterText}
        filterPredicate={(r, f) => {
          const hay = [
            r.model,
            r.id,
            r.deviceFingerprint,
            r.modelFingerprint,
            r.weight,
            r.bucketCount,
            r.signalStrengthDbm,
          ]
            .filter((x) => x !== null && x !== undefined)
            .join(" ")
            .toLowerCase();

          return hay.includes(f);
        }}
        selectedId={selectedId}
        onSelect={(id) => dispatch(setSelectedDeviceFingerprint(id))}
        onClear={() => dispatch(clearSelection())}
        initialPageSize={100}
        pageSizeOptions={[25, 50, 100]}
        sx={{ minWidth: 900 }}
      />
    </Stack>
  );
}
