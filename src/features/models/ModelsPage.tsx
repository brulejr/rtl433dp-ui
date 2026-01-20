// src/features/models/ModelsPage.tsx
import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAuth } from "../../auth/AuthProvider";

import {
  fetchModelDetails,
  fetchModels,
  searchModels,
  selectModelDetails,
  selectModelDetailsError,
  selectModelDetailsStatus,
  selectModelsError,
  selectModelsItems,
  selectModelsStatus,
  selectUpdateSensorsError,
  selectUpdateSensorsStatus,
  updateModelSensors,
  type ModelDetails,
  type ModelSummary,
} from "./modelsDataSlice";

import {
  clearSelection,
  resetSearch,
  selectModel,
  selectModelsDetailsOpen,
  selectModelsFilterText,
  selectModelsSearchJson,
  selectModelsSelectedFingerprint,
  selectModelsUpdateSensorsOpen,
  setDetailsOpen,
  setFilterText,
  setSearchJson,
  setUpdateSensorsOpen,
} from "./modelsSlice";

function safeJsonParse(
  text: string,
): { ok: true; value: unknown } | { ok: false; error: string } {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return { ok: true, value: {} };

  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Invalid JSON" };
  }
}

function getRowId(m: ModelSummary): string {
  return String(m.fingerprint ?? "");
}

function pretty(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export function ModelsPage() {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  // permissions
  const canList = auth.hasPermission("model:list");
  const canSearch = auth.hasPermission("model:search");
  const canGet = auth.hasPermission("model:get");
  const canUpdate = auth.hasPermission("model:update");

  const items = useAppSelector(selectModelsItems);
  const status = useAppSelector(selectModelsStatus);
  const error = useAppSelector(selectModelsError);

  const filterText = useAppSelector(selectModelsFilterText);
  const searchJson = useAppSelector(selectModelsSearchJson);

  const selectedFingerprint = useAppSelector(selectModelsSelectedFingerprint);
  const detailsOpen = useAppSelector(selectModelsDetailsOpen);

  const updateSensorsOpen = useAppSelector(selectModelsUpdateSensorsOpen);

  const loading = status === "loading";

  // ✅ derive modelName for the selected fingerprint (required by backend routes)
  const selectedModelName = React.useMemo(() => {
    if (!selectedFingerprint) return null;
    const hit = items.find(
      (m) => String(m.fingerprint) === String(selectedFingerprint),
    );
    return hit?.model ?? null;
  }, [items, selectedFingerprint]);

  // initial load
  React.useEffect(() => {
    if (!canList) return;
    dispatch(fetchModels());
  }, [dispatch, canList]);

  const rows = React.useMemo(() => {
    const f = (filterText ?? "").trim().toLowerCase();
    if (!f) return items;

    return items.filter((m) => {
      const hay = [m.model, m.fingerprint]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(f);
    });
  }, [items, filterText]);

  // Auto-clear selection if filtered out
  React.useEffect(() => {
    if (!selectedFingerprint) return;
    const visible = new Set(rows.map((r) => String(r.fingerprint)));
    if (!visible.has(String(selectedFingerprint))) {
      dispatch(clearSelection());
    }
  }, [dispatch, rows, selectedFingerprint]);

  const columns = React.useMemo<GridColDef<ModelSummary>[]>(
    () => [
      { field: "model", headerName: "Model", flex: 1, minWidth: 220 },
      { field: "category", headerName: "Category", flex: 0.6, minWidth: 160 },
      {
        field: "fingerprint",
        headerName: "Fingerprint",
        flex: 1,
        minWidth: 280,
      },
    ],
    [],
  );

  // --- Details drawer data ---
  const details: ModelDetails | undefined = useAppSelector(
    selectedFingerprint
      ? selectModelDetails(selectedFingerprint)
      : () => undefined,
  );

  const detailsStatus = useAppSelector(
    selectedFingerprint
      ? selectModelDetailsStatus(selectedFingerprint)
      : () => "idle",
  );

  const detailsError = useAppSelector(
    selectedFingerprint
      ? selectModelDetailsError(selectedFingerprint)
      : () => null,
  );

  // Fetch details when drawer opens + selection changes
  React.useEffect(() => {
    if (!detailsOpen) return;
    if (!selectedFingerprint) return;
    if (!selectedModelName) return; // ✅ cannot call details endpoint without modelName
    if (!canGet) return;
    if (details) return;

    dispatch(
      fetchModelDetails({
        modelName: selectedModelName,
        fingerprint: selectedFingerprint,
      }),
    );
  }, [
    detailsOpen,
    selectedFingerprint,
    selectedModelName,
    canGet,
    details,
    dispatch,
  ]);

  // --- Update sensors dialog state ---
  const updateStatus = useAppSelector(selectUpdateSensorsStatus);
  const updateError = useAppSelector(selectUpdateSensorsError);
  const updating = updateStatus === "loading";

  const [updateBodyText, setUpdateBodyText] = React.useState<string>("");

  React.useEffect(() => {
    if (!updateSensorsOpen) return;
    const initial = details?.sensors ?? {};
    setUpdateBodyText(pretty(initial));
  }, [updateSensorsOpen, details]);

  const onRefresh = () => {
    if (!canList) return;
    dispatch(fetchModels());
  };

  const onSearch = () => {
    if (!canSearch) return;
    const parsed = safeJsonParse(searchJson);
    if (!parsed.ok) return;
    dispatch(searchModels({ body: parsed.value }));
  };

  const onReset = () => {
    dispatch(resetSearch());
    if (canList) dispatch(fetchModels());
  };

  const jsonValidation = React.useMemo(
    () => safeJsonParse(searchJson),
    [searchJson],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Models</Typography>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={!canList}
        >
          Refresh
        </Button>
      </Stack>

      {!canList && (
        <Alert severity="warning">
          You do not have permission to view Models. (Requires{" "}
          <code>model:list</code>)
        </Alert>
      )}

      {!!error && <Alert severity="error">{error}</Alert>}

      {/* Search + Filter */}
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Filter"
            value={filterText}
            onChange={(e) => dispatch(setFilterText(e.target.value))}
            fullWidth
          />
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Accordion disabled={!canSearch}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>
                Search (advanced)
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="JSON body"
                  value={searchJson}
                  onChange={(e) => dispatch(setSearchJson(e.target.value))}
                  multiline
                  minRows={6}
                  placeholder='Example: {"model":"Acurite-5n1"}'
                  error={!jsonValidation.ok}
                  helperText={
                    !canSearch
                      ? "Requires model:search permission."
                      : !jsonValidation.ok
                        ? jsonValidation.error
                        : "Provide JSON body for advanced model search."
                  }
                  fullWidth
                />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={onReset}
                  >
                    Reset
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={onSearch}
                    disabled={!canSearch || !jsonValidation.ok}
                  >
                    Search
                  </Button>
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Paper>

      {/* Grid */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ width: "100%", height: 520, minWidth: 0 }}>
          <DataGrid
            rows={rows ?? []}
            columns={columns}
            getRowId={getRowId}
            loading={loading}
            // ✅ DO NOT use DataGrid selection system at all
            rowSelection={false as any}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            onRowClick={(params) => dispatch(selectModel(String(params.id)))}
            getRowClassName={(params) =>
              String(params.id) === String(selectedFingerprint ?? "")
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
              pagination: { paginationModel: { pageSize: 50, page: 0 } },
            }}
            pageSizeOptions={[25, 50, 100]}
          />
        </Box>
      </Paper>

      {/* Details drawer */}
      <Drawer
        anchor="right"
        open={detailsOpen}
        onClose={() => dispatch(setDetailsOpen(false))}
        PaperProps={{ sx: { width: { xs: "100%", sm: 520 } } }}
      >
        <Stack sx={{ p: 2 }} spacing={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Model details</Typography>
            <IconButton
              onClick={() => dispatch(setDetailsOpen(false))}
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider />

          {!selectedFingerprint && (
            <Typography variant="body2" color="text.secondary">
              Select a model to see details.
            </Typography>
          )}

          {selectedFingerprint && !selectedModelName && (
            <Alert severity="warning">
              Unable to resolve <code>modelName</code> for the selected row.
            </Alert>
          )}

          {selectedFingerprint && !canGet && (
            <Alert severity="warning">
              You do not have permission to view model details. (Requires{" "}
              <code>model:get</code>)
            </Alert>
          )}

          {selectedFingerprint &&
            selectedModelName &&
            canGet &&
            detailsStatus === "loading" && (
              <Typography variant="body2" color="text.secondary">
                Loading details…
              </Typography>
            )}

          {selectedFingerprint &&
            selectedModelName &&
            canGet &&
            !!detailsError && <Alert severity="error">{detailsError}</Alert>}

          {selectedFingerprint &&
            selectedModelName &&
            canGet &&
            detailsStatus !== "loading" &&
            details && (
              <>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Model
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {details.model}
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Fingerprint
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {details.fingerprint}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Sensors
                  </Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SystemUpdateAltIcon />}
                    disabled={!canUpdate}
                    onClick={() => dispatch(setUpdateSensorsOpen(true))}
                  >
                    Update sensors
                  </Button>
                </Stack>

                {!canUpdate && (
                  <Typography variant="caption" color="text.secondary">
                    Requires <code>model:update</code> permission.
                  </Typography>
                )}

                <Box
                  component="pre"
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    overflow: "auto",
                    maxHeight: 260,
                    fontSize: 12,
                  }}
                >
                  {pretty(details.sensors ?? {})}
                </Box>
              </>
            )}
        </Stack>
      </Drawer>

      {/* Update sensors dialog */}
      <Dialog
        open={updateSensorsOpen}
        onClose={() => dispatch(setUpdateSensorsOpen(false))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pr: 6 }}>
          Update sensors
          <IconButton
            onClick={() => dispatch(setUpdateSensorsOpen(false))}
            sx={{ position: "absolute", right: 8, top: 8 }}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {!canUpdate && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You do not have permission to update sensors. (Requires{" "}
              <code>model:update</code>)
            </Alert>
          )}

          {!!updateError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {updateError}
            </Alert>
          )}

          <TextField
            label="Sensors payload (JSON)"
            value={updateBodyText}
            onChange={(e) => setUpdateBodyText(e.target.value)}
            multiline
            minRows={10}
            fullWidth
            disabled={!canUpdate || updating}
            helperText="Edit the sensors payload. This is sent as JSON to the backend."
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => dispatch(setUpdateSensorsOpen(false))}
            disabled={updating}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={<SystemUpdateAltIcon />}
            disabled={
              !canUpdate ||
              updating ||
              !selectedFingerprint ||
              !selectedModelName ||
              !safeJsonParse(updateBodyText).ok
            }
            onClick={async () => {
              if (!selectedFingerprint || !selectedModelName) return;

              const parsed = safeJsonParse(updateBodyText);
              if (!parsed.ok) return;

              await dispatch(
                updateModelSensors({
                  modelName: selectedModelName,
                  fingerprint: selectedFingerprint,
                  payload: parsed.value,
                }),
              );

              dispatch(setUpdateSensorsOpen(false));
              dispatch(
                fetchModelDetails({
                  modelName: selectedModelName,
                  fingerprint: selectedFingerprint,
                }),
              );
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
