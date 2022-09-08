import React, { useContext, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardActions,
  CardContent,
  Button,
  Chip,
  Tooltip,
  Stack,
  IconButton,
} from "@mui/material";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MintDialog from "../components/MintDialog";
import SendDialog from "../components/SendDialog";
import AccountAssetsDialog from "../components/AccountAssetsDialog";
import AddAssetDialog from "../components/AddAssetDialog";
import ConfirmSendDialog from "../components/ConfirmSendDialog";
import ReceiveDialog from "../components/ReceiveDialog";
import Footer from "../components/Footer";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import { stringToValue } from "../utils/values";
import shortenAddress from "../utils/shorten_address";
import copyToClipboard from "../utils/copy_clipboard";
import transaction from "../tests/transaction.test";

const Wallet = () => {
  const {
    darkMode,
    handleMintUI,
    handleSendUI,
    handleReceiveUI,
    handleAccountAssetsUI,
    handleAddAssetUI,
    devMode,
    setIsTest,
  } = useContext(UIContext);
  const { isLoading, currentAddress, accountImported, currentAsset, balance } =
    useContext(AccountContext);
  const { getBalance, handleMint } = useContext(Web3Context);

  const { result: testResult } = transaction();

  useEffect(() => {
    if (accountImported) {
      const updateAccountResources = window.setInterval(() => {
        getBalance();
      }, 10000);
      return () => window.clearInterval(updateAccountResources);
    }
    return undefined;
  }, [currentAsset]);

  const handleClick = () => {
    copyToClipboard(currentAddress);
  };

  return (
    <Box>
      {accountImported && (
        <Container maxWidth="xs">
          <Card sx={{ mb: 2, height: "175px", mt: "100px" }}>
            <CardContent>
              <Stack
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Typography sx={{ mr: 5, mt: "3px" }}>Aptos Devnet</Typography>
                <Tooltip title="Copy address">
                  <Chip label={shortenAddress(currentAddress)} onClick={handleClick} />
                </Tooltip>
              </Stack>
              {isLoading ? (
                <Typography sx={{ mt: "22px" }} align="center" variant="h6">
                  Updating balance...
                </Typography>
              ) : (
                <div>
                  <Stack
                    direction="column"
                    sx={{
                      alignItems: "center",
                      display: "flex",
                      justifyContent: "center",
                      mt: "16px",
                    }}
                  >
                    <Stack direction="row">
                      <Tooltip title="Switch active asset">
                        <Button
                          sx={{ mr: "2px", width: "220px", display: "flex" }}
                          variant="outlined"
                          onClick={handleAccountAssetsUI}
                        >
                          <Box
                            sx={{
                              width: "24px",
                              height: "24px",
                            }}
                            component="img"
                            src={darkMode ? currentAsset.data.logo_alt : currentAsset.data.logo}
                          />
                          <ArrowDropDownIcon sx={{ position: "absolute", ml: "190px" }} />
                          <Typography noWrap sx={{ ml: "8px" }} variant="h6" color="textPrimary">
                            {currentAsset.data.name}
                          </Typography>
                        </Button>
                      </Tooltip>
                    </Stack>
                    <Stack>
                      <Stack direction="row" sx={{ mt: "8px", maxWidth: "300px" }}>
                        <Tooltip
                          title={`${stringToValue(currentAsset, balance)} ${
                            currentAsset.data.symbol
                          }`}
                        >
                          <Typography
                            noWrap
                            sx={{ fontSize: "24px", cursor: "default" }}
                            variant="button"
                            align="center"
                            color="textSecondary"
                          >
                            {stringToValue(currentAsset, balance)}
                          </Typography>
                        </Tooltip>
                        <Typography
                          sx={{ ml: "8px", fontSize: "24px", cursor: "default" }}
                          variant="button"
                          color="TextSecondary"
                        >
                          {currentAsset.data.symbol}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </div>
              )}
              {currentAsset.data.name === "AptosCoin" && !isLoading && (
                <Tooltip title={"Faucet"}>
                  <IconButton
                    position="absolute"
                    sx={{ mt: "-170px", ml: "270px" }}
                    onClick={handleMint}
                  >
                    <LocalGasStationIcon />
                  </IconButton>
                </Tooltip>
              )}
            </CardContent>
          </Card>
          <Stack
            direction="row"
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-around", mt: 3 }}
          >
            <Button
              sx={{
                background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                width: "154px",
              }}
              variant="contained"
              onClick={handleSendUI}
            >
              Send
            </Button>
            <Button variant="outlined" sx={{ width: "154px" }} onClick={handleReceiveUI}>
              Receive
            </Button>
          </Stack>
          {accountImported && (
            <Box
              sx={{
                backgroundColor: "#F19223",
                width: "100%",
                height: "155px",
                mt: "28px",
                mb: "28px",
                position: "relative",
              }}
            ></Box>
          )}
          {accountImported && (
            <Stack position="relative" sx={{ alignItems: "center", justifyContent: "center" }}>
              <Button
                variant="outlined"
                sx={{
                  width: "90%",
                  height: "35px",
                }}
                onClick={handleAddAssetUI}
              >
                Import Asset
              </Button>
            </Stack>
          )}
          {/* {accountImported && (
            <Box sx={{ mt: "1px" }}>
              <Footer />
            </Box>
          )} */}
          <AccountAssetsDialog />
          <AddAssetDialog />
          <MintDialog />
          <SendDialog />
          <ConfirmSendDialog />
          <ReceiveDialog />
        </Container>
      )}
    </Box>
  );
};

export default Wallet;
