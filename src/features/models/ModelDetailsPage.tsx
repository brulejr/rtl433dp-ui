// src/features/models/ModelDetailsPage.tsx
import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

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
import { JsonStructureTreeView } from "./JsonStructureTreeView";

function pretty(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
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

  // Drawer-scoped selectors
  const rawDetails: unknown | undefined = useAppSelector(
    fingerprint ? selectModelDetails(fingerprint) : () => undefined,
  );

  const detailsStatus = useAppSelector(
    fingerprint ? selectModelDetailsStatus(fingerprint) : () => "idle",
  );

  const detailsError = useAppSelector(
    fingerprint ? selectModelDetailsError(fingerprint) : () => null,
  );

  /**
   * ✅ Fix for “empty drawer but request succeeded”
   *
   * Backend response (per HAR) is wrapped: { content: { ...modelDetails... }, status, timestamp }
   * If your reducer stored the wrapper, the old UI tried to read details.model and rendered nothing.
   * This unwraps either shape safely.
   */
  const details: ModelDetails | undefined = React.useMemo(() => {
    if (!rawDetails) return undefined;
    const anyDetails: any = rawDetails as any;
    return (anyDetails?.content ?? anyDetails) as ModelDetails;
  }, [rawDetails]);

  const jsonStructure = (details as any)?.jsonStructure;

  // Fetch details when fingerprint/modelName become available and we don't already have details.
  React.useEffect(() => {
    if (!fingerprint) return;
    if (!modelName) return;
    if (!canGet) return;
    if (details) return;

    dispatch(
      fetchModelDetails({
        modelName,
        fingerprint,
      }),
    );
  }, [dispatch, fingerprint, modelName, canGet, details]);

  return (
    <Stack sx={{ p: 2 }} spacing={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Model details</Typography>
        <IconButton onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </Stack>

      <Divider />

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
        detailsStatus === "loading" && (
          <Typography variant="body2" color="text.secondary">
            {t("models:messages.loadingDetails")}
          </Typography>
        )}

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

      {!!fingerprint &&
        !!modelName &&
        canGet &&
        detailsStatus !== "loading" &&
        details && (
          <>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("models:fields.modelName")}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 300 }}>
                {details.model}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                {t("models:fields.fingerprint")}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                {details.fingerprint}
              </Typography>

              {!!jsonStructure && (
                <>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ pt: 1 }}
                  >
                    {t("models:fields.jsonStructure")}
                  </Typography>
                  <JsonStructureTreeView
                    value={jsonStructure}
                    maxHeight={500}
                  />
                </>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t("models:fields.sensors")}
              </Typography>

              {canUpdate && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SystemUpdateAltIcon />}
                  disabled={!canUpdate}
                  onClick={() => dispatch(setUpdateSensorsOpen(true))}
                >
                  {t("models:details.updateSensors")}
                </Button>
              )}
            </Stack>

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
              {pretty((details as any).sensors ?? {})}
            </Box>
          </>
        )}

      <SensorUpdateDialog canUpdate={canUpdate} modelDetails={details} />
    </Stack>
  );
}
