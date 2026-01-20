// src/app/apiEnvelope.ts
export function unwrapContent<T>(json: any): T[] {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.content)) return json.content;
  if (Array.isArray(json.items)) return json.items; // optional future-proof
  return [];
}
