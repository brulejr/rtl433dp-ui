import React from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../../auth/AuthProvider";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  addDraftSensor,
  beginEditSensors,
  cancelEditSensors,
  patchDraftSensor,
  removeDraftSensor,
  saveModelSensors,
  selectIsEditingSensorsFor,
  selectSensorsEdit,
} from "./modelsSlice";
import { useGetModelDetailsQuery } from "./modelsApi";

export function ModelDetailsPage() {
  const { modelName, fingerprint } = useParams();
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const canUpdateSensors =
    auth.hasPermission("model:update") ||
    auth.hasPermission("model:promote") ||
    auth.hasPermission("model:admin");

  const isEditingForThis = useAppSelector(
    selectIsEditingSensorsFor(modelName ?? "", fingerprint ?? "")
  );
  const sensorsEdit = useAppSelector(selectSensorsEdit);

  const query = useGetModelDetailsQuery(
    { modelName: modelName ?? "", fingerprint: fingerprint ?? "" },
    { skip: !modelName || !fingerprint }
  );

  if (!modelName || !fingerprint) {
    return (
      <div style={{ padding: 16 }}>
        <div>Invalid route parameters.</div>
        <div style={{ marginTop: 8 }}>
          <Link to="/models">Back to Models</Link>
        </div>
      </div>
    );
  }

  const envelope = query.data;
  const details = envelope?.content;

  const sensors = isEditingForThis
    ? sensorsEdit.draftSensors
    : details?.sensors ?? [];

  const onEdit = () => {
    dispatch(
      beginEditSensors({
        modelName,
        fingerprint,
        sensors: details?.sensors ?? [],
      })
    );
  };

  const onSave = () => {
    dispatch(
      saveModelSensors({
        modelName,
        fingerprint,
        sensors: sensorsEdit.draftSensors,
      })
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/models">← Back to Models</Link>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Model Details</h2>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            Refresh
          </button>

          {canUpdateSensors && !isEditingForThis && (
            <button
              type="button"
              onClick={onEdit}
              disabled={query.isLoading || query.isFetching}
            >
              Edit Sensors
            </button>
          )}

          {canUpdateSensors && isEditingForThis && (
            <>
              <button
                type="button"
                onClick={onSave}
                disabled={sensorsEdit.isSaving}
              >
                {sensorsEdit.isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => dispatch(cancelEditSensors())}
                disabled={sensorsEdit.isSaving}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {query.isLoading ? (
        <div>Loading...</div>
      ) : query.isError ? (
        <div style={{ color: "crimson" }}>Failed to load model details.</div>
      ) : !details ? (
        <div>No details found.</div>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <div>
              <strong>Model:</strong> {details.model}
            </div>
            <div>
              <strong>Fingerprint:</strong> <code>{details.fingerprint}</code>
            </div>
            {details.category && (
              <div>
                <strong>Category:</strong> {details.category}
              </div>
            )}
            {details.source && (
              <div>
                <strong>Source:</strong> {details.source}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <h3 style={{ margin: 0 }}>Sensors</h3>

            {canUpdateSensors && isEditingForThis && (
              <div style={{ marginLeft: "auto" }}>
                <button
                  type="button"
                  onClick={() => dispatch(addDraftSensor())}
                  disabled={sensorsEdit.isSaving}
                >
                  + Add Sensor
                </button>
              </div>
            )}
          </div>

          {sensorsEdit.saveError && isEditingForThis && (
            <div style={{ color: "crimson", marginBottom: 8 }}>
              {sensorsEdit.saveError}
            </div>
          )}

          {sensors.length === 0 ? (
            <div>No sensors defined.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Value Path</th>
                  <th style={th}>Device Class</th>
                  <th style={th}>State Class</th>
                  <th style={th}>Unit</th>
                  <th style={th}>Icon</th>
                  <th style={th}>Enabled</th>
                  {canUpdateSensors && isEditingForThis && <th style={th}></th>}
                </tr>
              </thead>
              <tbody>
                {sensors.map((s, idx) => (
                  <tr key={`${idx}-${s.name}-${s.valuePath}`}>
                    <td style={td}>
                      {isEditingForThis ? (
                        <input
                          value={s.name ?? ""}
                          onChange={(e) =>
                            dispatch(
                              patchDraftSensor({
                                index: idx,
                                patch: { name: e.target.value },
                              })
                            )
                          }
                          style={{ width: "100%" }}
                        />
                      ) : (
                        s.name
                      )}
                    </td>

                    <td style={td}>
                      {isEditingForThis ? (
                        <input
                          value={s.valuePath ?? ""}
                          onChange={(e) =>
                            dispatch(
                              patchDraftSensor({
                                index: idx,
                                patch: { valuePath: e.target.value },
                              })
                            )
                          }
                          style={{ width: "100%", fontFamily: "monospace" }}
                          placeholder="temperature_C"
                        />
                      ) : (
                        <code>{s.valuePath ?? ""}</code>
                      )}
                    </td>

                    <td style={td}>
                      {isEditingForThis ? (
                        <input
                          value={s.deviceClass ?? ""}
                          onChange={(e) =>
                            dispatch(
                              patchDraftSensor({
                                index: idx,
                                patch: { deviceClass: e.target.value },
                              })
                            )
                          }
                          style={{ width: "100%" }}
                        />
                      ) : (
                        s.deviceClass ?? ""
                      )}
                    </td>

                    <td style={td}>
                      {isEditingForThis ? (
                        <input
                          value={s.stateClass ?? ""}
                          onChange={(e) =>
                            dispatch(
                              patchDraftSensor({
                                index: idx,
                                patch: { stateClass: e.target.value },
                              })
                            )
                          }
                          style={{ width: "100%" }}
                        />
                      ) : (
                        s.stateClass ?? ""
                      )}
                    </td>

                    <td style={td}>
                      {isEditingForThis ? (
                        <input
                          value={s.unitOfMeasurement ?? ""}
                          onChange={(e) =>
                            dispatch(
                              patchDraftSensor({
                                index: idx,
                                patch: { unitOfMeasurement: e.target.value },
                              })
                            )
                          }
                          style={{ width: "100%" }}
                        />
                      ) : (
                        s.unitOfMeasurement ?? ""
                      )}
                    </td>

                    <td style={td}>
                      {isEditingForThis ? (
                        <input
                          value={s.icon ?? ""}
                          onChange={(e) =>
                            dispatch(
                              patchDraftSensor({
                                index: idx,
                                patch: { icon: e.target.value },
                              })
                            )
                          }
                          style={{ width: "100%" }}
                          placeholder="mdi:thermometer"
                        />
                      ) : (
                        s.icon ?? ""
                      )}
                    </td>

                    <td style={td}>
                      {isEditingForThis ? (
                        <input
                          type="checkbox"
                          checked={s.enabled !== false}
                          onChange={(e) =>
                            dispatch(
                              patchDraftSensor({
                                index: idx,
                                patch: { enabled: e.target.checked },
                              })
                            )
                          }
                        />
                      ) : s.enabled === false ? (
                        "No"
                      ) : (
                        "Yes"
                      )}
                    </td>

                    {canUpdateSensors && isEditingForThis && (
                      <td style={td}>
                        <button
                          type="button"
                          onClick={() => dispatch(removeDraftSensor(idx))}
                          disabled={sensorsEdit.isSaving}
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
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
