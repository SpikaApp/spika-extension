import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Divider, IconButton, Menu, MenuItem, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import Link from "@mui/material/Link";
import { alpha, styled } from "@mui/material/styles";
import { useContext, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import spika from "../assets/spika.svg";
import LogoutDialog from "./LogoutDialog";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { setStore } from "../lib/store";
import { PLATFORM } from "../utils/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StyledMenu = styled<any>((props: any): any => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: theme.palette.mode === "light" ? "rgb(55, 65, 81)" : theme.palette.grey[300],
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },
}));

const Navbar = (): JSX.Element => {
  const { spikaWallet, darkMode, setDarkMode, handleLogoutUI, devMode } = useContext(UIContext);
  const { accountImported, handleLock } = useContext(AccountContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (): void => {
    setAnchorEl(null);
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
              <IconButton onClick={handleClick}>
                {!open ? (
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
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              {!accountImported && (
                <Stack>
                  <MenuItem onClick={handleClose} disableRipple>
                    <Link underline="none" component={RouterLink} to="create">
                      <Typography variant="h6" color="textPrimary">
                        Create Account
                      </Typography>
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleClose} disableRipple>
                    <Link underline="none" component={RouterLink} to="import">
                      <Typography variant="h6" color="textPrimary">
                        Import Account
                      </Typography>
                    </Link>
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                </Stack>
              )}
              {accountImported && (
                <Stack>
                  <MenuItem onClick={handleClose} disableRipple>
                    <Link underline="none" component={RouterLink} to="/">
                      <Typography variant="h6" color="textPrimary">
                        Wallet
                      </Typography>
                    </Link>
                  </MenuItem>
                  {devMode && (
                    <MenuItem onClick={handleClose} disableRipple>
                      <Link underline="none" component={RouterLink} to="/swap">
                        <Typography variant="h6" color="textPrimary">
                          Swap
                        </Typography>
                      </Link>
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleClose} disableRipple>
                    <Link underline="none" component={RouterLink} to="nfts">
                      <Typography variant="h6" color="textPrimary">
                        NFTs
                      </Typography>
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleClose} disableRipple>
                    <Link underline="none" component={RouterLink} to="transactions">
                      <Typography variant="h6" color="textPrimary">
                        Transactions
                      </Typography>
                    </Link>
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                </Stack>
              )}
              {accountImported && (
                <MenuItem onClick={handleClose} disableRipple>
                  <Link underline="none" component={RouterLink} to="settings">
                    <Typography variant="h6" color="textPrimary">
                      Settings
                    </Typography>
                  </Link>
                </MenuItem>
              )}
              <MenuItem onClick={handleClose} disableRipple>
                <Link underline="none" component={RouterLink} to="about">
                  <Typography variant="h6" color="textPrimary">
                    About
                  </Typography>
                </Link>
              </MenuItem>
            </StyledMenu>
          </div>
          <Stack direction="row" spacing={1}>
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
            {accountImported && (
              <Tooltip title="Logout">
                <IconButton aria-label="logout" sx={{ color: "white" }} onClick={handleLogoutUI}>
                  <LogoutIcon sx={{ fontSize: "32px" }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Toolbar>
        <LogoutDialog />
      </AppBar>
    </Box>
  );
};

export default Navbar;
