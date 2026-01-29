// src/features/models/ModelDetailsPage.tsx
import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

import DoorFrontIcon from "@mui/icons-material/DoorFront";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimelineIcon from "@mui/icons-material/Timeline";
import SensorsIcon from "@mui/icons-material/Sensors";
import RadioIcon from "@mui/icons-material/Radio";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import BugReportIcon from "@mui/icons-material/BugReport";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

import {
  fetchModelDetails,
  selectModelDetails,
  selectModelDetailsError,
  selectModelDetailsStatus,
  type ModelDetails,
} from "./modelsDataSlice";

import { setUpdateSensorsOpen } from "./modelsSlice";
import { SensorUpdateDialog } from "./SensorUpdateDialog";
import {
  JsonStructureTreeView,
  type JsonTreeNodeId,
} from "./JsonStructureTreeView";

function truncateMiddle(value: string, head = 10, tail = 10) {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

type SensorRow = {
  name: string;
  type: string;
  classname: string;
  friendlyName?: string;
};

function normalize(v: unknown): string {
  return String(v ?? "")
    .toLowerCase()
    .trim();
}

function matchesQuickFilter(row: SensorRow, q: string): boolean {
  if (!q) return true;
  const hay = [row.name, row.type, row.classname, row.friendlyName ?? ""]
    .map(normalize)
    .join(" ");
  return hay.includes(q);
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

function formatDateShort(iso: unknown): string {
  const s = String(iso ?? "");
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type ModelDetailsPageProps = {
  fingerprint: string | null;
  modelName: string | null;
  canGet: boolean;
  canUpdate: boolean;
  onClose: () => void;
};

export function ModelDetailsPage(props: ModelDetailsPageProps) {
  const { t } = useTranslation(["common", "models"]);
  const { fingerprint, modelName, canGet, canUpdate, onClose } = props;

  const dispatch = useAppDispatch();

  const [copiedFp, setCopiedFp] = React.useState(false);
  const [copiedJson, setCopiedJson] = React.useState(false);

  const [sensorFilter, setSensorFilter] = React.useState("");

  const [jsonExpanded, setJsonExpanded] = React.useState<JsonTreeNodeId[]>([
    "root",
  ]);
  const [allJsonNodeIds, setAllJsonNodeIds] = React.useState<JsonTreeNodeId[]>(
    [],
  );

  const rawDetails: unknown | undefined = useAppSelector(
    fingerprint ? selectModelDetails(fingerprint) : () => undefined,
  );

  const detailsStatus = useAppSelector(
    fingerprint ? selectModelDetailsStatus(fingerprint) : () => "idle",
  );

  const detailsError = useAppSelector(
    fingerprint ? selectModelDetailsError(fingerprint) : () => null,
  );

  const details: ModelDetails | undefined = React.useMemo(() => {
    if (!rawDetails) return undefined;
    const anyDetails: any = rawDetails as any;
    return (anyDetails?.content ?? anyDetails) as ModelDetails;
  }, [rawDetails]);

  const jsonStructure = (details as any)?.jsonStructure;

  React.useEffect(() => {
    if (!fingerprint) return;
    if (!modelName) return;
    if (!canGet) return;
    if (details) return;

    dispatch(fetchModelDetails({ modelName, fingerprint }));
  }, [dispatch, fingerprint, modelName, canGet, details]);

  React.useEffect(() => {
    setSensorFilter("");
  }, [fingerprint]);

  React.useEffect(() => {
    setJsonExpanded(["root"]);
  }, [fingerprint]);

  const handleCopyFingerprint = React.useCallback(async () => {
    const fp = (details as any)?.fingerprint ?? fingerprint;
    if (!fp) return;

    const ok = await copyToClipboard(String(fp));
    setCopiedFp(ok);
    window.setTimeout(() => setCopiedFp(false), 1200);
  }, [details, fingerprint]);

  const handleCopyJsonStructure = React.useCallback(async () => {
    if (!jsonStructure) return;
    const text = JSON.stringify(jsonStructure, null, 2);
    const ok = await copyToClipboard(text);
    setCopiedJson(ok);
    window.setTimeout(() => setCopiedJson(false), 1200);
  }, [jsonStructure]);

  const showContent =
    !!fingerprint &&
    !!modelName &&
    canGet &&
    detailsStatus !== "loading" &&
    !!details;

  const headerModel = details?.model ?? modelName ?? "";
  const headerFingerprint = (details as any)?.fingerprint ?? fingerprint ?? "";
  const headerSource = (details as any)?.source as string | undefined;
  const headerCategory = (details as any)?.category as string | undefined;
  const headerCreatedOn = (details as any)?.createdOn as string | undefined;
  const headerVersion = (details as any)?.version as number | undefined;

  const cardSx = React.useMemo(
    () => ({
      p: 2,
      borderRadius: 2.5,
      bgcolor: "background.paper",
      boxShadow: 1,
    }),
    [],
  );

  // ✅ UPDATED: Name reduced by ~25% (flex 1.35 -> 1.0, minWidth 170 -> 135)
  // This frees space for Class so it truncates less often.
  const sensorColumns = React.useMemo<GridColDef<SensorRow>[]>(
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

  const renderLoadingSkeleton = () => (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={cardSx}>
        <Skeleton variant="text" width={120} />
        <Divider sx={{ my: 1.5 }} />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </Paper>

      <Paper variant="outlined" sx={cardSx}>
        <Skeleton variant="text" width={150} />
        <Divider sx={{ my: 1.5 }} />
        <Skeleton variant="rounded" height={120} />
      </Paper>

      <Paper variant="outlined" sx={cardSx}>
        <Skeleton variant="text" width={110} />
        <Divider sx={{ my: 1.5 }} />
        <Skeleton variant="rounded" height={260} />
      </Paper>
    </Stack>
  );

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {/* Sticky header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          pt: 1.25,
          pb: 1.25,
          px: 2,
          flex: "0 0 auto",
        }}
      >
        <Stack spacing={0.75}>
          {/* Label row */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ minWidth: 0 }}
            >
              <InfoOutlinedIcon
                fontSize="small"
                color="action"
                sx={{ mt: "1px" }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: 0.8, lineHeight: 1 }}
                noWrap
              >
                {t("models:details.title", { defaultValue: "MODEL DETAILS" })}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <Tooltip
                title={copiedFp ? "Copied!" : "Copy fingerprint"}
                placement="bottom"
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={handleCopyFingerprint}
                    disabled={!headerFingerprint}
                    aria-label="Copy fingerprint"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <IconButton onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>

          {/* Model title */}
          <Typography
            variant="h6"
            sx={{ lineHeight: 1.15 }}
            noWrap
            title={headerModel}
          >
            {headerModel}
          </Typography>

          {/* Chips */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            alignItems="center"
          >
            {!!headerCategory && (
              <Chip size="small" label={headerCategory} variant="outlined" />
            )}
            {!!headerSource && (
              <Chip size="small" label={headerSource} variant="outlined" />
            )}
            {!!headerFingerprint && (
              <Tooltip title={headerFingerprint} placement="bottom">
                <Chip
                  size="small"
                  variant="outlined"
                  label={truncateMiddle(headerFingerprint, 14, 14)}
                />
              </Tooltip>
            )}
          </Stack>

          {/* Metadata line */}
          {(headerCreatedOn || headerVersion !== undefined) && (
            <Typography variant="caption" color="text.secondary">
              {headerCreatedOn
                ? `Created: ${formatDateShort(headerCreatedOn)}`
                : ""}
              {headerCreatedOn && headerVersion !== undefined ? " · " : ""}
              {headerVersion !== undefined ? `Version: ${headerVersion}` : ""}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Scrollable body */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.5, sm: 2 },
          overflow: "auto",
          flex: "1 1 auto",
          minHeight: 0,
        }}
      >
        <Stack spacing={2}>
          {!fingerprint && (
            <Typography variant="body2" color="text.secondary">
              {t("models:messages.selectModelForDetails")}
            </Typography>
          )}

          {!!fingerprint && !modelName && (
            <Alert severity="warning">
              Unable to resolve <code>modelName</code> for the selected row.
            </Alert>
          )}

          {!!fingerprint && !!modelName && !canGet && (
            <Alert severity="warning">{t("models:errorcode.MODL002")}</Alert>
          )}

          {!!fingerprint &&
            !!modelName &&
            canGet &&
            detailsStatus === "loading" &&
            renderLoadingSkeleton()}

          {!!fingerprint && !!modelName && canGet && !!detailsError && (
            <Alert severity="error">{detailsError}</Alert>
          )}

          {!!fingerprint &&
            !!modelName &&
            canGet &&
            detailsStatus !== "loading" &&
            !details &&
            !detailsError && (
              <Typography variant="body2" color="text.secondary">
                {t("models:messages.noDetailsLoadedYet")}
              </Typography>
            )}

          {showContent && (
            <>
              {/* Overview card */}
              <Paper variant="outlined" sx={cardSx}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {t("models:details.overview", { defaultValue: "Overview" })}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("models:fields.modelName")}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {details.model}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("models:fields.fingerprint")}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={details.fingerprint} placement="bottom">
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {truncateMiddle(details.fingerprint, 14, 14)}
                        </Typography>
                      </Tooltip>

                      <Tooltip
                        title={copiedFp ? "Copied!" : "Copy"}
                        placement="top"
                      >
                        <IconButton
                          size="small"
                          onClick={handleCopyFingerprint}
                          aria-label="Copy fingerprint"
                        >
                          <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* JSON Structure card */}
              {!!jsonStructure && (
                <Paper variant="outlined" sx={cardSx}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {t("models:fields.jsonStructure")}
                    </Typography>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Tooltip title="Expand all" placement="top">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => setJsonExpanded(allJsonNodeIds)}
                            disabled={allJsonNodeIds.length === 0}
                            aria-label="Expand all"
                          >
                            <UnfoldMoreIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Collapse all" placement="top">
                        <IconButton
                          size="small"
                          onClick={() => setJsonExpanded(["root"])}
                          aria-label="Collapse all"
                        >
                          <UnfoldLessIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={copiedJson ? "Copied!" : "Copy JSON"}
                        placement="top"
                      >
                        <IconButton
                          size="small"
                          onClick={handleCopyJsonStructure}
                          aria-label="Copy JSON"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  <JsonStructureTreeView
                    value={jsonStructure}
                    maxHeight={420}
                    expandedItems={jsonExpanded}
                    onExpandedItemsChange={(_event, ids) =>
                      setJsonExpanded(ids as JsonTreeNodeId[])
                    }
                    onNodeIdsComputed={(ids) => setAllJsonNodeIds(ids)}
                  />
                </Paper>
              )}

              {/* Sensors card */}
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
                        const all = ((details as any).sensors ?? []) as any[];
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
                    const all = (
                      ((details as any).sensors ?? []) as SensorRow[]
                    )
                      .map((s) => ({
                        name: s?.name ?? "",
                        type: s?.type ?? "",
                        classname: (s as any)?.classname ?? "",
                        friendlyName: (s as any)?.friendlyName,
                      }))
                      .filter((s) => s.name.length > 0);

                    all.sort((a, b) => a.name.localeCompare(b.name));

                    const q = normalize(sensorFilter);
                    const sensors = q
                      ? all.filter((r) => matchesQuickFilter(r, q))
                      : all;

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
                              columns={sensorColumns}
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
            </>
          )}

          <SensorUpdateDialog canUpdate={canUpdate} modelDetails={details} />
        </Stack>
      </Box>
    </Box>
  );
}
