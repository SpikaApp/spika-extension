import { useContext, useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import { setStore } from "../lib/store";
import { PLATFORM } from "../utils/constants";
import debug from "../utils/debug";

const AccountAssetsDialog = (props) => {
  const { openAccountAssetsDialog, setOpenAccountAssetsDialog, darkMode } = useContext(UIContext);
  const {
    setIsLoading,
    setIsFetching,
    setCurrentAsset,
    accountAssets,
    setBaseCoin,
    setQuoteCoin,
    swapSupportedAssets,
    setSwapSupportedAssets,
  } = useContext(AccountContext);
  const { updateAccountAssets, updateBalance } = useContext(Web3Context);
  const [showOnlySwapSupported, setShowOnlySwapSupported] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const _currentAsset = "currentAsset";

  useEffect(() => {
    if (openAccountAssetsDialog) {
      updateAssets();
    }
    if (
      (openAccountAssetsDialog && props.type === "base") ||
      (openAccountAssetsDialog && props.type === "quote")
    ) {
      setShowOnlySwapSupported(true);
    }
  }, [openAccountAssetsDialog]);

  useEffect(() => {
    if (accountAssets.length > 0) {
      debug.log("account assets", accountAssets);
      let swapSupported = [];
      Object.values(accountAssets).map((value) => {
        if (value.data.swap) {
          swapSupported.push(value);
        }
      });
      setSwapSupportedAssets(swapSupported);
      debug.log("swap assets updated");
      setIsFetching(false);
    }
  }, [accountAssets.length > 0]);

  const updateAssets = async () => {
    setIsLocalLoading(true);
    await updateAccountAssets();
    setIsLocalLoading(false);
  };

  const handleSwitchAsset = (asset) => {
    if (props.type === "base") {
      setBaseCoin(asset);
      handleUpdateBalance(asset);
      setOpenAccountAssetsDialog(false);
    } else if (props.type === "quote") {
      setQuoteCoin(asset);
      handleUpdateBalance(asset);
      setOpenAccountAssetsDialog(false);
    } else {
      setStore(PLATFORM, _currentAsset, asset);
      setCurrentAsset(asset);
      handleUpdateBalance(asset);
      setShowOnlySwapSupported(false);
      setOpenAccountAssetsDialog(false);
    }
  };

  const handleUpdateBalance = async (asset) => {
    setIsLoading(true);
    await updateBalance(asset);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setShowOnlySwapSupported(false);
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
            {isLocalLoading ? (
              <CircularProgress sx={{ display: "flex", ml: "110px", color: "#9e9e9e" }} size={32} />
            ) : (
              <div>
                {!showOnlySwapSupported && props.type !== "base" && props.type !== "quote" && (
                  <div>
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
                  </div>
                )}{" "}
                {showOnlySwapSupported && (
                  <div>
                    {swapSupportedAssets.map((asset) => (
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
                  </div>
                )}
              </div>
            )}
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
