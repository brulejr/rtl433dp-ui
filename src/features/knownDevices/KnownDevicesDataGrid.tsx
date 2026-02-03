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
  selectKnownDevice,
  selectKnownDevicesFilterText,
} from "./knownDevicesSlice";

function getRowId(m: KnownDevice): string {
  return String(m.id ?? "");
}

export function KnownDevicesDataGrid() {
  const { t } = useTranslation(["common", "knownDevices"]);
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectKnownDevicesItems);
  const status = useAppSelector(selectKnownDevicesStatus);

  const filterText = useAppSelector(selectKnownDevicesFilterText);

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
        flex: 0.6,
        minWidth: 140,
      },
      {
        field: "name",
        headerName: t("knownDevices:fields.name"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "type",
        headerName: t("knownDevices:fields.type"),
        flex: 0.6,
        minWidth: 140,
      },
      {
        field: "area",
        headerName: t("knownDevices:fields.area"),
        flex: 0.6,
        minWidth: 140,
      },
      {
        field: "time",
        headerName: t("knownDevices:fields.time"),
        flex: 1.2,
        minWidth: 140,
      },
    ],
    [],
  );

  const rows = React.useMemo(() => {
    const f = (filterText ?? "").trim().toLowerCase();
    if (!f) return items;

    return items.filter((m) => {
      const hay = [m.model, m.id].filter(Boolean).join(" ").toLowerCase();
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
      onRowClick={(params) => dispatch(selectKnownDevice(String(params.id)))}
      getRowClassName={(params) => {
        const stripe =
          params.indexRelativeToCurrentPage % 2 === 0
            ? "rtl433dp-row-even"
            : "rtl433dp-row-odd";

        return stripe;
      }}
      initialState={{
        pagination: { paginationModel: { pageSize: 50, page: 0 } },
      }}
      pageSizeOptions={[25, 50, 100]}
    />
  );
}
