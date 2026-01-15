export function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre style={{
      background: "rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: 12,
      overflow: "auto",
      maxHeight: 420
    }}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
