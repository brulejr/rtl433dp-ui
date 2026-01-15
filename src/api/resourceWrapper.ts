/**
 * Adjust this to match your server's ResourceWrapper shape exactly.
 * The unwrap() function is the single place where you map wrapper -> payload.
 */
export type ResourceWrapper<T> = {
  content: T;
  status: number;
  timestamp: string;
  messages?: unknown[];
};

export function unwrap<T>(w: ResourceWrapper<T>): T {
  if (w?.content === undefined) {
    throw new Error("Response wrapper did not include 'content'.");
  }
  return w.content;
}
