type JwtPayload = Record<string, unknown> & { permissions?: unknown };

function b64urlDecode(input: string): string {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function getPermissionsFromAccessToken(accessToken?: string): string[] {
  if (!accessToken) return [];
  const parts = accessToken.split(".");
  if (parts.length < 2) return [];
  try {
    const json = b64urlDecode(parts[1]);
    const payload = JSON.parse(json) as JwtPayload;
    const perms = payload.permissions;
    if (Array.isArray(perms)) return perms.map(String);
    return [];
  } catch {
    return [];
  }
}

export function hasPermission(perms: string[], needed: string): boolean {
  return perms.includes(needed);
}
