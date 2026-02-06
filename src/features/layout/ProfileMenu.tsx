// src/components/ProfileMenu.tsx
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";

import { useTranslation } from "react-i18next";

import { ColorModeMenuItem } from "../../components/ColorModeMenuItem";
import { LanguageSwitcherMenuItem } from "../../components/LanguageSwitcherMenuItem";

type Props = {
  anchorEl: HTMLElement | null;
  menuOpen: boolean;
  onClose: () => void;
  onLogout: (event: React.MouseEvent<HTMLElement>) => void;
  onProfileNav: (event: React.MouseEvent<HTMLElement>) => void;
};

export function ProfileMenu({
  anchorEl,
  menuOpen,
  onClose,
  onLogout,
  onProfileNav,
}: Props) {
  const { t } = useTranslation(["common"]);

  return (
    <Menu
      anchorEl={anchorEl}
      open={menuOpen}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={onProfileNav}>
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary={t("common:nav.profile")} />
      </MenuItem>

      <Divider />

      <LanguageSwitcherMenuItem />

      <ColorModeMenuItem />

      <MenuItem onClick={onLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        {t("common:auth.logout")}
      </MenuItem>
    </Menu>
  );
}
