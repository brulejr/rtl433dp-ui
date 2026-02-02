// src/features/recommendations/RecommendationsPage.tsx
import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAuth } from "../../auth/AuthProvider";

import type { RecommendationCandidate } from "./recommendationsApi";
import {
  closePromote,
  openPromote,
  selectPromoteForm,
  selectPromoteOpen,
  selectSelectedCandidate,
  setPromoteField,
} from "./recommendationsSlice";

import {
  fetchRecommendations,
  promoteRecommendation,
  selectRecommendationsError,
  selectRecommendationsItems,
  selectRecommendationsPromoteError,
  selectRecommendationsPromoteStatus,
  selectRecommendationsStatus,
} from "./recommendationsDataSlice";

import { DataGridFilter } from "../../components/DataGridFilter";

function safeString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function getRowKey(c: RecommendationCandidate): string {
  const model = safeString(c.model);
  const id = safeString(c.id);
  const fp = safeString(c.fingerprint);
  const key = [model, id, fp].filter(Boolean).join(":");
  return key || JSON.stringify(c);
}

export function RecommendationsPage() {
  const { t } = useTranslation(["common", "recommendations"]);
  const dispatch = useAppDispatch();
  const auth = useAuth();

  // ✅ Permission gate like ModelsPage
  const canList = auth.hasPermission("recommendation:list");
  const canPromote = auth.hasPermission("recommendation:promote");

  // data slice
  const items = useAppSelector(selectRecommendationsItems);
  const status = useAppSelector(selectRecommendationsStatus);
  const error = useAppSelector(selectRecommendationsError);

  const promoteStatus = useAppSelector(selectRecommendationsPromoteStatus);
  const promoteError = useAppSelector(selectRecommendationsPromoteError);

  // ui slice
  const promoteOpen = useAppSelector(selectPromoteOpen);
  const selected = useAppSelector(selectSelectedCandidate);
  const promoteForm = useAppSelector(selectPromoteForm);

  const loading = status === "loading";
  const promoting = promoteStatus === "loading";

  // local filter + manual highlight (matches KnownDevices)
  const [filterText, setFilterTextLocal] = React.useState("");
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  // initial load
  React.useEffect(() => {
    if (!canList) return;
    dispatch(fetchRecommendations());
  }, [dispatch, canList]);

  const rows = React.useMemo(() => {
    const f = (filterText ?? "").trim().toLowerCase();
    if (!f) return items;

    return items.filter((c) => {
      const hay = [
        c.source,
        c.model,
        c.id,
        c.deviceId,
        c.fingerprint,
        c.weight,
        c.frequency,
        c.rssi,
        c.lastSeen,
        c.time,
      ]
        .filter((x) => x !== null && x !== undefined)
        .join(" ")
        .toLowerCase();

      return hay.includes(f);
    });
  }, [items, filterText]);

  // auto-clear selection if filtered out
  React.useEffect(() => {
    if (!selectedKey) return;
    const visible = new Set(rows.map(getRowKey));
    if (!visible.has(String(selectedKey))) setSelectedKey(null);
  }, [rows, selectedKey]);

  const onRefresh = () => {
    if (!canList) return;
    dispatch(fetchRecommendations());
  };

  const onOpenPromote = (c: RecommendationCandidate) => {
    if (!canPromote) return;
    dispatch(openPromote(c));
  };

  const onClosePromote = () => dispatch(closePromote());

  const onSubmitPromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPromote) return;
    if (!selected?.model) return;

    // ✅ backend expects deviceId (not "id")
    const deviceId = selected.deviceId ?? selected.id;
    if (deviceId === undefined || deviceId === null) return;

    const res = await dispatch(
      promoteRecommendation({
        model: selected.model,
        deviceId,
        fingerprint: selected.fingerprint,
        name: promoteForm.name.trim(),
        area: promoteForm.area.trim(),
        deviceType: promoteForm.deviceType.trim(),
      }),
    );

    if (promoteRecommendation.fulfilled.match(res)) {
      dispatch(closePromote());
    }
  };

  const columns = React.useMemo<GridColDef<RecommendationCandidate>[]>(
    () => [
      { field: "model", headerName: "Model", flex: 1, minWidth: 160 },
      { field: "id", headerName: "ID", flex: 0.7, minWidth: 130 },

      {
        field: "weight",
        headerName: "Weight",
        flex: 0.6,
        minWidth: 110,
        type: "number",
        valueGetter: (_value, row) => row?.weight ?? null,
      },
      {
        field: "rssi",
        headerName: "RSSI",
        flex: 0.6,
        minWidth: 90,
        type: "number",
        valueGetter: (_value, row) => row?.signalStrengthDbm ?? null,
      },
      {
        field: "frequency",
        headerName: "Freq",
        flex: 0.7,
        minWidth: 100,
        type: "number",
        valueGetter: (_value, row) => row?.bucketCount ?? null,
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

          const c = params.row as RecommendationCandidate;
          const disabled = !c.model || c.id === undefined || c.id === null;

          return (
            <Button
              size="small"
              variant="outlined"
              startIcon={<SystemUpdateAltIcon />}
              onClick={() => onOpenPromote(c)}
              disabled={disabled}
            >
              {t("common:actions.promote")}
            </Button>
          );
        },
      },
    ],
    [canPromote, t],
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
          <Typography variant="h4">{t("recommendations:title")}</Typography>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={!canList || loading}
            sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
          >
            Refresh
          </Button>
        </Stack>

        {!canList && (
          <Alert severity="warning">
            You do not have permission to view Recommendations. (Requires{" "}
            <code>recommendation:list</code>)
          </Alert>
        )}

        {!!error && <Alert severity="error">{error}</Alert>}

        <Paper sx={{ p: 2, width: "100%", overflowX: "auto" }}>
          <Stack direction="column" spacing={2} alignItems="stretch">
            <DataGridFilter
              canFilter={canList}
              filterText={filterText}
              onChange={(e) => setFilterTextLocal(e.target.value)}
            />

            <DataGrid
              rows={canList ? rows : []}
              columns={columns}
              getRowId={getRowKey}
              loading={canList && loading}
              rowSelection={false}
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              onRowClick={(params) => setSelectedKey(String(params.id))}
              onRowDoubleClick={(params) => onOpenPromote(params.row)}
              getRowClassName={(params) =>
                String(params.id) === String(selectedKey ?? "")
                  ? "rtl433dp-row-selected"
                  : ""
              }
              sx={{
                minWidth: 900,
                "& .rtl433dp-row-selected": {
                  backgroundColor: "action.selected",
                },
                "& .rtl433dp-row-selected:hover": {
                  backgroundColor: "action.selected",
                },
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 100, page: 0 } },
                sorting: { sortModel: [{ field: "weight", sort: "desc" }] },
              }}
              pageSizeOptions={[25, 50, 100]}
            />
          </Stack>
        </Paper>

        {/* Promote dialog */}
        {canPromote && promoteOpen && selected && (
          <Dialog
            open={promoteOpen}
            onClose={onClosePromote}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>{t("recommendations:promote.title")}</DialogTitle>

            <DialogContent>
              <Box sx={{ mt: 1, mb: 2, opacity: 0.85 }}>
                <div>
                  <strong>Model:</strong> {safeString(selected.model)}
                </div>
                <div>
                  <strong>ID:</strong> {safeString(selected.id)}
                </div>
              </Box>

              <Box component="form" onSubmit={onSubmitPromote}>
                <Stack spacing={2}>
                  <TextField
                    label={t("recommendations:promote.name")}
                    value={promoteForm.name}
                    onChange={(e) =>
                      dispatch(
                        setPromoteField({
                          field: "name",
                          value: e.target.value,
                        }),
                      )
                    }
                    required
                    fullWidth
                    autoFocus
                  />

                  <TextField
                    label={t("recommendations:promote.area")}
                    value={promoteForm.area}
                    onChange={(e) =>
                      dispatch(
                        setPromoteField({
                          field: "area",
                          value: e.target.value,
                        }),
                      )
                    }
                    required
                    fullWidth
                  />

                  <TextField
                    label={t("recommendations:promote.deviceType")}
                    value={promoteForm.deviceType}
                    onChange={(e) =>
                      dispatch(
                        setPromoteField({
                          field: "deviceType",
                          value: e.target.value,
                        }),
                      )
                    }
                    required
                    fullWidth
                  />

                  {!!promoteError && (
                    <Alert severity="error">{promoteError}</Alert>
                  )}
                </Stack>

                <DialogActions sx={{ px: 0, mt: 2 }}>
                  <Button onClick={onClosePromote} disabled={promoting}>
                    {t("common:actions.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={promoting}
                  >
                    {t("recommendations:promote.submit")}
                  </Button>
                </DialogActions>
              </Box>
            </DialogContent>
          </Dialog>
        )}
      </Box>
    </Container>
  );
}
