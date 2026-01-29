// src/features/models/JsonStructureTreeView.tsx
import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

export type JsonTreeNodeId = string;

export type JsonStructureTreeViewProps = {
  value: unknown;
  maxHeight?: number;

  // optional controlled expansion (enables Expand/Collapse all)
  expandedItems?: JsonTreeNodeId[];
  onExpandedItemsChange?: (
    event: React.SyntheticEvent,
    itemIds: string[],
  ) => void;

  // emits list of node ids in this tree (used by parent for Expand all)
  onNodeIdsComputed?: (ids: JsonTreeNodeId[]) => void;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function nodeType(v: unknown): string {
  if (Array.isArray(v)) return "Array";
  if (isPlainObject(v)) return "Object";
  if (v === null) return "null";
  return typeof v;
}

function childId(parent: string, key: string | number) {
  // stable readable ids: root.foo, root.arr[0]
  if (typeof key === "number") return `${parent}[${key}]`;
  // replace dots just in case, to avoid collision with our delimiter
  const safe = key.replaceAll(".", "·");
  return `${parent}.${safe}`;
}

function collectNodeIds(value: unknown, id: string): JsonTreeNodeId[] {
  const ids: JsonTreeNodeId[] = [id];

  if (Array.isArray(value)) {
    value.forEach((v, idx) => {
      ids.push(...collectNodeIds(v, childId(id, idx)));
    });
    return ids;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([k, v]) => {
      ids.push(...collectNodeIds(v, childId(id, k)));
    });
    return ids;
  }

  return ids;
}

function renderLabel(label: string, value: unknown) {
  const t = nodeType(value);

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {t}
      </Typography>
    </Stack>
  );
}

function buildTree(value: unknown, id: string, label: string): React.ReactNode {
  if (Array.isArray(value)) {
    return (
      <TreeItem key={id} itemId={id} label={renderLabel(label, value)}>
        {value.map((v, idx) => buildTree(v, childId(id, idx), String(idx)))}
      </TreeItem>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    return (
      <TreeItem key={id} itemId={id} label={renderLabel(label, value)}>
        {entries.map(([k, v]) => buildTree(v, childId(id, k), k))}
      </TreeItem>
    );
  }

  // leaf
  return (
    <TreeItem
      key={id}
      itemId={id}
      label={
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {String(value)}
          </Typography>
        </Stack>
      }
    />
  );
}

export function JsonStructureTreeView(props: JsonStructureTreeViewProps) {
  const {
    value,
    maxHeight = 420,
    expandedItems,
    onExpandedItemsChange,
    onNodeIdsComputed,
  } = props;

  React.useEffect(() => {
    if (!onNodeIdsComputed) return;
    onNodeIdsComputed(collectNodeIds(value, "root"));
  }, [value, onNodeIdsComputed]);

  return (
    <Box
      sx={{
        maxHeight,
        overflow: "auto",
        borderRadius: 1.5,
        bgcolor: "action.hover",
        p: 1,
      }}
    >
      <SimpleTreeView
        expandedItems={expandedItems}
        onExpandedItemsChange={onExpandedItemsChange}
      >
        {buildTree(value, "root", "root")}
      </SimpleTreeView>
    </Box>
  );
}
