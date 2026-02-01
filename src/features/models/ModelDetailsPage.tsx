// src/features/models/ModelDetailsPage.tsx
import * as React from "react";
import {
  Alert,
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

import {
  fetchModelDetails,
  selectModelDetails,
  selectModelDetailsError,
  selectModelDetailsStatus,
  type ModelDetails,
} from "./modelsDataSlice";

import { SensorsCard } from "./SensorsCard";
import { SensorUpdateDialog } from "./SensorUpdateDialog";

import { JsonStructureCard } from "./JsonStructureCard";

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

  const handleCopyFingerprint = React.useCallback(async () => {
    const fp = (details as any)?.fingerprint ?? fingerprint;
    if (!fp) return;

    const ok = await copyToClipboard(String(fp));
    setCopiedFp(ok);
    window.setTimeout(() => setCopiedFp(false), 1200);
  }, [details, fingerprint]);

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
                <JsonStructureCard jsonStructure={jsonStructure} />
              )}

              <SensorsCard canUpdate={canUpdate} modelDetails={details} />
            </>
          )}

          <SensorUpdateDialog canUpdate={canUpdate} modelDetails={details} />
        </Stack>
      </Box>
    </Box>
  );
}
