import React from "react";
import type { User } from "oidc-client-ts";
import { userManager } from "./oidc";
import { getPermissionsFromAccessToken } from "./permissions";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    userManager.getUser().then((u) => {
      if (!mounted) return;
      setUser(u && !u.expired ? u : null);
      setIsLoading(false);
    });

    const onUserLoaded = (u: User) => setUser(u && !u.expired ? u : null);
    const onUserUnloaded = () => setUser(null);

    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addUserUnloaded(onUserUnloaded);

    return () => {
      mounted = false;
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeUserUnloaded(onUserUnloaded);
    };
  }, []);

  const permissions = React.useMemo(
    () => getPermissionsFromAccessToken(user?.access_token),
    [user?.access_token]
  );

  const value: AuthContextValue = {
    user,
    isLoading,
    permissions,

    login: async () => {
      // don't swallow errors; rethrow so UI can show a toast if desired
      await userManager.signinRedirect();
    },

    logout: async () => {
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
