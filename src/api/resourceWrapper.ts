/**
 * Adjust this to match your server's ResourceWrapper shape exactly.
 * The unwrap() function is the single place where you map wrapper -> payload.
 */
export type ResourceWrapper<T> = {
  data?: T;
  errors?: unknown;
  meta?: Record<string, unknown>;
};

export function unwrap<T>(w: ResourceWrapper<T>): T {
  if (w?.data === undefined) throw new Error("Response wrapper did not include 'data'.");
  return w.data;
}
