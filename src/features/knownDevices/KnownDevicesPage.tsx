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

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchKnownDevices } from "./knownDevicesDataSlice";
import {
  selectKnownDevicesFilterText,
  setFilterText,
} from "./knownDevicesSlice";

import { DataGridFilter } from "../../components/DataGridFilter";
import { KnownDevicesDataGrid } from "./KnownDevicesDataGrid";

export function KnownDevicesPage() {
  const { t } = useTranslation(["common", "knownDevices"]);
  const dispatch = useAppDispatch();

  const filterText = useAppSelector(selectKnownDevicesFilterText);

  React.useEffect(() => {
    dispatch(fetchKnownDevices());
  }, [dispatch]);

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="h4">{t("knownDevices:title")}</Typography>

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
              <KnownDevicesDataGrid />
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
