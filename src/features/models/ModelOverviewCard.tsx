// src/features/models/ModelOverviewCard.tsx
import * as React from "react";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { useTranslation } from "react-i18next";

import { type ModelDetails } from "./modelsDataSlice";

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

function truncateMiddle(value: string, head = 10, tail = 10) {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

type Props = {
  details: ModelDetails;
  fingerprint: String;
};

export function ModelOverviewCard({ details, fingerprint }: Props) {
  const { t } = useTranslation(["common", "models"]);

  const [copiedFp, setCopiedFp] = React.useState(false);

  const handleCopyFingerprint = React.useCallback(async () => {
    const fp = (details as any)?.fingerprint ?? fingerprint;
    if (!fp) return;

    const ok = await copyToClipboard(String(fp));
    setCopiedFp(ok);
    window.setTimeout(() => setCopiedFp(false), 1200);
  }, [details, fingerprint]);

  const cardSx = React.useMemo(
    () => ({
      p: 2,
      borderRadius: 2.5,
      bgcolor: "background.paper",
      boxShadow: 1,
    }),
    [],
  );

  return (
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
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                {truncateMiddle(details.fingerprint, 14, 14)}
              </Typography>
            </Tooltip>

            <Tooltip title={copiedFp ? "Copied!" : "Copy"} placement="top">
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
  );
}
