import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SessionProfile = {
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
  profile: SessionState["profile"];
  permissions: string[];
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    // keep for backwards-compat with existing code
    clearSession(state) {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.profile = null;
      state.permissions = [];
    },

    // new: explicit action name used by baseApi 401 handling
    signedOut(state) {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.profile = null;
      state.permissions = [];
    },

    setSession(state, action: PayloadAction<SetSessionPayload>) {
      state.isAuthenticated = !!action.payload.accessToken;
      state.accessToken = action.payload.accessToken;
      state.profile = action.payload.profile;
      state.permissions = action.payload.permissions;
    },
  },
});

export const { setLoading, clearSession, signedOut, setSession } =
  sessionSlice.actions;

export default sessionSlice.reducer;
