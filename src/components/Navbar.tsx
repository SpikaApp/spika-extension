import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { AppBar, Box, Divider, IconButton, MenuItem, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import Link from "@mui/material/Link";
import { useContext, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import spika from "../assets/spika.svg";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { setStore } from "../core/store";
import { PLATFORM } from "../utils/constants";
import LogoutDialog from "./LogoutDialog";

import { StyledBadge, StyledMenu } from "./lib";

const menuTextFontWeight = "450";
const menuTextFontSize = "17px";

const Navbar = (): JSX.Element => {
  const { spikaWallet, darkMode, setDarkMode, devMode, handleLogoutUI } = useContext(UIContext);
  const { accountImported, handleLock } = useContext(AccountContext);
  const [anchorElMain, setAnchorElMain] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);

  const openMain = Boolean(anchorElMain);
  const openNotifications = Boolean(anchorElNotifications);

  const handleClickMain = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorElMain(event.currentTarget);
  };

  const handleClickNotifications = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseMain = (): void => {
    setAnchorElMain(null);
  };

  const handleCloseNotifications = (): void => {
    setAnchorElNotifications(null);
  };

  const handleThemeSwitch = (): void => {
    if (darkMode) {
      setDarkMode(false);
      setStore(PLATFORM, "DARK_MODE", false);
    } else {
      setDarkMode(true);
      setStore(PLATFORM, "DARK_MODE", true);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar color="primary" position="fixed">
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            height: "75px",
          }}
        >
          <div className="menu">
            <Stack direction="row">
              <IconButton onClick={handleClickMain}>
                {!openMain ? (
                  <MenuIcon sx={{ color: "white", fontSize: "32px" }} />
                ) : (
                  <CloseIcon sx={{ color: "white", fontSize: "32px" }} />
                )}
              </IconButton>
              <Box component="img" src={spika} sx={{ width: "69px", height: "26px", mt: 1.25, ml: "2px" }} />
            </Stack>
            <StyledMenu
              id="main-menu"
              MenuListProps={{
                "aria-labelledby": "main-menu-btn",
              }}
              anchorEl={anchorElMain}
              open={openMain}
              onClose={handleCloseMain}
            >
              {!accountImported && (
                <Stack>
                  <MenuItem onClick={handleCloseMain} disableRipple>
                    <Link underline="none" component={RouterLink} to="create">
                      <Typography
                        color="textPrimary"
                        sx={{ fontWeight: menuTextFontWeight, fontSize: menuTextFontSize }}
                      >
                        Create Account
                      </Typography>
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleCloseMain} disableRipple>
                    <Link underline="none" component={RouterLink} to="import">
                      <Typography
                        color="textPrimary"
                        sx={{ fontWeight: menuTextFontWeight, fontSize: menuTextFontSize }}
                      >
                        Import Account
                      </Typography>
                    </Link>
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                </Stack>
              )}
              {accountImported && (
                <Stack>
                  <MenuItem onClick={handleCloseMain} disableRipple>
                    <Link underline="none" component={RouterLink} to="/">
                      <Typography
                        color="textPrimary"
                        sx={{ fontWeight: menuTextFontWeight, fontSize: menuTextFontSize }}
                      >
                        Wallet
                      </Typography>
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleCloseMain} disableRipple>
                    <Link underline="none" component={RouterLink} to="/swap">
                      <Typography
                        color="textPrimary"
                        sx={{ fontWeight: menuTextFontWeight, fontSize: menuTextFontSize }}
                      >
                        Swap
                      </Typography>
                    </Link>
                  </MenuItem>
                  {devMode && (
                    <MenuItem onClick={handleCloseMain} disableRipple>
                      <Link underline="none" component={RouterLink} to="/tests">
                        <Typography
                          color="textPrimary"
                          sx={{ fontWeight: menuTextFontWeight, fontSize: menuTextFontSize }}
                        >
                          Tests
                        </Typography>
                      </Link>
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleCloseMain} disableRipple>
                    <Link underline="none" component={RouterLink} to="nfts">
                      <Typography
                        color="textPrimary"
                        sx={{ fontWeight: menuTextFontWeight, fontSize: menuTextFontSize }}
                      >
                        NFTs
                      </Typography>
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleCloseMain} disableRipple>
                    <Link underline="none" component={RouterLink} to="transactions">
                      <Typography
                        color="textPrimary"
                        sx={{ fontWeight: menuTextFontWeight, fontSize: menuTextFontSize }}
                      >
                        Transactions
                      </Typography>
                    </Link>
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                </Stack>
              )}
              {accountImported && (
                <MenuItem onClick={handleCloseMain} disableRipple>
                  <Link underline="none" component={RouterLink} to="contacts">
                    <Typography color="textPrimary" sx={{ fontWeight: menuTextFontWeight, fontSize: menuTextFontSize }}>
                      Contacts
                    </Typography>
                  </Link>
                </MenuItem>
              )}
              {accountImported && (
                <MenuItem onClick={handleCloseMain} disableRipple>
                  <Link underline="none" component={RouterLink} to="settings">
                    <Typography color="textPrimary" sx={{ fontWeight: menuTextFontWeight, fontSize: menuTextFontSize }}>
                      Settings
                    </Typography>
                  </Link>
                </MenuItem>
              )}
              <MenuItem onClick={handleCloseMain} disableRipple>
                <Link underline="none" component={RouterLink} to="about">
                  <Typography color="textPrimary" sx={{ fontWeight: menuTextFontWeight, fontSize: menuTextFontSize }}>
                    About
                  </Typography>
                </Link>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleLogoutUI();
                  handleCloseMain();
                }}
                disableRipple
              >
                <Typography color="textPrimary" sx={{ fontWeight: menuTextFontWeight, fontSize: menuTextFontSize }}>
                  Logout
                </Typography>
              </MenuItem>
            </StyledMenu>
          </div>
          <Stack direction="row" spacing={1}>
            {devMode && (
              <Stack>
                <IconButton aria-label="theme" size="medium" onClick={handleClickNotifications}>
                  <StyledBadge badgeContent={0} color="error">
                    <Tooltip title="Notifications">
                      {darkMode ? (
                        <NotificationsIcon sx={{ fontSize: "32px" }} />
                      ) : (
                        <NotificationsIcon sx={{ color: "white", fontSize: "32px" }} />
                      )}
                    </Tooltip>
                  </StyledBadge>
                </IconButton>
                <div className="notifications">
                  <StyledMenu
                    id="notifications"
                    MenuListProps={{
                      "aria-labelledby": "notifications-btn",
                    }}
                    anchorEl={anchorElNotifications}
                    open={openNotifications}
                    onClose={handleCloseNotifications}
                  >
                    <Stack sx={{ height: "100px", width: "220px" }}>
                      <Typography
                        color="textPrimary"
                        align="center"
                        sx={{
                          display: "flex",
                          pt: "30px",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: "400px",
                        }}
                      >
                        All news read
                      </Typography>
                    </Stack>
                  </StyledMenu>
                </div>
              </Stack>
            )}
            <Tooltip title="Toggle theme">
              <IconButton aria-label="theme" size="medium" onClick={handleThemeSwitch}>
                {darkMode ? (
                  <DarkModeIcon sx={{ fontSize: "32px" }} />
                ) : (
                  <LightModeIcon sx={{ color: "white", fontSize: "32px" }} />
                )}
              </IconButton>
            </Tooltip>
            {spikaWallet && (
              <Tooltip title="Lock wallet">
                <IconButton aria-label="theme" sx={{ color: "white" }} onClick={handleLock}>
                  {accountImported ? (
                    <LockOpenIcon sx={{ fontSize: "32px" }} />
                  ) : (
                    <LockIcon sx={{ fontSize: "32px" }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      <LogoutDialog />
    </Box>
  );
};

export default Navbar;
