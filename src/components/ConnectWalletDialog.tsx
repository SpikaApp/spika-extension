import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Tooltip,
} from "@mui/material";
import { useContext } from "react";
import { UIContext } from "../context/UIContext";

import keystone_dark from "../assets/keystone_dark.svg";
import keystone_light from "../assets/keystone_light.svg";

const ConnectWalletDialog = (): JSX.Element => {
  const { handleKeystoneQRScannerUI, openConnectWalletDialog, setOpenConnectWalletDialog, darkMode } =
    useContext(UIContext);

  const handleCancel = (): void => {
    setOpenConnectWalletDialog(false);
  };

  return (
    <Dialog open={openConnectWalletDialog}>
      <DialogTitle align="center">Connect Hardware Wallet</DialogTitle>
      <DialogContent sx={{ minHeight: "145px" }}>
        <Paper sx={{ width: "260px", bgcolor: "background.paper" }}>
          <List component="nav" sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "255px" }}>
            <ListItemButton onClick={handleKeystoneQRScannerUI}>
              <Tooltip title="Connect wallet">
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={darkMode ? keystone_dark : keystone_light} />
                  </ListItemAvatar>
                  <ListItemText primary="Keystone" primaryTypographyProps={{ fontSize: "18px" }}></ListItemText>
                </ListItem>
              </Tooltip>
            </ListItemButton>
          </List>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConnectWalletDialog;
