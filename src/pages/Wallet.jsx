import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CircleIcon from "@mui/icons-material/Circle";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import { Box, Button, Card, CardContent, Chip, Container, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { AptosClient } from "aptos";
import { useContext, useEffect, useState } from "react";
import AccountAssetsDialog from "../components/AccountAssetsDialog";
import AddAssetDialog from "../components/AddAssetDialog";
import ConfirmSendDialog from "../components/ConfirmSendDialog";
import MintDialog from "../components/MintDialog";
import NetworkDialog from "../components/NetworkDialog";
import ReceiveDialog from "../components/ReceiveDialog";
import SendDialog from "../components/SendDialog";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import copyToClipboard from "../utils/copyToClipboard";
import shortenAddress from "../utils/shortenAddress";
import { stringToValue } from "../utils/values";

const Wallet = () => {
  const { darkMode, handleSendUI, handleReceiveUI, handleAccountAssetsUI, handleAddAssetUI, handleChangeNetworkUI } =
    useContext(UIContext);
  const { isLoading, currentAddress, accountImported, currentNetwork, currentAsset, balance } =
    useContext(AccountContext);
  const { getBalance, handleMint } = useContext(Web3Context);
  const [isOnline, setIsOnline] = useState(false);
  const [chainId, setChainId] = useState();

  useEffect(() => {
    if (accountImported) {
      getChainId(currentNetwork.data.node_url);
      getBalance();
      const updateBalance = window.setInterval(() => {
        getBalance();
        getChainId(currentNetwork.data.node_url);
      }, 10000);
      return () => window.clearInterval(updateBalance);
    }
    return undefined;
  }, [currentAsset]);

  useEffect(() => {
    if (chainId !== undefined) {
      setIsOnline(true);
    } else {
      setIsOnline(false);
    }
  }, [chainId]);

  const getChainId = async (nodeUrl) => {
    const client = new AptosClient(nodeUrl);
    try {
      const id = await client.getChainId();
      setChainId(id);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClick = () => {
    copyToClipboard(currentAddress);
  };

  return (
    <Box>
      {accountImported && (
        <Container maxWidth="xs">
          <Card sx={{ mb: 2, height: "185px", mt: "100px" }}>
            <Stack
              sx={{
                display: "flex",
                flexDirection: "row",
                mt: "18px",
                mb: "-18px",
              }}
            >
              <Tooltip sx={{ mr: "85px" }} title="Change network">
                <Chip
                  label={
                    <Stack sx={{ display: "flex", flexDirection: "row" }}>
                      <CircleIcon
                        sx={{
                          color: isOnline ? "success.light" : "error.main",
                          width: "12px",
                          height: "12px",
                          mt: "4px",
                        }}
                      />
                      <Typography noWrap sx={{ ml: "5px", maxWidth: "100px" }} variant="body2">
                        {currentNetwork.name}
                      </Typography>
                    </Stack>
                  }
                  onClick={handleChangeNetworkUI}
                />
              </Tooltip>
              <Tooltip title="Copy address">
                <Chip label={shortenAddress(currentAddress)} onClick={handleClick} />
              </Tooltip>
            </Stack>
            <CardContent>
              {isLoading ? (
                <Typography sx={{ mt: "-90px" }} align="center" variant="h6">
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
                          sx={{ mr: "2px", width: "220px", height: "50px", display: "flex" }}
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
                          <ArrowDropDownIcon sx={{ position: "absolute", ml: "180px" }} />
                          <Typography noWrap sx={{ ml: "8px" }} variant="h6" color="textPrimary">
                            {currentAsset.data.name}
                          </Typography>
                        </Button>
                      </Tooltip>
                    </Stack>
                    <Stack>
                      <Stack direction="row" sx={{ mt: "8px", maxWidth: "300px" }}>
                        <Tooltip title={`${stringToValue(currentAsset, balance)} ${currentAsset.data.symbol}`}>
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
                          color="textSecondary"
                        >
                          {currentAsset.data.symbol}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </div>
              )}
              {currentAsset.data.name === "Aptos Coin" &&
                (currentNetwork.name === "Devnet" || currentNetwork.name === "Local") &&
                !isLoading && (
                  <Tooltip title={"Faucet"}>
                    <IconButton position="absolute" sx={{ mt: "-180px", ml: "270px" }} onClick={handleMint}>
                      <LocalGasStationIcon />
                    </IconButton>
                  </Tooltip>
                )}
            </CardContent>
          </Card>
          <Stack direction="row" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 3 }}>
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
                // backgroundColor: "#F19223",
                width: "100%",
                height: "145px",
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
                  width: "75%",
                  height: "35px",
                }}
                onClick={handleAddAssetUI}
              >
                Register Asset
              </Button>
            </Stack>
          )}
          <NetworkDialog />
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
