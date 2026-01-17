import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SessionState = {
  isLoading: boolean;
  isAuthenticated: boolean;

  // keep it light: store what the UI + API needs
  accessToken: string | null;
  profile: {
    sub?: string;
    preferred_username?: string;
    name?: string;
    email?: string;
  } | null;

  permissions: string[];
};

const initialState: SessionState = {
  isLoading: true,
  isAuthenticated: false,
  accessToken: null,
  profile: null,
  permissions: [],
};

type SetSessionPayload = {
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
    clearSession(state) {
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

export const { setLoading, clearSession, setSession } = sessionSlice.actions;
export default sessionSlice.reducer;
