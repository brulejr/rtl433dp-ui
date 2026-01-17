import React from "react";
import type { User } from "oidc-client-ts";
import { userManager, setHardLogoutListener } from "./oidc";
import { getPermissionsFromAccessToken } from "./permissions";

import { useAppDispatch } from "../app/hooks";
import {
  clearSession,
  setLoading as setSessionLoading,
  setSession,
} from "../features/session/sessionSlice";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  permissions: string[];
};

type AuthContextValue = AuthState & {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  hasPermission: (perm: string) => boolean;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

function normalizeUser(u: User | null): User | null {
  return u && !u.expired ? u : null;
}

function toProfile(user: User | null) {
  const p: any = user?.profile ?? null;
  if (!p) return null;

  return {
    sub: p.sub,
    preferred_username: p.preferred_username,
    name: p.name,
    email: p.email,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Register a listener so oidc.ts can notify the UI/store when it triggers a hard logout.
  React.useEffect(() => {
    setHardLogoutListener(async (reason, err) => {
      console.error("[auth] hard logout:", reason, err);

      // Immediately reflect logged-out state in UI + store
      setUser(null);
      dispatch(clearSession());

      // Ensure any spinners stop (we're redirecting anyway)
      setIsLoading(false);
      dispatch(setSessionLoading(false));
    });

    return () => {
      setHardLogoutListener(null);
    };
  }, [dispatch]);

  // Initial load + standard OIDC user events
  React.useEffect(() => {
    let mounted = true;

    setIsLoading(true);
    dispatch(setSessionLoading(true));

    userManager
      .getUser()
      .then((u) => {
        if (!mounted) return;

        const normalized = normalizeUser(u);
        setUser(normalized);

        const accessToken = normalized?.access_token ?? null;
        const permissions = getPermissionsFromAccessToken(accessToken);

        if (accessToken) {
          dispatch(
            setSession({
              accessToken,
              profile: toProfile(normalized),
              permissions,
            })
          );
        } else {
          dispatch(clearSession());
        }

        setIsLoading(false);
        dispatch(setSessionLoading(false));
      })
      .catch((err) => {
        console.error("[auth] Failed to load OIDC user.", err);
        if (!mounted) return;

        setUser(null);
        dispatch(clearSession());

        setIsLoading(false);
        dispatch(setSessionLoading(false));
      });

    const onUserLoaded = (u: User) => {
      const normalized = normalizeUser(u);
      setUser(normalized);

      const accessToken = normalized?.access_token ?? null;
      const permissions = getPermissionsFromAccessToken(accessToken);

      if (accessToken) {
        dispatch(
          setSession({
            accessToken,
            profile: toProfile(normalized),
            permissions,
          })
        );
      } else {
        dispatch(clearSession());
      }
    };

    const onUserUnloaded = () => {
      setUser(null);
      dispatch(clearSession());
    };

    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addUserUnloaded(onUserUnloaded);

    return () => {
      mounted = false;
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeUserUnloaded(onUserUnloaded);
    };
  }, [dispatch]);

  const permissions = React.useMemo(
    () => getPermissionsFromAccessToken(user?.access_token),
    [user?.access_token]
  );

  const value: AuthContextValue = {
    user,
    isLoading,
    permissions,

    login: async () => {
      await userManager.signinRedirect();
    },

    logout: async () => {
      // Clear local UI/store immediately for snappy UX (optional but nice)
      setUser(null);
      dispatch(clearSession());

      await userManager.signoutRedirect();
    },

    getAccessToken: () => (user?.access_token ? user.access_token : null),

    hasPermission: (perm: string) => permissions.includes(perm),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
