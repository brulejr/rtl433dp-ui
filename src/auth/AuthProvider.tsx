import React from "react";
import type { User } from "oidc-client-ts";
import { userManager } from "./oidc";

type AuthState = {
  user: User | null;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
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

  const value: AuthContextValue = {
    user,
    isLoading,
    login: async () => {
      try {
        await userManager.signinRedirect();
      } catch (e) {
        console.error(e);
      }
    },
    logout: async () => {
      await userManager.signoutRedirect();
    },
    getAccessToken: () => (user?.access_token ? user.access_token : null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
