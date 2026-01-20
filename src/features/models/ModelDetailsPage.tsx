// src/features/models/ModelDetailsPage.tsx
import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

import { useAppDispatch, useAppSelector } from "../../app/hooks";

import {
  fetchModelDetails,
  selectModelDetails,
  selectModelDetailsError,
  selectModelDetailsStatus,
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

export type ModelDetailsPageProps = {
  fingerprint: string | null;
  modelName: string | null;
  canGet: boolean;
  canUpdate: boolean;
  onClose: () => void;
};

export function ModelDetailsPage(props: ModelDetailsPageProps) {
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

  // --- Update sensors dialog state ---
  const updateSensorsOpen = useAppSelector(selectModelsUpdateSensorsOpen);
  const updateStatus = useAppSelector(selectUpdateSensorsStatus);
  const updateError = useAppSelector(selectUpdateSensorsError);
  const updating = updateStatus === "loading";

  const [updateBodyText, setUpdateBodyText] = React.useState<string>("");

  React.useEffect(() => {
    if (!updateSensorsOpen) return;
    // sensors can be an object OR an array (your HAR shows array)
    const initial = (details as any)?.sensors ?? {};
    setUpdateBodyText(pretty(initial));
  }, [updateSensorsOpen, details]);

  const updateJsonValidation = React.useMemo(
    () => safeJsonParse(updateBodyText),
    [updateBodyText],
  );

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
          Select a model to see details.
        </Typography>
      )}

      {!!fingerprint && !modelName && (
        <Alert severity="warning">
          Unable to resolve <code>modelName</code> for the selected row.
        </Alert>
      )}

      {!!fingerprint && !!modelName && !canGet && (
        <Alert severity="warning">
          You do not have permission to view model details. (Requires{" "}
          <code>model:get</code>)
        </Alert>
      )}

      {!!fingerprint &&
        !!modelName &&
        canGet &&
        detailsStatus === "loading" && (
          <Typography variant="body2" color="text.secondary">
            Loading details…
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
            No details loaded yet.
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
              {pretty((details as any).sensors ?? {})}
            </Box>
          </>
        )}

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
            error={!updateJsonValidation.ok}
            helperText={
              !updateJsonValidation.ok
                ? updateJsonValidation.error
                : "Edit the sensors payload. This is sent as JSON to the backend."
            }
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
              !fingerprint ||
              !modelName ||
              !updateJsonValidation.ok
            }
            onClick={async () => {
              if (!fingerprint || !modelName) return;

              const parsed = safeJsonParse(updateBodyText);
              if (!parsed.ok) return;

              await dispatch(
                updateModelSensors({
                  modelName,
                  fingerprint,
                  payload: parsed.value,
                }),
              );

              dispatch(setUpdateSensorsOpen(false));

              // refresh details after update
              dispatch(
                fetchModelDetails({
                  modelName,
                  fingerprint,
                }),
              );
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
