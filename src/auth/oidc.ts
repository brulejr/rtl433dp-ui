import { UserManager, WebStorageStateStore, type UserManagerSettings } from "oidc-client-ts";
import { config } from "../app/config";

const settings: UserManagerSettings = {
  authority: config.oidc.authority,
  client_id: config.oidc.clientId,
  redirect_uri: config.oidc.redirectUri,
  post_logout_redirect_uri: config.oidc.postLogoutRedirectUri,
  response_type: "code", // PKCE
  scope: config.oidc.scope,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  automaticSilentRenew: true
};

export const userManager = new UserManager(settings);
