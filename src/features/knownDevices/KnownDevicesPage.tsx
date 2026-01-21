// src/features/knownDevices/KnownDevicesPage.tsx
import * as React from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";

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

function getRowKey(d: KnownDevice): string {
  if (d.key) return d.key;
  const model = (d.model ?? "").toString();
  const id = (d.id ?? "").toString();
  const fallback = `${model}:${id}`;
  return fallback !== ":" ? fallback : JSON.stringify(d);
}

export function KnownDevicesPage() {
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
      { field: "model", headerName: "Model", flex: 1, minWidth: 160 },
      { field: "deviceId", headerName: "Device ID", flex: 1, minWidth: 140 },
      { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
      { field: "type", headerName: "Type", flex: 1, minWidth: 140 },
      { field: "area", headerName: "Area", flex: 1, minWidth: 140 },
      { field: "time", headerName: "Last Seen", flex: 1, minWidth: 160 },
    ],
    [],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Known Devices</Typography>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => dispatch(fetchKnownDevices())}
        >
          Refresh
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Filter"
          value={filterText}
          onChange={(e) => dispatch(setFilterText(e.target.value))}
          fullWidth
        />
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ width: "100%", height: 420, minWidth: 0 }}>
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
      </Paper>
    </Box>
  );
}
