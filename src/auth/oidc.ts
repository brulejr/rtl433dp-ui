import {
  UserManager,
  WebStorageStateStore,
  type UserManagerSettings,
  Log,
} from "oidc-client-ts";
import { config } from "../app/config";

// Optional: helps during setup
Log.setLogger(console);
Log.setLevel(Log.INFO);

const settings: UserManagerSettings = {
  authority: config.oidc.authority,
  client_id: config.oidc.clientId,
  redirect_uri: config.oidc.redirectUri,
  post_logout_redirect_uri: config.oidc.postLogoutRedirectUri,
  response_type: "code", // PKCE
  scope: config.oidc.scope,

  userStore: new WebStorageStateStore({ store: window.sessionStorage }),

  // 🔑 token lifecycle
  automaticSilentRenew: true,

  // Optional but nice: logs user out if Keycloak session ends elsewhere
  monitorSession: true,

  // Optional: reduce "token expired" race (seconds before expiry)
  accessTokenExpiringNotificationTime: 30,
};

export const userManager = new UserManager(settings);

// --- Auto-logout mechanics ---
// centralizes "hard logout" for any unrecoverable auth failure
async function hardLogout(reason: string, err?: unknown) {
  console.warn(`[auth] ${reason}`, err);
  try {
    await userManager.removeUser();
  } finally {
    // Keep it simple: return to login page
    window.location.assign("/login");
  }
}

// If silent renew fails (refresh token invalid/expired, session ended, etc.)
userManager.events.addSilentRenewError((err) => {
  void hardLogout("silent renew failed", err);
});

// If token expires and we didn't renew in time, try once, then logout
userManager.events.addAccessTokenExpired(() => {
  void userManager
    .signinSilent()
    .catch((err) => hardLogout("access token expired; renew failed", err));
});

// Optional: if Keycloak ends the session (logout in another tab, admin logout, etc.)
userManager.events.addUserSignedOut(() => {
  void hardLogout("user signed out at provider");
});
