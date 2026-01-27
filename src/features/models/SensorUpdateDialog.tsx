// src/feature/models/SensorUpdateDialog.tsx
import * as React from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

import {
  selectUpdateSensorsError,
  selectUpdateSensorsStatus,
  updateModelSensors,
  type ModelDetails,
} from "./modelsDataSlice";

import {
  selectModelsUpdateSensorsOpen,
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

function pretty(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

type Props = {
  canUpdate?: boolean;
  modelDetails: ModelDetails | undefined;
};

export function SensorUpdateDialog({ canUpdate, modelDetails }: Props) {
  const { t } = useTranslation(["common"]);
  const dispatch = useAppDispatch();

  // --- Update sensors dialog state ---
  const updateSensorsOpen = useAppSelector(selectModelsUpdateSensorsOpen);
  const updateStatus = useAppSelector(selectUpdateSensorsStatus);
  const updateError = useAppSelector(selectUpdateSensorsError);
  const updating = updateStatus === "loading";

  const [updateBodyText, setUpdateBodyText] = React.useState<string>("");

  React.useEffect(() => {
    if (!updateSensorsOpen) return;
    // sensors can be an object OR an array (your HAR shows array)
    const initial = (modelDetails as any)?.sensors ?? {};
    setUpdateBodyText(pretty(initial));
  }, [updateSensorsOpen, modelDetails]);

  const updateJsonValidation = React.useMemo(
    () => safeJsonParse(updateBodyText),
    [updateBodyText],
  );

  return (
    <Dialog
      open={updateSensorsOpen}
      onClose={() => dispatch(setUpdateSensorsOpen(false))}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ pr: 6 }}>
        {t("models:sensors.title")}
        <IconButton
          onClick={() => dispatch(setUpdateSensorsOpen(false))}
          sx={{ position: "absolute", right: 8, top: 8 }}
          aria-label={t("common:actions.close")}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {!canUpdate && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t("models:errorcode.MODL003")}
          </Alert>
        )}

        {!!updateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {updateError}
          </Alert>
        )}

        <TextField
          label={t("models:sensors.fields.sensorPayload.label")}
          value={updateBodyText}
          onChange={(e) => setUpdateBodyText(e.target.value)}
          multiline
          minRows={10}
          fullWidth
          disabled={!canUpdate || updating}
          error={!updateJsonValidation.ok}
          helperText={
            !updateJsonValidation.ok
              ? updateJsonValidation.error
              : t("models:sensors.fields.sensorPayload.helperText")
          }
        />
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => dispatch(setUpdateSensorsOpen(false))}
          disabled={updating}
        >
          {t("common:actions.cancel")}
        </Button>

        <Button
          variant="contained"
          startIcon={<SystemUpdateAltIcon />}
          disabled={
            !canUpdate ||
            updating ||
            !modelDetails?.fingerprint ||
            !modelDetails?.model ||
            !updateJsonValidation.ok
          }
          onClick={async () => {
            if (!modelDetails?.fingerprint || !modelDetails?.model) return;

            const parsed = safeJsonParse(updateBodyText);
            if (!parsed.ok) return;

            await dispatch(
              updateModelSensors({
                modelName: modelDetails?.model,
                fingerprint: modelDetails?.fingerprint,
                payload: parsed.value,
              }),
            );

            dispatch(setUpdateSensorsOpen(false));
          }}
        >
          {t("common:actions.update")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
