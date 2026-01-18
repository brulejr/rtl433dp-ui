import React from "react";
import { Link } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  clearSearch,
  runModelsSearch,
  selectModelsIsSearching,
  selectModelsMode,
  selectModelsSearchError,
  selectModelsSearchJson,
  selectModelsSearchResults,
  setMode,
  setSearchJson,
} from "./modelsSlice";
import { useListModelsQuery, type ModelSummary } from "./modelsApi";

export default function ModelsPage() {
  const dispatch = useAppDispatch();

  const mode = useAppSelector(selectModelsMode);
  const searchJson = useAppSelector(selectModelsSearchJson);
  const isSearching = useAppSelector(selectModelsIsSearching);
  const searchError = useAppSelector(selectModelsSearchError);
  const searchResults = useAppSelector(selectModelsSearchResults);

  const listQuery = useListModelsQuery(undefined, {
    // only matters for rendering; RTKQ will cache anyway
    skip: mode !== "list",
  });

  const isLoading =
    mode === "list" ? listQuery.isLoading || listQuery.isFetching : isSearching;

  const items: ModelSummary[] =
    mode === "list" ? listQuery.data?.content ?? [] : searchResults ?? [];

  const onRefresh = () => {
    if (mode === "list") {
      void listQuery.refetch();
    } else {
      dispatch(runModelsSearch(searchJson));
    }
  };

  const onRunSearch = () => {
    dispatch(runModelsSearch(searchJson));
  };

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Models</h2>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => dispatch(setMode("list"))}
            disabled={mode === "list"}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => dispatch(setMode("search"))}
            disabled={mode === "search"}
          >
            Search
          </button>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button type="button" onClick={onRefresh} disabled={isLoading}>
            Refresh
          </button>
        </div>
      </div>

      {mode === "search" && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Search</strong> (JSON body)
          </div>
          <textarea
            value={searchJson}
            onChange={(e) => dispatch(setSearchJson(e.target.value))}
            rows={10}
            style={{ width: "100%", fontFamily: "monospace" }}
            placeholder='{\n  "model": "Acurite-Tower"\n}'
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="button" onClick={onRunSearch} disabled={isSearching}>
              Search
            </button>
            <button
              type="button"
              onClick={() => dispatch(clearSearch())}
              disabled={isSearching}
            >
              Reset
            </button>
          </div>

          {searchError && (
            <div style={{ marginTop: 8, color: "crimson" }}>{searchError}</div>
          )}
        </div>
      )}

      {mode === "list" && listQuery.isError && (
        <div style={{ color: "crimson", marginBottom: 12 }}>
          Failed to load models.
        </div>
      )}

      {isLoading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div>No models found.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Model</th>
              <th style={th}>Fingerprint</th>
              <th style={th}>Category</th>
              <th style={th}>Source</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={`${m.model}:${m.fingerprint}`}>
                <td style={td}>{m.model}</td>
                <td style={td} title={m.fingerprint}>
                  <code>{m.fingerprint}</code>
                </td>
                <td style={td}>{m.category ?? ""}</td>
                <td style={td}>{m.source ?? ""}</td>
                <td style={td}>
                  <Link
                    to={`/models/${encodeURIComponent(
                      m.model
                    )}/${encodeURIComponent(m.fingerprint)}`}
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "8px 6px",
};

const td: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "8px 6px",
  verticalAlign: "top",
};
