// src/features/knownDevices/KnownDevicesDataGrid.tsx
import * as React from "react";
import { type GridColDef } from "@mui/x-data-grid";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

import {
  selectKnownDevicesItems,
  selectKnownDevicesStatus,
  type KnownDevice,
} from "./knownDevicesDataSlice";
import {
  clearSelection,
  selectKnownDevice,
  selectKnownDevicesFilterText,
  selectKnownDevicesSelectedKey,
} from "./knownDevicesSlice";

import { EntityDataGrid } from "../../components/EntityDataGrid";

function getRowId(d: KnownDevice): string {
  return String(d.fingerprint);
}

function formatZuluNoMillis(v: unknown): string {
  if (!v) return "";
  const ms = Date.parse(String(v));
  if (!Number.isFinite(ms)) return String(v);
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function KnownDevicesDataGrid() {
  const { t } = useTranslation(["common", "knownDevices"]);
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectKnownDevicesItems);
  const status = useAppSelector(selectKnownDevicesStatus);
  const filterText = useAppSelector(selectKnownDevicesFilterText);
  const selectedKey = useAppSelector(selectKnownDevicesSelectedKey);

  const loading = status === "loading";

  const columns = React.useMemo<GridColDef<KnownDevice>[]>(
    () => [
      {
        field: "model",
        headerName: t("knownDevices:fields.model"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "deviceId",
        headerName: t("knownDevices:fields.deviceId"),
        flex: 0.7,
        minWidth: 140,
      },
      {
        field: "name",
        headerName: t("knownDevices:fields.name"),
        flex: 1,
        minWidth: 160,
      },
      {
        field: "type",
        headerName: t("knownDevices:fields.type"),
        flex: 0.7,
        minWidth: 140,
      },
      {
        field: "area",
        headerName: t("knownDevices:fields.area"),
        flex: 0.7,
        minWidth: 140,
      },
      {
        field: "time",
        headerName: t("knownDevices:fields.time"),
        flex: 1.2,
        minWidth: 180,
        valueFormatter: (value) => formatZuluNoMillis(value),
      },
    ],
    [t],
  );

  return (
    <EntityDataGrid<KnownDevice>
      rows={items ?? []}
      columns={columns}
      getRowId={getRowId}
      loading={loading}
      filterText={filterText}
      filterPredicate={(d, f) => {
        const hay = [
          d.model,
          d.deviceId,
          d.fingerprint,
          d.name,
          d.type,
          d.area,
          d.time,
        ]
          .filter((x) => x !== null && x !== undefined)
          .join(" ")
          .toLowerCase();

        return hay.includes(f);
      }}
      selectedId={selectedKey}
      onSelect={(id) => dispatch(selectKnownDevice(id))}
      onClear={() => dispatch(clearSelection())}
      initialPageSize={50}
      pageSizeOptions={[25, 50, 100]}
    />
  );
}
