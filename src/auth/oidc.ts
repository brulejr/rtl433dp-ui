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

  // token lifecycle
  automaticSilentRenew: true,
  monitorSession: true,
  accessTokenExpiringNotificationTime: 30,
};

export const userManager = new UserManager(settings);

/**
 * Optional integration hook so the UI layer (AuthProvider/Redux) can react
 * to unrecoverable auth failures before we redirect.
 */
export type HardLogoutListener = (reason: string, err?: unknown) => void | Promise<void>;

let hardLogoutListener: HardLogoutListener | null = null;

export function setHardLogoutListener(listener: HardLogoutListener | null) {
  hardLogoutListener = listener;
}

// --- Auto-logout mechanics ---
// centralizes "hard logout" for any unrecoverable auth failure
async function hardLogout(reason: string, err?: unknown) {
  console.warn(`[auth] ${reason}`, err);

  // Let the UI clear state (React + Redux) before we redirect away.
  try {
    await hardLogoutListener?.(reason, err);
  } catch (listenerErr) {
    console.warn("[auth] hardLogoutListener failed", listenerErr);
  }

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
