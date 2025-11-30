/**
 * FabricaTimestampFixModal Component
 * 
 * WORKFLOW_011_database-cleanup_fabrica-timestamp-fix: Step 2-6
 * Displays a detailed table view of all timestamps from both the `contents` property
 * and APPEARS_IN relationships, allowing manual creation of missing Jingle entities.
 */

import { useState, useEffect } from 'react';
import { adminApi, publicApi } from '../../lib/api/client';
import { parseTimestampFromText } from '../../lib/utils/timestampParser';
import { parseTimestampToSeconds, formatSecondsToTimestamp } from '../../lib/utils/timestamp';
import type { Fabrica, Jingle } from '../../types';

interface FabricaTimestampFixModalProps {
  fabricaId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface TimestampRow {
  timestamp: number; // seconds
  timestampFormatted: string; // "HH:MM:SS"
  contenido: string; // Parsed from contents property
  jingle: {
    id: string;
    title?: string;
    comment?: string;
  } | null;
  source: "contents" | "appears_in" | "both";
  rowId: string; // Unique ID for React key
}

/**
 * WORKFLOW_011: Content Parsing Algorithm
 * Parses contents property to extract timestamps and their associated content strings.
 */
function parseContentByTimestamps(contents: string): Map<number, string> {
  const lines = contents.split("\n");
  const timestampMap = new Map<number, string>();

  let currentTimestamp: number | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const timestampStr = parseTimestampFromText(line);
    if (timestampStr) {
      // Save previous timestamp's content
      if (currentTimestamp !== null) {
        timestampMap.set(currentTimestamp, currentContent.join(" ").trim());
      }
      // Start new timestamp
      currentTimestamp = parseTimestampToSeconds(timestampStr);
      currentContent = [line.replace(timestampStr, "").trim()];
    } else if (currentTimestamp !== null) {
      // Continue accumulating content for current timestamp
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        currentContent.push(trimmed);
      }
    }
  }

  // Save last timestamp's content
  if (currentTimestamp !== null) {
    timestampMap.set(currentTimestamp, currentContent.join(" ").trim());
  }

  return timestampMap;
}

export default function FabricaTimestampFixModal({
  fabricaId,
  isOpen,
  onClose,
}: FabricaTimestampFixModalProps) {
  const [fabrica, setFabrica] = useState<Fabrica | null>(null);
  const [rows, setRows] = useState<TimestampRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingRows, setCreatingRows] = useState<Set<string>>(new Set());

  // WORKFLOW_011: Step 2 - Fetch Fabrica data and APPEARS_IN relationships
  useEffect(() => {
    if (!isOpen || !fabricaId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch Fabrica entity
        const fabricaData = await adminApi.getFabrica(fabricaId);
        setFabrica(fabricaData);

        // Fetch APPEARS_IN relationships (via getFabricaJingles)
        // Note: Using publicApi because this endpoint exists in public API, not admin API
        const jingles = await publicApi.getFabricaJingles(fabricaId);

        // Parse timestamps from contents
        const contentsTimestamps = new Map<number, string>();
        if (fabricaData.contents) {
          const parsed = parseContentByTimestamps(fabricaData.contents);
          parsed.forEach((content, timestamp) => {
            contentsTimestamps.set(timestamp, content);
          });
        }

        // Build unified table
        const rowsMap = new Map<number, TimestampRow>();

        // Add timestamps from contents
        contentsTimestamps.forEach((contenido, timestamp) => {
          rowsMap.set(timestamp, {
            timestamp,
            timestampFormatted: formatSecondsToTimestamp(timestamp),
            contenido,
            jingle: null,
            source: "contents",
            rowId: `contents-${timestamp}`,
          });
        });

        // Add timestamps from APPEARS_IN relationships
        jingles.forEach((jingle) => {
          const timestamp = jingle.timestamp || 0;
          const existingRow = rowsMap.get(timestamp);

          if (existingRow) {
            // Merge: timestamp exists in both sources
            existingRow.jingle = {
              id: jingle.id,
              title: jingle.title,
              comment: jingle.comment,
            };
            existingRow.source = "both";
          } else {
            // Only in APPEARS_IN
            rowsMap.set(timestamp, {
              timestamp,
              timestampFormatted: formatSecondsToTimestamp(timestamp),
              contenido: "-",
              jingle: {
                id: jingle.id,
                title: jingle.title,
                comment: jingle.comment,
              },
              source: "appears_in",
              rowId: `appears_in-${timestamp}-${jingle.id}`,
            });
          }
        });

        // Convert to sorted array
        const sortedRows = Array.from(rowsMap.values()).sort(
          (a, b) => a.timestamp - b.timestamp
        );

        setRows(sortedRows);
      } catch (err: any) {
        setError(err.message || "Error loading Fabrica data");
        console.error("Error fetching Fabrica data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, fabricaId]);

  // WORKFLOW_011: Step 4 - Create missing Jingle
  const handleCreateJingle = async (row: TimestampRow) => {
    if (!fabrica || row.jingle !== null || row.contenido === "-") {
      return;
    }

    const rowId = row.rowId;
    
    // Prevent multiple simultaneous creations for the same row
    if (creatingRows.has(rowId)) {
      return;
    }
    
    setCreatingRows((prev) => new Set(prev).add(rowId));
    setError(null); // Clear any previous errors

    try {
      // Create Jingle entity
      const contenidoString = row.contenido || "";
      const title = contenidoString.substring(0, 100);
      const comment = contenidoString;

      // Ensure all values are primitives (not BigInt) and provide required defaults
      // Convert fabrica.id to string explicitly to avoid BigInt issues
      const fabricaIdString = typeof fabrica.id === 'bigint' ? String(fabrica.id) : String(fabrica.id);
      
      // Ensure timestamp is a regular number, not BigInt
      const timestampSeconds = typeof row.timestamp === 'bigint' 
        ? Number(row.timestamp) 
        : Number(row.timestamp);
      
      // Create Jingle WITHOUT fabricaId to avoid auto-creating relationship with timestamp: 0
      // We'll create the relationship manually with the correct timestamp
      const newJingle = await adminApi.createJingle({
        title: title || undefined,
        comment: comment || undefined,
        // Don't pass fabricaId - we'll create the relationship manually
        isJinglazo: false,
        isJinglazoDelDia: false,
        isPrecario: false,
        isLive: false,
        isRepeat: false,
      });

      // Create APPEARS_IN relationship directly with correct timestamp
      // This avoids the issue of having to update a relationship that was auto-created with timestamp: 0
      await adminApi.post("/relationships/appears_in", {
        start: newJingle.id,
        end: fabricaIdString,
        timestamp: timestampSeconds, // Set correct timestamp from the start
      });

      // Refresh data
      // Note: Using publicApi because this endpoint exists in public API, not admin API
      const jingles = await publicApi.getFabricaJingles(fabricaId);

      // Rebuild table
      const contentsTimestamps = new Map<number, string>();
      if (fabrica.contents) {
        const parsed = parseContentByTimestamps(fabrica.contents);
        parsed.forEach((content, timestamp) => {
          contentsTimestamps.set(timestamp, content);
        });
      }

      const rowsMap = new Map<number, TimestampRow>();
      contentsTimestamps.forEach((contenido, timestamp) => {
        rowsMap.set(timestamp, {
          timestamp,
          timestampFormatted: formatSecondsToTimestamp(timestamp),
          contenido,
          jingle: null,
          source: "contents",
          rowId: `contents-${timestamp}`,
        });
      });

      jingles.forEach((jingle) => {
        const timestamp = jingle.timestamp || 0;
        const existingRow = rowsMap.get(timestamp);
        if (existingRow) {
          existingRow.jingle = {
            id: jingle.id,
            title: jingle.title,
            comment: jingle.comment,
          };
          existingRow.source = "both";
        } else {
          rowsMap.set(timestamp, {
            timestamp,
            timestampFormatted: formatSecondsToTimestamp(timestamp),
            contenido: "-",
            jingle: {
              id: jingle.id,
              title: jingle.title,
              comment: jingle.comment,
            },
            source: "appears_in",
            rowId: `appears_in-${timestamp}-${jingle.id}`,
          });
        }
      });

      const sortedRows = Array.from(rowsMap.values()).sort(
        (a, b) => a.timestamp - b.timestamp
      );

      setRows(sortedRows);
    } catch (err: any) {
      console.error("Error creating Jingle:", err);
      const errorMessage = err.message || "Failed to create Jingle";
      setError(errorMessage);
      
      // Show user-friendly error message
      alert(`Error al crear Jingle: ${errorMessage}\n\nPor favor, intente nuevamente.`);
    } finally {
      setCreatingRows((prev) => {
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10001, // Above CleanupResultsModal (zIndex 10000)
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "2rem",
          maxWidth: "1200px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
        aria-label="Fix Fabrica Timestamps"
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#333",
              }}
            >
              Arreglar Timestamps de Fabrica
            </h2>
            {fabrica && (
              <p
                style={{
                  margin: "0.5rem 0 0 0",
                  fontSize: "0.875rem",
                  color: "#666",
                }}
              >
                {fabrica.title || fabrica.id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#666",
              padding: "0.25rem 0.5rem",
            }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#ffebee",
              borderRadius: "4px",
              marginBottom: "1rem",
              color: "#c62828",
            }}
          >
            <strong>Error:</strong> {error}
            <button
              onClick={async () => {
                setError(null);
                setIsLoading(true);
                try {
                  const fabricaData = await adminApi.getFabrica(fabricaId);
                  setFabrica(fabricaData);
                  const jingles = await adminApi.getFabricaJingles(fabricaId);
                  
                  const contentsTimestamps = new Map<number, string>();
                  if (fabricaData.contents) {
                    const parsed = parseContentByTimestamps(fabricaData.contents);
                    parsed.forEach((content, timestamp) => {
                      contentsTimestamps.set(timestamp, content);
                    });
                  }

                  const rowsMap = new Map<number, TimestampRow>();
                  contentsTimestamps.forEach((contenido, timestamp) => {
                    rowsMap.set(timestamp, {
                      timestamp,
                      timestampFormatted: formatSecondsToTimestamp(timestamp),
                      contenido,
                      jingle: null,
                      source: "contents",
                      rowId: `contents-${timestamp}`,
                    });
                  });

                  jingles.forEach((jingle) => {
                    const timestamp = jingle.timestamp || 0;
                    const existingRow = rowsMap.get(timestamp);
                    if (existingRow) {
                      existingRow.jingle = {
                        id: jingle.id,
                        title: jingle.title,
                        comment: jingle.comment,
                      };
                      existingRow.source = "both";
                    } else {
                      rowsMap.set(timestamp, {
                        timestamp,
                        timestampFormatted: formatSecondsToTimestamp(timestamp),
                        contenido: "-",
                        jingle: {
                          id: jingle.id,
                          title: jingle.title,
                          comment: jingle.comment,
                        },
                        source: "appears_in",
                        rowId: `appears_in-${timestamp}-${jingle.id}`,
                      });
                    }
                  });

                  const sortedRows = Array.from(rowsMap.values()).sort(
                    (a, b) => a.timestamp - b.timestamp
                  );
                  setRows(sortedRows);
                } catch (err: any) {
                  setError(err.message || "Error loading Fabrica data");
                } finally {
                  setIsLoading(false);
                }
              }}
              style={{
                marginLeft: "1rem",
                padding: "0.25rem 0.5rem",
                backgroundColor: "#c62828",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #e0e0e0",
                borderTop: "4px solid #1976d2",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ marginTop: "1rem", color: "#666" }}>
              Cargando datos de Fabrica...
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && rows.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                overflowX: "auto",
                maxHeight: "500px",
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
                aria-label="Timestamp comparison table"
              >
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "#f5f5f5",
                    zIndex: 10,
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        width: "120px",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      Timestamp
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        minWidth: "300px",
                      }}
                    >
                      Contenido
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        minWidth: "200px",
                      }}
                    >
                      Jingle
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                        borderBottom: "2px solid #ddd",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        width: "100px",
                      }}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => {
                    const isCreating = creatingRows.has(row.rowId);
                    const canFix = row.jingle === null && row.contenido !== "-";
                    const isEven = rowIndex % 2 === 0;
                    const rowBgColor = isEven ? "#fafafa" : "#fff";

                    return (
                      <tr
                        key={row.rowId}
                        style={{
                          backgroundColor: rowBgColor,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0f0f0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = rowBgColor;
                        }}
                      >
                        <td
                          style={{
                            padding: "0.75rem",
                            borderBottom: "1px solid #ddd",
                            fontFamily: "monospace",
                            fontSize: "0.875rem",
                            position: "sticky",
                            left: 0,
                            backgroundColor: rowBgColor,
                            color: "#333",
                            fontWeight: 500,
                          }}
                        >
                          {row.timestampFormatted}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            borderBottom: "1px solid #ddd",
                            fontSize: "0.875rem",
                            color: "#333",
                            fontWeight: 400,
                          }}
                        >
                          {row.contenido || "-"}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            borderBottom: "1px solid #ddd",
                            fontSize: "0.875rem",
                            color: "#333",
                          }}
                        >
                          {row.jingle ? (
                            <div>
                              <div style={{ fontWeight: 600, color: "#333" }}>
                                {row.jingle.title || row.jingle.id}
                              </div>
                              {row.jingle.comment && (
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "#666",
                                    marginTop: "0.25rem",
                                  }}
                                >
                                  {row.jingle.comment}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "#999", fontStyle: "italic" }}>
                              No Jingle
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            borderBottom: "1px solid #ddd",
                            textAlign: "center",
                          }}
                        >
                          {canFix ? (
                            <button
                              onClick={() => handleCreateJingle(row)}
                              disabled={isCreating}
                              style={{
                                padding: "0.25rem 0.5rem",
                                backgroundColor: isCreating
                                  ? "#e0e0e0"
                                  : "#1976d2",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isCreating ? "not-allowed" : "pointer",
                                fontSize: "0.875rem",
                                opacity: isCreating ? 0.6 : 1,
                              }}
                              aria-label={
                                isCreating
                                  ? "Creando Jingle..."
                                  : `Arreglar timestamp ${row.timestampFormatted}`
                              }
                            >
                              {isCreating ? "Creando..." : "ARREGLAR"}
                            </button>
                          ) : (
                            <span
                              style={{
                                color: "#999",
                                fontSize: "0.75rem",
                                fontStyle: "italic",
                              }}
                            >
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && rows.length === 0 && !error && (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#666",
            }}
          >
            <p>No se encontraron timestamps para esta Fabrica.</p>
          </div>
        )}

        {/* Close Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            borderTop: "1px solid #ddd",
            paddingTop: "1rem",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#666",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

