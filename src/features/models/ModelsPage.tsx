// src/features/models/ModelsPage.tsx
import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Drawer,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAuth } from "../../auth/AuthProvider";

import {
  fetchModels,
  searchModels,
  selectModelsError,
  selectModelsItems,
  selectModelsStatus,
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
  setDetailsOpen,
  setFilterText,
  setSearchJson,
} from "./modelsSlice";

import { ModelDetailsPage } from "./ModelDetailsPage";

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

  const loading = status === "loading";

  // derive modelName for the selected fingerprint (required by backend routes)
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
            // DO NOT use DataGrid selection system at all
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
        <ModelDetailsPage
          fingerprint={selectedFingerprint}
          modelName={selectedModelName}
          canGet={canGet}
          canUpdate={canUpdate}
          onClose={() => dispatch(setDetailsOpen(false))}
        />
      </Drawer>
    </Box>
  );
}
