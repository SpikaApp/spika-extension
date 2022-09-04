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
import { getAccountAssets } from "../lib/asset_store";
import { PLATFORM } from "../utils/constants";

const AccountAssetsDialog = () => {
  const { openAccountAssetsDialog, setOpenAccountAssetsDialog, darkMode } = useContext(UIContext);
  const { setIsLoading, currentAddress, setCurrentAsset } = useContext(AccountContext);
  const { updateBalance } = useContext(Web3Context);
  const [assets, setAssets] = useState([]);

  const _currentAsset = "currentAsset";

  useEffect(() => {
    if (openAccountAssetsDialog === true) {
      accountAssets();
    }
  }, [openAccountAssetsDialog === true]);

  const accountAssets = async () => {
    const data = await getAccountAssets(currentAddress);
    if (data !== undefined || data !== null) {
      setAssets(data.assets);
    }
  };

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
          <List component="nav">
            {assets.map((asset) => (
              <Stack key={asset.id}>
                <ListItemButton
                  onClick={() => {
                    handleSwitchAsset(asset);
                  }}
                >
                  <ListItemIcon sx={{ ml: 8 }}>
                    <Box
                      component="img"
                      src={darkMode ? asset.data.logo_dark : asset.data.logo_light}
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
