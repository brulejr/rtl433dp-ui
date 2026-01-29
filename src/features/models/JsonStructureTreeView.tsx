// src/features/models/JsonStructureTreeView.tsx
import { Box, Stack, Typography } from "@mui/material";

import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export type JsonStructureTreeViewProps = {
  value: unknown;
  maxHeight?: number;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function labelForPrimitive(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint")
    return String(v);
  return Object.prototype.toString.call(v);
}

function nodeSummary(v: unknown): string {
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (isObject(v)) return "Object";
  return labelForPrimitive(v);
}

function JsonNode({
  name,
  value,
  path,
}: {
  name: string;
  value: unknown;
  path: string;
}) {
  const itemId = path || "root";

  const isArr = Array.isArray(value);
  const isObj = isObject(value);

  const hasChildren =
    (isArr && value.length > 0) || (isObj && Object.keys(value).length > 0);

  const label = (
    <Stack direction="row" spacing={1} alignItems="baseline" sx={{ py: 0.25 }}>
      <Typography
        variant="body2"
        sx={{ fontFamily: "monospace", fontWeight: 600 }}
      >
        {name}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {hasChildren ? nodeSummary(value) : String(nodeSummary(value))}
      </Typography>

      {!hasChildren && (
        <Typography
          variant="caption"
          sx={{ fontFamily: "monospace" }}
          color="text.secondary"
        >
          {/* If jsonStructure is the usual { field: "number" } shape, show the type nicely */}
          {typeof value === "string"
            ? `: ${value}`
            : `: ${labelForPrimitive(value)}`}
        </Typography>
      )}
    </Stack>
  );

  if (!hasChildren) {
    return <TreeItem itemId={itemId} label={label} />;
  }

  if (isArr) {
    return (
      <TreeItem itemId={itemId} label={label}>
        {value.map((child, idx) => (
          <JsonNode
            key={`${itemId}.${idx}`}
            name={`[${idx}]`}
            value={child}
            path={`${itemId}.${idx}`}
          />
        ))}
      </TreeItem>
    );
  }

  // object
  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
  return (
    <TreeItem itemId={itemId} label={label}>
      {entries.map(([k, v]) => (
        <JsonNode
          key={`${itemId}.${k}`}
          name={k}
          value={v}
          path={`${itemId}.${k}`}
        />
      ))}
    </TreeItem>
  );
}

export function JsonStructureTreeView(props: JsonStructureTreeViewProps) {
  const { value, maxHeight = 260 } = props;

  return (
    <Box
      sx={{
        mt: 1,
        p: 1,
        borderRadius: 1,
        bgcolor: "action.hover",
        overflow: "auto",
        maxHeight,
      }}
    >
      <SimpleTreeView
        aria-label="JSON structure"
        slots={{
          expandIcon: ChevronRightIcon,
          collapseIcon: ExpandMoreIcon,
        }}
        sx={{
          "& .MuiTreeItem-label": {
            width: "100%",
          },
        }}
      >
        <JsonNode name="root" value={value} path="root" />
      </SimpleTreeView>
    </Box>
  );
}
