// src/features/session/sessionThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setLoading, signedIn, signedOut, type SetSessionPayload } from "./sessionSlice";

// 🔧 Update import to your real location
import { userManager } from "../../auth/oidc";

// 🔧 If you already have a permissions extractor, use it here.
// Otherwise return [] for now.
import { getPermissionsFromAccessToken } from "../../auth/permissions"; // <-- adjust or remove

function toSessionPayload(accessToken: string | null, profile: any): SetSessionPayload {
  return {
    accessToken,
    profile: profile
      ? {
          sub: profile.sub,
          preferred_username: profile.preferred_username,
          name: profile.name,
          email: profile.email,
        }
      : null,
    permissions: accessToken ? getPermissionsFromAccessToken(accessToken) : [],
  };
}

export const initSession = createAsyncThunk<void, void>(
  "session/initSession",
  async (_arg, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const user = await userManager.getUser();
      if (user && !user.expired && user.access_token) {
        dispatch(signedIn(toSessionPayload(user.access_token, user.profile)));
      } else {
        dispatch(signedOut());
      }
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const startLogin = createAsyncThunk<void, void>(
  "session/startLogin",
  async (_arg, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      await userManager.signinRedirect();
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const startLogout = createAsyncThunk<void, void>(
  "session/startLogout",
  async (_arg, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      dispatch(signedOut());
      await userManager.signoutRedirect();
    } finally {
      dispatch(setLoading(false));
    }
  }
);
