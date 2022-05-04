import { useState, useContext } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AppBar, Box, Toolbar, Button, Menu, MenuItem, Divider, IconButton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HomeIcon from "@mui/icons-material/Home";
import { styled, alpha } from "@mui/material/styles";
import Link from "@mui/material/Link";
import { AccountContext } from "./context/AccountContext";
import { UIContext } from "./context/UIContext";
import LogoutDialog from "./components/LogoutDialog";

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
  const { accountImported } = useContext(AccountContext);
  const { handleLogoutUI } = useContext(UIContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="relative">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <div className="menu-btn">
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
              Spika Project
            </Button>
            <StyledMenu
              id="demo-customized-menu"
              MenuListProps={{
                "aria-labelledby": "demo-customized-button",
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
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
              <MenuItem onClick={handleClose} disableRipple>
                <Link underline="none" component={RouterLink} to="about">
                  About
                </Link>
              </MenuItem>
            </StyledMenu>
            <IconButton aria-label="home" size="normal" onClick={handleHome}>
              <HomeIcon sx={{ color: "white" }} />
            </IconButton>
          </div>
          {accountImported && (
            <Button color="inherit" onClick={handleLogoutUI}>
              Logout
            </Button>
          )}
        </Toolbar>
        <LogoutDialog />
      </AppBar>
    </Box>
  );
};

export default Navbar;
