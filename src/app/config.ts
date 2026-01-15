export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,

  oidc: {
    authority: import.meta.env.VITE_OIDC_AUTHORITY as string,
    clientId: import.meta.env.VITE_OIDC_CLIENT_ID as string,
    redirectUri: import.meta.env.VITE_OIDC_REDIRECT_URI as string,
    postLogoutRedirectUri: import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI as string,
    scope: (import.meta.env.VITE_OIDC_SCOPE as string) || "openid profile email",
  },
};
