// src/features/models/JsonStructureCard.tsx
import * as React from "react";
import {
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

import {
  JsonStructureTreeView,
  type JsonTreeNodeId,
} from "./JsonStructureTreeView";

import { useTranslation } from "react-i18next";

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

type Props = {
  jsonStructure: any;
};

export function JsonStructureCard({ jsonStructure }: Props) {
  const { t } = useTranslation(["common", "models"]);

  const [copiedJson, setCopiedJson] = React.useState(false);

  const [jsonExpanded, setJsonExpanded] = React.useState<JsonTreeNodeId[]>([
    "root",
  ]);
  const [allJsonNodeIds, setAllJsonNodeIds] = React.useState<JsonTreeNodeId[]>(
    [],
  );

  const handleCopyJsonStructure = React.useCallback(async () => {
    if (!jsonStructure) return;
    const text = JSON.stringify(jsonStructure, null, 2);
    const ok = await copyToClipboard(text);
    setCopiedJson(ok);
    window.setTimeout(() => setCopiedJson(false), 1200);
  }, [jsonStructure]);

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
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t("models:fields.jsonStructure")}
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Expand all" placement="top">
            <span>
              <IconButton
                size="small"
                onClick={() => setJsonExpanded(allJsonNodeIds)}
                disabled={allJsonNodeIds.length === 0}
                aria-label="Expand all"
              >
                <UnfoldMoreIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Collapse all" placement="top">
            <IconButton
              size="small"
              onClick={() => setJsonExpanded(["root"])}
              aria-label="Collapse all"
            >
              <UnfoldLessIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={copiedJson ? "Copied!" : "Copy JSON"} placement="top">
            <IconButton
              size="small"
              onClick={handleCopyJsonStructure}
              aria-label="Copy JSON"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <JsonStructureTreeView
        value={jsonStructure}
        maxHeight={420}
        expandedItems={jsonExpanded}
        onExpandedItemsChange={(_event, ids) =>
          setJsonExpanded(ids as JsonTreeNodeId[])
        }
        onNodeIdsComputed={(ids) => setAllJsonNodeIds(ids)}
      />
    </Paper>
  );
}
