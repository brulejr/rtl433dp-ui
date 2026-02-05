// src/features/recommendations/RecommendationsDataGrid.tsx
import * as React from "react";
import { Button } from "@mui/material";
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
      {
        field: "lastSeen",
        headerName: "Last Seen",
        flex: 1,
        minWidth: 160,
        valueGetter: (_value, row) => row?.lastSeen ?? row?.time ?? "",
      },

      {
        field: "__actions",
        headerName: "",
        sortable: false,
        filterable: false,
        width: 170,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          if (!canPromote) return null;

          const r = params.row as Recommendation;

          // promote requires model + deviceId (backend expects deviceId)
          const disabled =
            !r.model || r.deviceId === undefined || r.deviceId === null;

          return (
            <Button
              size="small"
              variant="outlined"
              startIcon={<SystemUpdateAltIcon />}
              onClick={() => dispatch(openPromote(r))}
              disabled={disabled}
            >
              {t("common:actions.promote")}
            </Button>
          );
        },
      },
    ],
    [canPromote, dispatch, t],
  );

  return (
    <EntityDataGrid<Recommendation>
      rows={items ?? []}
      columns={columns}
      getRowId={getRowId}
      loading={loading}
      filterText={filterText}
      filterPredicate={(r, f) => {
        const hay = [
          r.source,
          r.model,
          r.id,
          r.deviceId,
          r.deviceFingerprint,
          r.weight,
          r.bucketCount,
          r.signalStrengthDbm,
          r.lastSeen,
          r.time,
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
      dataGridProps={{
        initialState: {
          sorting: { sortModel: [{ field: "weight", sort: "desc" }] },
        },
        onRowDoubleClick: canPromote
          ? (params) => dispatch(openPromote(params.row as Recommendation))
          : undefined,
      }}
    />
  );
}
