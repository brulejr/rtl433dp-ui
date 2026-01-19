// src/features/session/sessionSelectors.ts
import type { RootState } from "../../app/store";

export const selectAccessToken = (s: RootState) => s.session.accessToken ?? null;

// Expect permissions to live in session slice.
// If undefined, we default to [] so callers stay simple.
export const selectPermissions = (s: RootState) => s.session.permissions ?? [];

export const selectHasPermission =
  (permission: string) =>
  (s: RootState): boolean =>
    (s.session.permissions ?? []).includes(permission);
