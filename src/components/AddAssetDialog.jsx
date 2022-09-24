import { useContext, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Stack,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Loading from "../components/Loading";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { PayloadContext } from "../context/PayloadContext";
import { Web3Context } from "../context/Web3Context";
import { coinList } from "../lib/coin";
import { setStore } from "../lib/store";
import { PLATFORM } from "../utils/constants";

const AddAssetDialog = () => {
  const { openAddAssetDialog, setOpenAddAssetDialog, darkMode } = useContext(UIContext);
  const {
    setIsLoading,
    alertSignal,
    currentNetwork,
    accountAssets,
    currentAsset,
    setCurrentAsset,
    throwAlert,
  } = useContext(AccountContext);
  const { register } = useContext(PayloadContext);
  const {
    getBalance,
    findAsset,
    isValidAsset,
    setIsValidAsset,
    selectedAsset,
    setSelectedAsset,
    estimateTransaction,
    isValidTransaction,
    estimatedTxnResult,
    registerAsset,
    updateAccountAssets,
    clearPrevEstimation,
  } = useContext(Web3Context);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [isCustomToken, setIsCustomToken] = useState(false);
  const [estimationRequired, setEstimationRequired] = useState(false);
  const [coinType, setCoinType] = useState("");
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const _currentAsset = "currentAsset";
  const assetList = coinList.filter((i) => !accountAssets.includes(i));
  assetList.sort((a, b) => a.data.name.localeCompare(b.data.name));

  const handleListItemClick = (event, index, asset) => {
    clearPrevEstimation();
    setSelectedIndex(index);
    setSelectedAsset(asset);
    setCoinType(asset.type);
    setEstimationRequired(true);
  };

  useEffect(() => {
    if (estimationRequired) {
      handleEstimateTransaction(coinType);
      setEstimationRequired(false);
    }
  }, [estimationRequired]);

  useEffect(() => {
    handleGetBalance();
  }, [currentAsset]);

  useEffect(() => {
    if (openAddAssetDialog) {
      if (alertSignal === 101) {
        clearPrevEstimation();
        clearDialog();
      }
    }
  }, [alertSignal]);

  useEffect(() => {
    if (openAddAssetDialog) {
      updateAccountAssets();
    }
  }, [openAddAssetDialog]);

  useEffect(() => {
    if (currentNetwork) {
      clearDialog();
    }
  }, [currentNetwork]);

  const handleGetBalance = async () => {
    setIsLoading(true);
    await getBalance();
    setIsLoading(false);
  };

  const handleEstimateTransaction = async (coinType) => {
    const payload = await register(coinType);
    await estimateTransaction(payload, true, true);
  };

  const handleFindAsset = async () => {
    setIsLoading(true);
    const data = await findAsset(coinType);
    if (!data) {
      throwAlert(112, "Error", "Asset doesn't exist on chain", true);
      if (!isCustomToken) {
        clearPrevEstimation();
        clearDialog();
      }
    } else {
      handleRegisterAsset();
    }
    setIsLoading(false);
  };

  const handleRegisterAsset = async () => {
    setIsLocalLoading(true);
    if (selectedIndex !== "" || isCustomToken) {
      const assetData = await findAsset(coinType);
      if (assetData) {
        setEstimationRequired(true);
        await registerAssetInAccount(coinType);
        clearPrevEstimation();
        clearDialog();
      } else {
        throwAlert(112, "Error", "Asset doesn't exist on chain", true);
        clearPrevEstimation();
        clearDialog();
      }
    }
    setIsLocalLoading(false);
  };

  const handleAddCustomToken = async () => {
    clearPrevEstimation();
    clearDialog();
    setIsCustomToken(true);
  };

  const registerAssetInAccount = async (coinType) => {
    await registerAsset(coinType, selectedAsset.data.name);
    setCurrentAsset(selectedAsset);
    setStore(PLATFORM, _currentAsset, selectedAsset);
  };

  const clearDialog = () => {
    setIsValidAsset(false);
    setSelectedIndex("");
    setSelectedAsset({});
    setIsCustomToken(false);
    setCoinType("");
    updateAccountAssets();
  };

  const handleCancel = () => {
    setOpenAddAssetDialog(false);
    clearPrevEstimation();
    clearDialog();
  };

  return (
    <Dialog open={openAddAssetDialog}>
      {isCustomToken ? (
        <DialogTitle align="center">Register Custom Asset</DialogTitle>
      ) : (
        <DialogTitle align="center">Register Asset</DialogTitle>
      )}
      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
        {isCustomToken ? (
          <form>
            <input hidden type="text" autoComplete="username" value={undefined}></input>
            <Stack
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!isValidAsset ? (
                <TextField
                  sx={{ mt: 1, mr: 2, ml: 2, width: 260 }}
                  InputLabelProps={{ shrink: true }}
                  multiline
                  rows={4}
                  label="Asset type"
                  placeholder="0x1::aptos_coin::AptosCoin"
                  autoFocus={false}
                  value={coinType}
                  onChange={(e) => setCoinType(e.target.value)}
                />
              ) : (
                <Stack>
                  <TextField
                    sx={{ mt: 1, mr: 2, ml: 2, width: 260 }}
                    InputLabelProps={{ shrink: true }}
                    multiline
                    rows={4}
                    label="Asset type"
                    autoFocus={false}
                    value={selectedAsset.type}
                    disabled
                  />
                  <TextField
                    sx={{ mt: 2, mr: 2, ml: 2, width: 260 }}
                    InputLabelProps={{ shrink: true }}
                    label="Name"
                    autoFocus={false}
                    value={selectedAsset.data.name}
                    disabled
                  />
                  <TextField
                    sx={{ mt: 2, mr: 2, ml: 2, width: 130 }}
                    InputLabelProps={{ shrink: true }}
                    label="Symbol"
                    autoFocus={false}
                    value={selectedAsset.data.symbol}
                    disabled
                  />
                </Stack>
              )}
            </Stack>
          </form>
        ) : (
          <div>
            {currentNetwork.name === "Devnet" && (
              <Paper
                sx={{
                  width: "260px",
                  bgcolor: "background.paper",
                }}
              >
                <List
                  component="nav"
                  sx={{
                    overflow: "hidden",
                    overflowY: "visible",
                    maxHeight: "200px",
                    minHeight: "50px",
                  }}
                >
                  {assetList.map((asset) => (
                    <Stack key={asset.type}>
                      <ListItemButton
                        selected={selectedIndex === asset.data.name}
                        onClick={(event) => handleListItemClick(event, asset.data.name, asset)}
                      >
                        <ListItemIcon>
                          <Box
                            component="img"
                            src={darkMode ? asset.data.logo_alt : asset.data.logo}
                            sx={{ width: 24, height: 24, ml: "4px" }}
                          ></Box>
                        </ListItemIcon>
                        <ListItemText
                          sx={{ ml: "-16px" }}
                          primary={`${asset.data.name} (${asset.data.symbol})`}
                        />
                      </ListItemButton>
                    </Stack>
                  ))}
                </List>
              </Paper>
            )}
          </div>
        )}
        {!isCustomToken && (
          <Stack
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 1,
            }}
          >
            <Button
              variant="outlined"
              sx={{ mt: 1, mb: 1, width: "180px" }}
              onClick={handleAddCustomToken}
            >
              Add Custom Token
            </Button>
          </Stack>
        )}
        <Stack sx={{ minHeight: "54px" }}>
          {(selectedIndex !== "" || isCustomToken) && (
            <Box
              sx={{
                // backgroundColor: "background.paper",
                minHeight: "24px",
                alignSelf: "center",
                mt: isCustomToken ? "12px" : "4px",
                maxWidth: "260px",
                // bgcolor: "background.paper",
              }}
            >
              {isValidTransaction && (
                <Typography
                  noWrap
                  align="center"
                  variant="subtitle2"
                  color="warning.dark"
                  sx={{
                    maxWidth: "260px",
                    mt: "2px",
                    ml: "12px",
                    mr: "12px",
                  }}
                >
                  Estimated network fee: {estimatedTxnResult.gas_used}
                </Typography>
              )}
              {estimatedTxnResult && !isValidTransaction && (
                <Stack>
                  {estimatedTxnResult && (
                    <Typography
                      variant="subtitle2"
                      color="error.dark"
                      sx={{
                        maxWidth: "260px",
                        overflow: "hidden",
                        overflowY: "scroll",
                        textOverflow: "ellipsis",
                        wordWrap: "break-word",
                        maxHeight: "48px",
                        mt: "2px",
                        ml: "12px",
                        mr: "12px",
                      }}
                    >
                      {estimatedTxnResult.vm_status}
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack>
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", mb: 2 }}>
            <Button sx={{ width: "115px" }} variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            {isCustomToken && !isValidAsset && !isValidTransaction && (
              <LoadingButton
                sx={{
                  background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                loading={isLocalLoading}
                loadingIndicator={<CircularProgress sx={{ color: "white" }} size={18} />}
                onClick={handleFindAsset}
              >
                Find
              </LoadingButton>
            )}
            {isCustomToken && isValidAsset && !isValidTransaction && (
              <Button
                sx={{
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                disabled
              >
                Register
              </Button>
            )}
            {isCustomToken && isValidAsset && isValidTransaction && (
              <LoadingButton
                sx={{
                  background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                loading={isLocalLoading}
                loadingIndicator={<CircularProgress sx={{ color: "white" }} size={18} />}
                onClick={handleRegisterAsset}
              >
                Register
              </LoadingButton>
            )}
            {!isCustomToken && isValidTransaction && (
              <LoadingButton
                sx={{
                  background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                loading={isLocalLoading}
                loadingIndicator={<CircularProgress sx={{ color: "white" }} size={18} />}
                onClick={handleRegisterAsset}
              >
                Register
              </LoadingButton>
            )}
            {!isCustomToken && !isValidTransaction && (
              <Button
                sx={{
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                disabled
              >
                Register
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogActions>
      <Loading />
    </Dialog>
  );
};

export default AddAssetDialog;
