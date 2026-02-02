// src/features/knownDevices/KnownDevicesPage.tsx
import * as React from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchKnownDevices,
  selectKnownDevicesItems,
  selectKnownDevicesStatus,
  type KnownDevice,
} from "./knownDevicesDataSlice";
import {
  clearSelection,
  selectKnownDevice,
  selectKnownDevicesFilterText,
  selectKnownDevicesSelectedKey,
  setFilterText,
} from "./knownDevicesSlice";

import { DataGridFilter } from "../../components/DataGridFilter";

function getRowKey(d: KnownDevice): string {
  if (d.key) return d.key;
  const model = (d.model ?? "").toString();
  const id = (d.id ?? "").toString();
  const fallback = `${model}:${id}`;
  return fallback !== ":" ? fallback : JSON.stringify(d);
}

export function KnownDevicesPage() {
  const { t } = useTranslation(["common", "knownDevices"]);
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectKnownDevicesItems);
  const status = useAppSelector(selectKnownDevicesStatus);

  const filterText = useAppSelector(selectKnownDevicesFilterText);
  const selectedKey = useAppSelector(selectKnownDevicesSelectedKey);

  const loading = status === "loading";

  React.useEffect(() => {
    dispatch(fetchKnownDevices());
  }, [dispatch]);

  const rows = React.useMemo(() => {
    const f = (filterText ?? "").trim().toLowerCase();
    if (!f) return items;

    return items.filter((d) => {
      const hay = [
        d.model,
        d.id,
        d.name,
        d.deviceType,
        d.area,
        d.lastSeen,
        d.rssi,
        d.freq,
      ]
        .filter((x) => x !== null && x !== undefined)
        .join(" ")
        .toLowerCase();

      return hay.includes(f);
    });
  }, [items, filterText]);

  // ✅ Auto-clear selection if it’s no longer in the visible rows (e.g., filtered out)
  React.useEffect(() => {
    if (!selectedKey) return;

    const visibleIds = new Set(rows.map(getRowKey));
    if (!visibleIds.has(String(selectedKey))) {
      dispatch(clearSelection());
    }
  }, [dispatch, rows, selectedKey]);

  const columns = React.useMemo<GridColDef<KnownDevice>[]>(
    () => [
      {
        field: "model",
        headerName: t("knownDevices:fields.model"),
        flex: 1,
        minWidth: 160,
      },
      {
        field: "deviceId",
        headerName: t("knownDevices:fields.deviceId"),
        flex: 1,
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
        flex: 1,
        minWidth: 140,
      },
      {
        field: "area",
        headerName: t("knownDevices:fields.area"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "time",
        headerName: t("knownDevices:fields.time"),
        flex: 1,
        minWidth: 160,
      },
    ],
    [t],
  );

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="h4">Known Devices</Typography>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => dispatch(fetchKnownDevices())}
            sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
          >
            {t("common:actions.refresh")}
          </Button>
        </Stack>

        <Paper sx={{ p: 2, width: "100%", overflowX: "auto" }}>
          <Stack direction="column" spacing={2} alignItems="stretch">
            <DataGridFilter
              canFilter={true}
              filterText={filterText}
              onChange={(e) => dispatch(setFilterText(e.target.value))}
            />

            <Box sx={{ width: "100%", height: 420, minWidth: 900 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={getRowKey}
                loading={loading}
                // ✅ Keep DataGrid’s selection system out of it (we do our own “selected” highlight)
                rowSelection={false}
                disableRowSelectionOnClick
                hideFooterSelectedRowCount
                onRowClick={(params) =>
                  dispatch(selectKnownDevice(String(params.id)))
                }
                getRowClassName={(params) =>
                  String(params.id) === String(selectedKey ?? "")
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
                  pagination: { paginationModel: { pageSize: 100, page: 0 } },
                }}
                pageSizeOptions={[25, 50, 100]}
              />
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
