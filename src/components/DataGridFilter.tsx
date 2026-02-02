// src/components/DataGridFilter.tsx
import * as React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import { useTranslation } from "react-i18next";

type Props = {
  canFilter?: boolean;
  filterText: string;
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
  const labelText = t("common:actions.filter");

  // Internal UI state (still syncs with parent changes)
  const [value, setValue] = React.useState<string>(filterText ?? "");

  React.useEffect(() => {
    setValue(filterText ?? "");
  }, [filterText]);

  if (!canFilter) return null;

  const showLabel = value.length > 0;
  const showReset = value.length > 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValue(e.target.value);
    onChange(e);
  };

  const handleReset = React.useCallback(() => {
    setValue("");

    // Fire onChange so parent can react the same way it does for typing
    const syntheticEvent = {
      target: { value: "" },
      currentTarget: { value: "" },
    } as unknown as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

    onChange(syntheticEvent);
  }, [onChange]);

  return (
    <TextField
      label={showLabel ? labelText : undefined}
      placeholder={labelText}
      value={value}
      onChange={handleChange}
      fullWidth
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          if (value.length > 0) handleReset();
        }
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: showReset ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              edge="end"
              aria-label={t("common:actions.reset") ?? "Reset"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleReset();
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
    />
  );
}
