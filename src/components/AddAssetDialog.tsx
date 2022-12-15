/* eslint-disable @typescript-eslint/no-non-null-assertion */
import LoadingButton from "@mui/lab/LoadingButton";
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
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { PayloadContext } from "../context/PayloadContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { ICoin } from "../interface";
import { coinList } from "../lib/coin";
import errorParser from "../lib/errorParser";
import { setStore } from "../lib/store";
import { PLATFORM } from "../utils/constants";
import { gasToValue } from "../utils/values";
import Loading from "./Loading";

const AddAssetDialog = (): JSX.Element => {
  const { openAddAssetDialog, setOpenAddAssetDialog, darkMode } = useContext(UIContext);
  const {
    setIsLoading,
    alertSignal,
    currentNetwork,
    accountAssets,
    currentAsset,
    setCurrentAsset,
    throwAlert,
    validateAccount,
    currentAddress,
    accountImported,
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
    mainnet,
  } = useContext(Web3Context);
  const [selectedIndex, setSelectedIndex] = useState<string>("");
  const [isCustomToken, setIsCustomToken] = useState<boolean>(false);
  const [estimationRequired, setEstimationRequired] = useState<boolean>(false);
  const [coinType, setCoinType] = useState<string>("");
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false);
  const _currentAsset = "currentAsset";
  const assetList = coinList.filter((i: ICoin) => !accountAssets.includes(i));
  const [isError, setIsError] = useState<boolean>(false);
  const [errMessage, setErrMessage] = useState<string>("");
  const [isValidAccount, setIsValidAccount] = useState<boolean>(false);
  assetList.sort((a: ICoin, b: ICoin) => a.data.name.localeCompare(b.data.name));

  const networkFee = (): string => {
    return gasToValue(estimatedTxnResult!.gas_used, estimatedTxnResult!.gas_unit_price);
  };

  const handleListItemClick = (
    _event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: string,
    asset: ICoin
  ): void => {
    setIsLocalLoading(false);
    clearError();
    clearPrevEstimation();
    setSelectedIndex(index);
    setSelectedAsset(asset);
    setCoinType(asset.type);
    setEstimationRequired(true);
  };

  useEffect(() => {
    if (accountImported && openAddAssetDialog) {
      _validateAccount(currentAddress!);
    }
  }, [openAddAssetDialog]);

  const _validateAccount = async (address: string): Promise<void> => {
    const result = await validateAccount(address);
    if (result) {
      setIsValidAccount(true);
    } else {
      setIsValidAccount(false);
    }
  };

  useEffect(() => {
    if (estimationRequired) {
      handleEstimateNetworkFee();
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

  const handleGetBalance = async (): Promise<void> => {
    setIsLoading(true);
    await getBalance();
    setIsLoading(false);
  };

  const handleEstimateNetworkFee = async (): Promise<void> => {
    setIsLocalLoading(true);
    try {
      await handleEstimateTransaction(coinType);
    } catch (error) {
      console.log(error);
      setIsError(true);
      setErrMessage(errorParser(error, "Generic Error"));
    }
    setEstimationRequired(false);
    setIsLocalLoading(false);
  };

  const clearError = (): void => {
    setIsError(false);
    setErrMessage("");
  };

  const handleEstimateTransaction = async (coinType: string): Promise<void> => {
    const payload = await register(coinType);
    await estimateTransaction(payload, true, true);
  };

  const handleFindAsset = async (): Promise<void> => {
    setIsLocalLoading(true);
    const data: ICoin | undefined = await findAsset(coinType);
    if (!data) {
      throwAlert({ signal: 112, title: "Error", message: "Asset doesn't exist on chain", error: true });
      if (!isCustomToken) {
        clearPrevEstimation();
        clearDialog();
      }
    } else {
      handleRegisterAsset();
    }
    setIsLocalLoading(false);
  };

  const handleRegisterAsset = async (): Promise<void> => {
    setIsLocalLoading(true);
    if (selectedIndex !== "" || isCustomToken) {
      const assetData: ICoin | undefined = await findAsset(coinType);
      if (assetData) {
        setEstimationRequired(true);
        await registerAssetInAccount(coinType);
        clearPrevEstimation();
        clearDialog();
      } else {
        throwAlert({ signal: 112, title: "Error", message: "Asset doesn't exist on chain", error: true });
        clearPrevEstimation();
        clearDialog();
      }
    }
    setIsLocalLoading(false);
  };

  const handleAddCustomToken = async (): Promise<void> => {
    clearPrevEstimation();
    clearDialog();
    setIsCustomToken(true);
  };

  const registerAssetInAccount = async (coinType: string): Promise<void> => {
    await registerAsset(coinType, selectedAsset.data.name);
    setCurrentAsset(selectedAsset as ICoin);
    setStore(PLATFORM, _currentAsset, selectedAsset);
  };

  const clearDialog = (): void => {
    setIsValidAsset(false);
    setSelectedIndex("");
    setSelectedAsset({});
    setIsCustomToken(false);
    setCoinType("");
    updateAccountAssets();
  };

  const handleCancel = (): void => {
    setOpenAddAssetDialog(false);
    clearPrevEstimation();
    clearDialog();
  };

  const getTextColor = (): string => {
    if (isValidTransaction) {
      return "info.main";
    } else if (!isValidTransaction && estimatedTxnResult) {
      return "error.main";
    } else if (isError && isValidAccount) {
      return "error.main";
    } else if (!isValidAccount) {
      return "warning.main";
    } else {
      return "info.main";
    }
  };

  return (
    <Dialog open={openAddAssetDialog}>
      {isCustomToken ? (
        <DialogTitle align="center">Register Custom Asset</DialogTitle>
      ) : (
        <DialogTitle align="center">
          Register Asset
          {isLocalLoading && (
            <Tooltip title={"Fetching"}>
              <CircularProgress
                sx={{
                  display: "flex",
                  ml: "215px",
                  color: "#9e9e9e",
                  position: "absolute",
                  mt: "-25px",
                }}
                size={20}
                thickness={5.5}
              />
            </Tooltip>
          )}
        </DialogTitle>
      )}
      <DialogContent sx={{ display: "flex", flexDirection: "column", width: "305px" }}>
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
            {mainnet && (
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
                        <ListItemText sx={{ ml: "-16px" }} primary={`${asset.data.name} (${asset.data.symbol})`} />
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
            <Button variant="outlined" sx={{ mt: 1, mb: 1, width: "180px" }} onClick={handleAddCustomToken}>
              Add Custom Token
            </Button>
          </Stack>
        )}
        <Stack sx={{ minHeight: "32px", mb: "-10px" }}>
          {(selectedIndex !== "" || isCustomToken) && (
            <Box
              sx={{
                minHeight: "24px",
                alignSelf: "center",
                mt: isCustomToken ? "12px" : "4px",
                width: "100%",
              }}
            >
              <Typography align="center" color={() => getTextColor()} sx={{ fontSize: "14px", fontWeight: "450" }}>
                {isValidTransaction && `Network Fee: ${networkFee()} APT`}
                {!isValidTransaction && estimatedTxnResult && `Simulation failed`}
                {isError && isValidAccount && `${errMessage}`}
                {!isValidAccount && "Account is not registered on chain"}
              </Typography>
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
