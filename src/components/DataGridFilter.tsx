// src/components/DataGridFilter.tsx
import * as React from "react";
import { TextField } from "@mui/material";

import { useTranslation } from "react-i18next";

type Props = {
  canFilter?: boolean;
  filterText: String;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

export function DataGridFilter({
  canFilter = true,
  filterText,
  onChange,
}: Props) {
  const { t } = useTranslation(["common"]);

  if (!canFilter) return null;

  return (
    <TextField
      label={t("common:actions.filter")}
      value={filterText}
      onChange={onChange}
      fullWidth
    />
  );
}
