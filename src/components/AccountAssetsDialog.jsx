import { useContext, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Stack,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import { setStore } from "../lib/store";
import { PLATFORM } from "../utils/constants";

const AccountAssetsDialog = () => {
  const { openAccountAssetsDialog, setOpenAccountAssetsDialog, darkMode } = useContext(UIContext);
  const { setIsLoading, setCurrentAsset, accountAssets } = useContext(AccountContext);
  const { updateAccountAssets, updateBalance } = useContext(Web3Context);

  const _currentAsset = "currentAsset";

  useEffect(() => {
    if (openAccountAssetsDialog) {
      updateAccountAssets();
    }
  }, [openAccountAssetsDialog]);

  const handleSwitchAsset = (asset) => {
    setStore(PLATFORM, _currentAsset, asset);
    setCurrentAsset(asset);
    handleUpdateBalance(asset);
    setOpenAccountAssetsDialog(false);
  };

  const handleUpdateBalance = async (asset) => {
    setIsLoading(true);
    await updateBalance(asset);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setOpenAccountAssetsDialog(false);
  };

  return (
    <Dialog open={openAccountAssetsDialog}>
      <DialogTitle align="center">Select Asset</DialogTitle>
      <DialogContent sx={{ minHeight: "145px" }}>
        <Paper sx={{ width: "260px", bgcolor: "background.paper" }}>
          <List
            component="nav"
            sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "255px" }}
          >
            {accountAssets.map((asset) => (
              <Stack key={asset.type}>
                <ListItemButton
                  onClick={() => {
                    handleSwitchAsset(asset);
                  }}
                >
                  <ListItemIcon sx={{ ml: 8 }}>
                    <Box
                      component="img"
                      src={darkMode ? asset.data.logo_alt : asset.data.logo}
                      sx={{ width: 32, height: 32 }}
                    ></Box>
                  </ListItemIcon>
                  <ListItemText primary={`${asset.data.symbol}`} />
                </ListItemButton>
              </Stack>
            ))}
          </List>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountAssetsDialog;
