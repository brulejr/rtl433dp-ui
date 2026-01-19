/**
 * The backend responses in this project commonly look like:
 * { content: T, status: number, timestamp: string, messages: string[] }
 */
export type ApiEnvelope<T> = {
  content: T;
  status?: number;
  timestamp?: string;
  messages?: string[];
};
