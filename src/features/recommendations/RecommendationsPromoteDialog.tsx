// src/features/recommendations/RecommendationsPromoteDialog.tsx
import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type PromoteField = "name" | "area" | "deviceType";

function safeString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export type RecommendationsPromoteDialogProps = {
  open: boolean;
  selected: { model?: unknown; id?: unknown } | null;
  promoteForm: { name: string; area: string; deviceType: string };
  promoting: boolean;
  promoteError: string | null;

  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChangeField: (field: PromoteField, value: string) => void;
};

export function RecommendationsPromoteDialog({
  open,
  selected,
  promoteForm,
  promoting,
  promoteError,
  onClose,
  onSubmit,
  onChangeField,
}: RecommendationsPromoteDialogProps) {
  const { t } = useTranslation(["common", "recommendations"]);

  if (!open || !selected) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("recommendations:promote.title")}</DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1, mb: 2, opacity: 0.85 }}>
          <div>
            <strong>{t("recommendations:promote.model")}:</strong>&nbsp;
            {safeString(selected.model)}
          </div>
          <div>
            <strong>{t("recommendations:promote.id")}:</strong>&nbsp;
            {safeString(selected.id)}
          </div>
        </Box>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label={t("recommendations:promote.name")}
              value={promoteForm.name}
              onChange={(e) => onChangeField("name", e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label={t("recommendations:promote.area")}
              value={promoteForm.area}
              onChange={(e) => onChangeField("area", e.target.value)}
              required
              fullWidth
            />

            <TextField
              label={t("recommendations:promote.deviceType")}
              value={promoteForm.deviceType}
              onChange={(e) => onChangeField("deviceType", e.target.value)}
              required
              fullWidth
            />

            {!!promoteError && <Alert severity="error">{promoteError}</Alert>}
          </Stack>

          <DialogActions sx={{ px: 0, mt: 2 }}>
            <Button onClick={onClose} disabled={promoting}>
              {t("common:actions.cancel")}
            </Button>
            <Button type="submit" variant="contained" disabled={promoting}>
              {t("common:actions.submit")}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
