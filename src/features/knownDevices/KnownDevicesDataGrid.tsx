// src/features/knownDevices/KnownDevicesDataGrid.tsx
import * as React from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

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

  const rows = React.useMemo(() => {
    const f = (filterText ?? "").trim().toLowerCase();
    if (!f) return items;

    return items.filter((d) => {
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
      onRowClick={(params) => {
        const clickedId = String(params.id);
        if (clickedId === String(selectedKey ?? "")) {
          dispatch(clearSelection());
        } else {
          dispatch(selectKnownDevice(clickedId));
        }
      }}
      onCellKeyDown={(_params, event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          dispatch(clearSelection());
        }
      }}
      getRowClassName={(params) => {
        const stripe =
          params.indexRelativeToCurrentPage % 2 === 0
            ? "rtl433dp-row-even"
            : "rtl433dp-row-odd";

        const selected =
          String(params.id) === String(selectedKey ?? "")
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
      }}
      initialState={{
        pagination: { paginationModel: { pageSize: 50, page: 0 } },
      }}
      pageSizeOptions={[25, 50, 100]}
    />
  );
}
