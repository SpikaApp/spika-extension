/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/jsx-no-comment-textnodes */
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { ICoin } from "../interface";
import { setStore } from "../lib/store";
import { PLATFORM } from "../utils/constants";
import debug from "../utils/debug";

type AccountAssetsDialogProps = {
  type?: "base" | "quote";
};

const AccountAssetsDialog = (props: AccountAssetsDialogProps): JSX.Element => {
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
      (openAccountAssetsDialog && props && props.type === "base") ||
      (openAccountAssetsDialog && props && props.type === "quote")
    ) {
      setShowOnlySwapSupported(true);
    }
  }, [openAccountAssetsDialog]);

  useEffect(() => {
    if (accountAssets.length > 0) {
      debug.log("account assets", accountAssets);
      const swapSupported: ICoin[] = [];
      Object.values(accountAssets).map((value) => {
        if (value.data.swap) {
          swapSupported.push(value);
        }
      });
      setSwapSupportedAssets(swapSupported);
      debug.log("swap supported assets updated");
      setIsFetching(false);
    }
  }, [accountAssets.length > 0]);

  const updateAssets = async (): Promise<void> => {
    setIsLocalLoading(true);
    await updateAccountAssets();
    setIsLocalLoading(false);
  };

  const handleSwitchAsset = (asset: ICoin): void => {
    if (props && props.type === "base") {
      setBaseCoin(asset);
      handleUpdateBalance(asset);
      setOpenAccountAssetsDialog(false);
    } else if (props && props.type === "quote") {
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

  const handleUpdateBalance = async (asset: ICoin): Promise<void> => {
    setIsLoading(true);
    await updateBalance(asset);
    setIsLoading(false);
  };

  const handleCancel = (): void => {
    setShowOnlySwapSupported(false);
    setOpenAccountAssetsDialog(false);
  };

  return (
    <Dialog open={openAccountAssetsDialog}>
      <DialogTitle align="center">Select Asset</DialogTitle>
      <DialogContent sx={{ minHeight: "145px" }}>
        <Paper sx={{ width: "260px", bgcolor: "background.paper" }}>
          <List component="nav" sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "255px" }}>
            {isLocalLoading ? (
              <CircularProgress sx={{ display: "flex", ml: "110px", color: "#9e9e9e" }} size={32} />
            ) : (
              <div>
                {!showOnlySwapSupported && props!.type !== "base" && props!.type !== "quote" && (
                  <div>
                    {accountAssets.map((asset: ICoin) => (
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
