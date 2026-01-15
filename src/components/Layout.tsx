import { NavLink, Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

const linkStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  textDecoration: "none"
};

export function AppShell() {
  const { t } = useTranslation(["common"]);
  const { logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e6edf7" }}>
      <header style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontWeight: 700 }}>{t("common:appTitle")}</div>
            <nav style={{ display: "flex", gap: 8, marginLeft: 12, flexWrap: "wrap" }}>
              <NavLink to="/" style={({ isActive }) => ({ ...linkStyle, background: isActive ? "rgba(255,255,255,0.12)" : "transparent" })}>
                {t("common:nav.profile")}
              </NavLink>
              <NavLink to="/models" style={({ isActive }) => ({ ...linkStyle, background: isActive ? "rgba(255,255,255,0.12)" : "transparent" })}>
                {t("common:nav.models")}
              </NavLink>
              <NavLink to="/recommendations" style={({ isActive }) => ({ ...linkStyle, background: isActive ? "rgba(255,255,255,0.12)" : "transparent" })}>
                {t("common:nav.recommendations")}
              </NavLink>
              <NavLink to="/known-devices" style={({ isActive }) => ({ ...linkStyle, background: isActive ? "rgba(255,255,255,0.12)" : "transparent" })}>
                {t("common:nav.knownDevices")}
              </NavLink>
            </nav>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <LanguageSwitcher />
            <button onClick={() => logout()} style={{ padding: "8px 10px", borderRadius: 8 }}>
              {t("common:auth.logout")}
            </button>
          </div>
        </div>
      </header>

      <main style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
