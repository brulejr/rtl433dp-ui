// src/features/session/sessionSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

type SessionProfile = {
  sub?: string;
  preferred_username?: string;
  name?: string;
  email?: string;
};

export type SessionState = {
  isLoading: boolean;
  isAuthenticated: boolean;

  // keep it light: store what the UI + API needs
  accessToken: string | null;
  profile: SessionProfile | null;

  permissions: string[];
};

const initialState: SessionState = {
  isLoading: true,
  isAuthenticated: false,
  accessToken: null,
  profile: null,
  permissions: [],
};

export type SetSessionPayload = {
  accessToken: string | null;
  profile: SessionProfile | null;
  permissions: string[];
};

function applySignedOut(state: SessionState) {
  state.isAuthenticated = false;
  state.accessToken = null;
  state.profile = null;
  state.permissions = [];
}

function applySignedIn(state: SessionState, payload: SetSessionPayload) {
  state.isAuthenticated = !!payload.accessToken;
  state.accessToken = payload.accessToken;
  state.profile = payload.profile;
  state.permissions = payload.permissions ?? [];
}

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    // Back-compat name (some code may already use this)
    setSession(state, action: PayloadAction<SetSessionPayload>) {
      applySignedIn(state, action.payload);
    },

    // Preferred semantic name (some code may import this)
    signedIn(state, action: PayloadAction<SetSessionPayload>) {
      applySignedIn(state, action.payload);
    },

    // Back-compat name (some code may already use this)
    clearSession(state) {
      applySignedOut(state);
    },

    // Preferred semantic name (your code referenced this)
    signedOut(state) {
      applySignedOut(state);
    },
  },
});

export const { setLoading, setSession, signedIn, clearSession, signedOut } =
  sessionSlice.actions;

export default sessionSlice.reducer;

/**
 * Selectors
 */
export const selectSession = (s: RootState) => s.session;

export const selectIsLoading = (s: RootState) => s.session.isLoading;
export const selectIsAuthenticated = (s: RootState) => s.session.isAuthenticated;

export const selectAccessToken = (s: RootState) => s.session.accessToken;
export const selectProfile = (s: RootState) => s.session.profile;

export const selectPermissions = (s: RootState) => s.session.permissions;

/**
 * Curried selector:
 *   useAppSelector(selectHasPermission("recommendation:promote"))
 */
export const selectHasPermission =
  (permission: string) =>
  (s: RootState): boolean => {
    const p = (permission ?? "").trim();
    if (!p) return false;
    return s.session.permissions.includes(p);
  };
