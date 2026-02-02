// src/features/models/ModelsPage.tsx
import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Drawer,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAuth } from "../../auth/AuthProvider";

import {
  fetchModels,
  selectModelsError,
  selectModelsItems,
} from "./modelsDataSlice";

import {
  clearSelection,
  selectModelsDetailsOpen,
  selectModelsFilterText,
  selectModelsSelectedFingerprint,
  setDetailsOpen,
  setFilterText,
} from "./modelsSlice";

import { DataGridFilter } from "../../components/DataGridFilter";
import { ModelsDataGrid } from "./ModelsDataGrid";
import { ModelDetailsPage } from "./ModelDetailsPage";

export function ModelsPage() {
  const { t } = useTranslation(["common", "models"]);
  const dispatch = useAppDispatch();
  const auth = useAuth();

  // permissions
  const canList = auth.hasPermission("model:list");
  const canGet = auth.hasPermission("model:get");
  const canUpdate = auth.hasPermission("model:update");

  const items = useAppSelector(selectModelsItems);
  const error = useAppSelector(selectModelsError);

  const filterText = useAppSelector(selectModelsFilterText);

  const selectedFingerprint = useAppSelector(selectModelsSelectedFingerprint);
  const detailsOpen = useAppSelector(selectModelsDetailsOpen);

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

  const onRefresh = () => {
    if (!canList) return;
    dispatch(fetchModels());
  };

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
          {t("models:list.refresh")}
        </Button>
      </Stack>

      {!canList && (
        <Alert severity="warning">{t("models:errcode.MODL001")}</Alert>
      )}

      {!!error && <Alert severity="error">{error}</Alert>}

      {/* Grid */}
      <Paper sx={{ p: 2 }}>
        <Stack direction="column" spacing={2} alignItems="center">
          <DataGridFilter
            canFilter={canList}
            filterText={filterText}
            onChange={(e) => dispatch(setFilterText(e.target.value))}
          />
          <Box sx={{ width: "100%", height: 520, minWidth: 0 }}>
            <ModelsDataGrid />
          </Box>
        </Stack>
      </Paper>

      {/* Details drawer */}
      <Drawer
        anchor="right"
        open={detailsOpen}
        onClose={() => dispatch(setDetailsOpen(false))}
        PaperProps={{
          sx: () => ({
            width: { xs: "100%", sm: 520 },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderLeft: 1,
            borderColor: "divider",
            borderRadius: 0,

            // ✅ Offset drawer below your top AppBar (56px mobile, 64px desktop)
            top: { xs: 56, sm: 64 },
            height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },

            // optional: if you have a different toolbar height, use theme:
            // top: { xs: theme.spacing(7), sm: theme.spacing(8) },
            // height: { xs: `calc(100% - ${theme.spacing(7)})`, sm: `calc(100% - ${theme.spacing(8)})` },
          }),
        }}
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
