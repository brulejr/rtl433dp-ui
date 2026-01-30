// src/feature/models/SensorsCard.tsx
import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

import DoorFrontIcon from "@mui/icons-material/DoorFront";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimelineIcon from "@mui/icons-material/Timeline";
import SensorsIcon from "@mui/icons-material/Sensors";
import RadioIcon from "@mui/icons-material/Radio";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import BugReportIcon from "@mui/icons-material/BugReport";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

import { type ModelDetails } from "./modelsDataSlice";

import { setUpdateSensorsOpen } from "./modelsSlice";

function matchesQuickFilter(row: SensorRow, q: string): boolean {
  if (!q) return true;
  const hay = [row.name, row.type, row.classname, row.friendlyName ?? ""]
    .map(normalize)
    .join(" ");
  return hay.includes(q);
}

function normalize(v: unknown): string {
  return String(v ?? "")
    .toLowerCase()
    .trim();
}

function classIcon(classname: string) {
  const key = normalize(classname);

  if (key.includes("door")) return <DoorFrontIcon fontSize="small" />;
  if (key.includes("battery")) return <BatteryFullIcon fontSize="small" />;
  if (key.includes("tamper")) return <ReportProblemIcon fontSize="small" />;
  if (key.includes("problem") || key.includes("exception"))
    return <BugReportIcon fontSize="small" />;
  if (key.includes("timestamp") || key.includes("time"))
    return <AccessTimeIcon fontSize="small" />;
  if (key.includes("temperature") || key.includes("humidity"))
    return <TimelineIcon fontSize="small" />;
  if (key.includes("frequency") || key === "freq")
    return <RadioIcon fontSize="small" />;
  if (
    key.includes("signal_strength") ||
    key.includes("rssi") ||
    key.includes("snr") ||
    key.includes("noise")
  )
    return <NetworkCheckIcon fontSize="small" />;
  if (key.includes("sensor")) return <SensorsIcon fontSize="small" />;

  return <SensorsIcon fontSize="small" />;
}

function TypeChip({ value }: { value: string }) {
  const v = String(value ?? "");
  const isBinary = v.toUpperCase() === "BINARY";
  const isAnalog = v.toUpperCase() === "ANALOG";

  return (
    <Chip
      size="small"
      label={v || "—"}
      variant="outlined"
      sx={{
        fontWeight: 700,
        height: 22,
        "& .MuiChip-label": { px: 0.8, py: 0 },
        ...(isBinary && { borderWidth: 2 }),
        ...(isAnalog && { borderStyle: "dashed" }),
      }}
    />
  );
}

type SensorRow = {
  name: string;
  type: string;
  classname: string;
  friendlyName?: string;
};

type Props = {
  canUpdate?: boolean;
  modelDetails: ModelDetails | undefined;
};

export function SensorsCard({ canUpdate, modelDetails }: Props) {
  const { t } = useTranslation(["common"]);
  const dispatch = useAppDispatch();

  const [sensorFilter, setSensorFilter] = React.useState("");

  const cardSx = React.useMemo(
    () => ({
      p: 2,
      borderRadius: 2.5,
      bgcolor: "background.paper",
      boxShadow: 1,
    }),
    [],
  );

  const columns = React.useMemo<GridColDef<SensorRow>[]>(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1.0, // ✅ ~25% reduction vs 1.35
        minWidth: 135, // ✅ tighter to free room for Class
        sortable: true,
        renderCell: (params) => {
          const row = params.row as SensorRow;
          const friendly = row.friendlyName?.trim();

          return (
            <Stack sx={{ py: 0.5, minWidth: 0, width: "100%" }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600 }}
                noWrap
                title={row.name}
              >
                {row.name}
              </Typography>

              {!!friendly && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  title={friendly}
                >
                  {friendly}
                </Typography>
              )}
            </Stack>
          );
        },
      },
      {
        field: "type",
        headerName: "Type",
        flex: 0.55,
        minWidth: 95,
        maxWidth: 120,
        sortable: true,
        renderCell: (params) => (
          <Box
            sx={{
              pt: 0.5,
              display: "flex",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <TypeChip value={params.value as string} />
          </Box>
        ),
      },
      {
        field: "classname",
        headerName: "Class",
        flex: 1.25, // ✅ give Class more room
        minWidth: 180, // ✅ helps a lot in the drawer
        sortable: true,
        renderCell: (params) => {
          const v = String(params.value ?? "—");
          return (
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
              sx={{ pt: 0.5, minWidth: 0 }}
            >
              {classIcon(v)}
              <Tooltip title={v} placement="top">
                <Typography
                  variant="body2"
                  sx={{ fontFamily: "monospace" }}
                  noWrap
                >
                  {v}
                </Typography>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [],
  );

  return (
    <Paper variant="outlined" sx={cardSx}>
      <Stack spacing={1.25}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t("models:fields.sensors")}
            </Typography>

            {(() => {
              const all = ((modelDetails as any).sensors ?? []) as any[];
              return (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  · {all.length}
                </Typography>
              );
            })()}
          </Stack>

          {canUpdate && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<SystemUpdateAltIcon />}
              onClick={() => dispatch(setUpdateSensorsOpen(true))}
            >
              {t("models:details.updateSensors")}
            </Button>
          )}
        </Stack>

        <TextField
          size="small"
          value={sensorFilter}
          onChange={(e) => setSensorFilter(e.target.value)}
          placeholder="Filter sensors…"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: sensorFilter ? (
              <InputAdornment position="end">
                <Tooltip title="Clear" placement="top">
                  <IconButton
                    size="small"
                    onClick={() => setSensorFilter("")}
                    aria-label="Clear filter"
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ) : undefined,
          }}
        />

        <Divider />

        {(() => {
          const all = (((modelDetails as any).sensors ?? []) as SensorRow[])
            .map((s) => ({
              name: s?.name ?? "",
              type: s?.type ?? "",
              classname: (s as any)?.classname ?? "",
              friendlyName: (s as any)?.friendlyName,
            }))
            .filter((s) => s.name.length > 0);

          all.sort((a, b) => a.name.localeCompare(b.name));

          const q = normalize(sensorFilter);
          const sensors = q ? all.filter((r) => matchesQuickFilter(r, q)) : all;

          if (all.length === 0) {
            return (
              <Typography variant="body2" color="text.secondary">
                No sensors defined for this model.
              </Typography>
            );
          }

          return (
            <Stack spacing={1}>
              {q && (
                <Typography variant="caption" color="text.secondary">
                  Showing {sensors.length} of {all.length}
                </Typography>
              )}

              {sensors.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No sensors match “{sensorFilter}”.
                </Typography>
              ) : (
                <Box
                  sx={{
                    height: 340,
                    maxHeight: "min(340px, calc(100vh - 520px))",
                  }}
                >
                  <DataGrid
                    rows={sensors}
                    columns={columns}
                    getRowId={(row) => row.name}
                    getRowClassName={(params) =>
                      params.indexRelativeToCurrentPage % 2 === 0
                        ? "even"
                        : "odd"
                    }
                    density="compact"
                    getRowHeight={() => 52}
                    headerHeight={40}
                    disableRowSelectionOnClick
                    hideFooter
                    disableColumnMenu
                    disableColumnFilter
                    disableColumnSelector
                    disableDensitySelector
                    sx={{
                      border: 0,
                      "& .MuiDataGrid-columnHeaders": {
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        bgcolor: "background.paper",
                        borderBottom: 1,
                        borderColor: "divider",
                      },
                      "& .MuiDataGrid-columnHeaderTitle": {
                        fontWeight: 700,
                      },
                      "& .MuiDataGrid-columnSeparator": {
                        display: "none",
                      },
                      "& .MuiDataGrid-virtualScroller": {
                        zIndex: 0,
                        overflowX: "hidden",
                      },
                      "& .MuiDataGrid-cell": {
                        py: 0.5,
                        alignItems: "flex-start !important",
                      },
                      "& .MuiDataGrid-row.odd": {
                        bgcolor: "action.hover",
                      },
                      "& .MuiDataGrid-row.odd:hover": {
                        bgcolor: "action.selected",
                      },
                    }}
                  />
                </Box>
              )}
            </Stack>
          );
        })()}
      </Stack>
    </Paper>
  );
}
