// src/features/recommendations/RecommendationsPage.tsx
import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAuth } from "../../auth/AuthProvider";

import {
  closePromote,
  selectPromoteForm,
  selectPromoteOpen,
  selectRecommendationsFilterText,
  selectSelectedCandidate,
  setFilterText,
  setPromoteField,
} from "./recommendationsSlice";

import {
  fetchRecommendations,
  promoteRecommendation,
  selectRecommendationsError,
  selectRecommendationsPromoteError,
  selectRecommendationsPromoteStatus,
  selectRecommendationsStatus,
} from "./recommendationsDataSlice";

import { DataGridFilter } from "../../components/DataGridFilter";
import { RecommendationsDataGrid } from "./RecommendationsDataGrid";
import { RecommendationsPromoteDialog } from "./RecommendationsPromoteDialog";

export function RecommendationsPage() {
  const { t } = useTranslation(["common", "recommendations"]);
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const canList = auth.hasPermission("recommendation:list");
  const canPromote = auth.hasPermission("recommendation:promote");

  const status = useAppSelector(selectRecommendationsStatus);
  const error = useAppSelector(selectRecommendationsError);

  const promoteStatus = useAppSelector(selectRecommendationsPromoteStatus);
  const promoteError = useAppSelector(selectRecommendationsPromoteError);

  const filterText = useAppSelector(selectRecommendationsFilterText);
  const promoteOpen = useAppSelector(selectPromoteOpen);
  const selected = useAppSelector(selectSelectedCandidate);
  const promoteForm = useAppSelector(selectPromoteForm);

  const loading = status === "loading";
  const promoting = promoteStatus === "loading";

  React.useEffect(() => {
    if (!canList) return;
    dispatch(fetchRecommendations());
  }, [dispatch, canList]);

  const onRefresh = () => {
    if (!canList) return;
    dispatch(fetchRecommendations());
  };

  const onClosePromote = () => dispatch(closePromote());

  const onSubmitPromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPromote) return;
    if (!selected?.model) return;

    const deviceId = selected.id;
    if (deviceId === undefined || deviceId === null) return;

    const res = await dispatch(
      promoteRecommendation({
        model: selected.model!,
        deviceId, // ✅ value from selected.id
        fingerprint: selected.deviceFingerprint, // ✅ if backend expects deviceFingerprint here, rename accordingly
        name: promoteForm.name.trim(),
        area: promoteForm.area.trim(),
        deviceType: promoteForm.deviceType.trim(),
      }),
    );

    if (promoteRecommendation.fulfilled.match(res)) {
      dispatch(closePromote());
    }
  };

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
              onChange={(e) => dispatch(setFilterText(e.target.value))}
            />

            <Box sx={{ width: "100%", minWidth: 900 }}>
              <RecommendationsDataGrid />
            </Box>
          </Stack>
        </Paper>

        <RecommendationsPromoteDialog
          open={!!(canPromote && promoteOpen && selected)}
          selected={selected ?? null}
          promoteForm={promoteForm}
          promoting={promoting}
          promoteError={promoteError}
          onClose={onClosePromote}
          onSubmit={onSubmitPromote}
          onChangeField={(field, value) =>
            dispatch(setPromoteField({ field, value }))
          }
        />
      </Box>
    </Container>
  );
}
