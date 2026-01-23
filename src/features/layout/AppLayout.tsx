// src/features/layout/AppLayout.tsx
import * as React from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SensorsIcon from "@mui/icons-material/Sensors";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HubIcon from "@mui/icons-material/Hub";
import RecommendIcon from "@mui/icons-material/Recommend";
import LanguageIcon from "@mui/icons-material/Language";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectIsAuthenticated,
  selectIsLoading,
  selectProfile,
} from "../session/sessionSlice";
import { startLogin, startLogout } from "../session/sessionThunks";
import { selectHasPermission } from "../session/sessionSelectors";

import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { ColorModeContext } from "../../components/ColorModeProvider";

const drawerWidthExpanded = 260;
const drawerWidthCollapsed = 72;

// localStorage keys
const LS_NAV_COLLAPSED = "uiNavCollapsed";

type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
  show?: boolean;
};

function safeReadBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === "true";
  } catch {
    return fallback;
  }
}

export function AppLayout() {
  const { t } = useTranslation(["common"]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { mode, toggleColorMode } = React.useContext(ColorModeContext);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const profile = useAppSelector(selectProfile);

  const canSeeModels = useAppSelector(
    (s) =>
      selectHasPermission("model:list")(s) ||
      selectHasPermission("model:search")(s),
  );

  const canSeeRecommendations = useAppSelector((s) =>
    selectHasPermission("recommendation:list")(s),
  );

  const displayName =
    profile?.preferred_username ?? profile?.name ?? profile?.email ?? "User";

  // Mobile drawer open
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const toggleMobile = () => setMobileOpen((v) => !v);

  // Desktop collapse toggle (persisted)
  const [navCollapsed, setNavCollapsed] = React.useState<boolean>(() =>
    safeReadBool(LS_NAV_COLLAPSED, false),
  );
  const toggleNavCollapsed = () => setNavCollapsed((v) => !v);

  React.useEffect(() => {
    try {
      localStorage.setItem(LS_NAV_COLLAPSED, String(navCollapsed));
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }, [navCollapsed]);

  const drawerWidth = navCollapsed ? drawerWidthCollapsed : drawerWidthExpanded;

  // Avatar menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleLogin = () => {
    setAnchorEl(null);
    dispatch(startLogin())
      .unwrap()
      .catch((e) => console.error("Login failed:", e));
  };

  const handleLogout = () => {
    setAnchorEl(null);
    dispatch(startLogout())
      .unwrap()
      .catch((e) => console.error("Logout failed:", e));
  };

  const navItems: NavItem[] = [
    {
      label: t("common:nav.models"),
      to: "/models",
      icon: <HubIcon />,
      show: canSeeModels,
    },
    {
      label: t("common:nav.recommendations"),
      to: "/recommendations",
      icon: <RecommendIcon />,
      show: canSeeRecommendations,
    },
    {
      label: t("common:nav.knownDevices"),
      to: "/known-devices",
      icon: <SensorsIcon />,
    },
  ].filter((x) => x.show !== false);

  const drawer = (
    <Box sx={{ height: "100%" }}>
      {/* Spacer so drawer content starts below the fixed AppBar */}
      <Toolbar />
      <Divider />

      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              justifyContent: navCollapsed ? "center" : "flex-start",
              px: navCollapsed ? 1 : 2,
              "&.active": { bgcolor: "action.selected" },
            }}
          >
            <Tooltip
              title={navCollapsed ? item.label : ""}
              placement="right"
              arrow
            >
              <ListItemIcon sx={{ minWidth: navCollapsed ? "auto" : 40 }}>
                {item.icon}
              </ListItemIcon>
            </Tooltip>

            {!navCollapsed && <ListItemText primary={item.label} />}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", width: "100%", overflowX: "hidden" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1, // AppBar above drawer
        }}
      >
        <Toolbar
          sx={{
            // On desktop, shift app content right by drawer width
            pl: { md: `${drawerWidth}px` },
            transition: (theme) =>
              theme.transitions.create(["padding-left"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
          }}
        >
          {/* Mobile hamburger */}
          <Tooltip title="Open navigation" placement="bottom" arrow>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleMobile}
              sx={{ mr: 1, display: { md: "none" } }}
              aria-label="open navigation"
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          {/* Desktop collapse toggle */}
          <Tooltip
            title={navCollapsed ? "Expand navigation" : "Collapse navigation"}
            placement="bottom"
            arrow
          >
            <IconButton
              color="inherit"
              onClick={toggleNavCollapsed}
              sx={{ mr: 1, display: { xs: "none", md: "inline-flex" } }}
              aria-label={
                navCollapsed ? "Expand navigation" : "Collapse navigation"
              }
            >
              {navCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>

          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {t("common:appTitle")}
          </Typography>

          <Tooltip
            title={
              isLoading
                ? "Loading session…"
                : isAuthenticated
                  ? displayName
                  : "Sign in"
            }
            placement="bottom"
            arrow
          >
            <span>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ p: 0 }}
                disabled={isLoading}
                aria-label="Account menu"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {(displayName?.[0] ?? "U").toUpperCase()}
                </Avatar>
              </IconButton>
            </span>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {isAuthenticated ? (
              <>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    navigate("/profile");
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary={t("common:nav.profile")} />
                </MenuItem>

                <Divider />

                <MenuItem>
                  <ListItemIcon>
                    <LanguageIcon fontSize="small" />
                  </ListItemIcon>
                  <LanguageSwitcher />
                </MenuItem>

                <MenuItem onClick={toggleColorMode}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {mode === "dark" ? (
                      <LightModeIcon fontSize="small" />
                    ) : (
                      <DarkModeIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={t("common:labels.theme")} />

                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mr: 1 }}
                  >
                    {t(
                      mode === "dark"
                        ? "common:labels.dark"
                        : "common:labels.light",
                    )}
                  </Typography>
                </MenuItem>

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  {t("common:auth.logout")}
                </MenuItem>
              </>
            ) : (
              <MenuItem onClick={handleLogin}>
                <ListItemIcon>
                  <LoginIcon fontSize="small" />
                </ListItemIcon>
                Login
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidthExpanded },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop permanent drawer (collapsible) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            position: "relative", // prevents overlay/cropping
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0, // critical for DataGrid inside flex
          boxSizing: "border-box",
          p: 2.5,
        }}
      >
        {/* Spacer so main content starts below fixed AppBar */}
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
