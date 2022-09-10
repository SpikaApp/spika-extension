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
} from "@mui/material";
import Loading from "../components/Loading";
import pixel_coin from "../assets/pixel_coin.png";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import { coinList } from "../lib/coin";
import { setStore } from "../lib/store";
import { setAsset } from "../lib/asset_store";
import { PLATFORM } from "../utils/constants";
import { register } from "../lib/payload";

const AddAssetDialog = () => {
  const { openAddAssetDialog, setOpenAddAssetDialog, darkMode } = useContext(UIContext);
  const { setIsLoading, currentAddress, currentAsset, setCurrentAsset, throwAlert } =
    useContext(AccountContext);
  const {
    getBalance,
    findAsset,
    isValidAsset,
    setIsValidAsset,
    selectedAsset,
    setSelectedAsset,
    estimateTransaction,
    isValidTransaction,
    setIsValidTransaction,
    estimatedTxnResult,
    setEstimatedTxnResult,
    registerAsset,
  } = useContext(Web3Context);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [isCustomToken, setIsCustomToken] = useState(false);
  const [estimationRequired, setEstimationRequired] = useState(false);
  const [coinType, setCoinType] = useState("");

  const _currentAsset = "currentAsset";

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
      throwAlert(112, "Error", "Asset not found on chain.");
      clearPrevEstimation();
      clearDialog();
    } else {
      handleRegisterAsset();
    }
    setIsLoading(false);
  };

  const handleRegisterAsset = async () => {
    if (selectedIndex !== "" || isCustomToken) {
      const assetData = await findAsset(coinType);
      if (assetData) {
        setEstimationRequired(true);
        await registerAssetInAccount(coinType);
        clearPrevEstimation();
        clearDialog();
      } else {
        throwAlert(112, "Error", "Asset not found on chain.");
        clearPrevEstimation();
        clearDialog();
      }
    }
  };

  const handleAddCustomToken = async () => {
    clearPrevEstimation();
    clearDialog();
    setIsCustomToken(true);
  };

  const registerAssetInAccount = async (coinType) => {
    await registerAsset(coinType, selectedAsset.data.name);
    setAsset(currentAddress, selectedAsset);
    setCurrentAsset(selectedAsset);
    setStore(PLATFORM, _currentAsset, selectedAsset);
  };

  const clearPrevEstimation = () => {
    setIsValidTransaction(false);
    setEstimatedTxnResult(false);
  };

  const clearDialog = () => {
    setIsValidAsset(false);
    setSelectedIndex("");
    setSelectedAsset([]);
    setIsCustomToken(false);
    setCoinType("");
  };

  const handleCancel = () => {
    setOpenAddAssetDialog(false);
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
          <Paper
            sx={{
              width: "260px",
              bgcolor: "background.paper",
            }}
          >
            <List
              component="nav"
              sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "200px" }}
            >
              {coinList.map((asset) => (
                <Stack key={asset.type}>
                  <ListItemButton
                    selected={selectedIndex === asset.data.name}
                    onClick={(event) => handleListItemClick(event, asset.data.name, asset)}
                  >
                    <ListItemIcon>
                      <Box
                        component="img"
                        src={darkMode ? asset.data.logo_alt : asset.data.logo}
                        sx={{ width: 24, height: 24 }}
                      ></Box>
                    </ListItemIcon>
                    <ListItemText primary={`${asset.data.name} (${asset.data.symbol})`} />
                  </ListItemButton>
                </Stack>
              ))}
            </List>
          </Paper>
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
        <Box
          sx={{
            // backgroundColor: "#F19223",
            minHeight: "24px",
            alignSelf: "center",
            mt: "4px",
          }}
        >
          {isValidTransaction && (
            <Typography
              variant="subtitle2"
              color="warning.dark"
              sx={{
                maxWidth: "260px",
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
                    textOverflow: "ellipsis",
                    wordWrap: "break-word",
                  }}
                >
                  {estimatedTxnResult.vm_status}
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack>
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", mb: 2 }}>
            <Button sx={{ width: "115px" }} variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            {isCustomToken && !isValidAsset && !isValidTransaction && (
              <Button
                sx={{
                  background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                onClick={handleFindAsset}
              >
                Find
              </Button>
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
              <Button
                sx={{
                  background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                onClick={handleRegisterAsset}
              >
                Register
              </Button>
            )}
            {!isCustomToken && isValidTransaction && (
              <Button
                sx={{
                  background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                onClick={handleRegisterAsset}
              >
                Register
              </Button>
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
