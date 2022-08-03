import { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { styled, alpha } from "@mui/material/styles";
import Link from "@mui/material/Link";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import LogoutDialog from "../components/LogoutDialog";
import { PLATFORM } from "../utils/constants";
import { setStore } from "../utils/store";

const StyledMenu = styled((props) => (
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

const Navbar = () => {
  const { accountImported, handleLock } = useContext(AccountContext);
  const { darkMode, setDarkMode, handleLogoutUI } = useContext(UIContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSwitch = () => {
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
      <AppBar position="relative">
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div className="menu">
            <Button
              id="menu-button"
              aria-controls={open ? "menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              variant="contained"
              disableElevation
              onClick={handleClick}
              endIcon={<KeyboardArrowDownIcon />}
            >
              Menu
            </Button>
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
                      Create Account
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleClose} disableRipple>
                    <Link underline="none" component={RouterLink} to="import">
                      Import Account
                    </Link>
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                </Stack>
              )}
              {accountImported && (
                <Stack>
                  <MenuItem onClick={handleClose} disableRipple>
                    <Link underline="none" component={RouterLink} to="/">
                      Wallet
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleClose} disableRipple>
                    <Link underline="none" component={RouterLink} to="nfts">
                      NFTs
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleClose} disableRipple>
                    <Link underline="none" component={RouterLink} to="transactions">
                      Transactions
                    </Link>
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                </Stack>
              )}
              <MenuItem onClick={handleClose} disableRipple>
                <Link underline="none" component={RouterLink} to="about">
                  About
                </Link>
              </MenuItem>
            </StyledMenu>
          </div>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Toggle theme">
              <IconButton aria-label="theme" size="normal" onClick={handleThemeSwitch}>
                {darkMode ? <DarkModeIcon /> : <LightModeIcon sx={{ color: "white" }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Lock wallet">
              <IconButton
                aria-label="theme"
                size="normal"
                sx={{ color: "white" }}
                onClick={handleLock}
              >
                {accountImported ? <LockOpenIcon /> : <LockIcon />}
              </IconButton>
            </Tooltip>
            {accountImported && (
              <Button color="inherit" onClick={handleLogoutUI}>
                Logout
              </Button>
            )}
          </Stack>
        </Toolbar>
        <LogoutDialog />
      </AppBar>
    </Box>
  );
};

export default Navbar;
