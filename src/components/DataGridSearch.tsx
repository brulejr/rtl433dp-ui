// src/components/DataGridSearch.tsx
import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";

import { useTranslation } from "react-i18next";

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

type Props = {
  canSearch?: boolean;
  searchJson: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onReset: (event: React.MouseEvent<HTMLElement>) => void;
  onSearch: (event: React.MouseEvent<HTMLElement>) => void;
};

export function DataGridSearch({
  canSearch = true,
  searchJson,
  onChange,
  onReset,
  onSearch,
}: Props) {
  const { t } = useTranslation(["common"]);

  if (!canSearch) return null;

  const jsonValidation = React.useMemo(
    () => safeJsonParse(searchJson),
    [searchJson],
  );

  return (
    <Accordion disabled={!canSearch}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 600 }}>
          {t("common:labels.search")}
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={2}>
          <TextField
            label="JSON body"
            value={searchJson}
            onChange={onChange}
            multiline
            minRows={6}
            placeholder='Example: {"model":"Acurite-5n1"}'
            error={!jsonValidation.ok}
            helperText={t("common:labels.searchHelperText")}
            fullWidth
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={onReset}
            >
              {t("common:actions.reset")}
            </Button>

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={onSearch}
              disabled={!canSearch || !jsonValidation.ok}
            >
              {t("common:actions.search")}
            </Button>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
