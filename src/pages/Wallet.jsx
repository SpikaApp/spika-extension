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
} from "@mui/material";
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
import shortenAddress from "../utils/shorten_address";
import copyToClipboard from "../utils/copy_clipboard";

const Wallet = () => {
  const {
    darkMode,
    handleMintUI,
    handleSendUI,
    handleReceiveUI,
    handleAccountAssetsUI,
    handleAddAssetUI,
  } = useContext(UIContext);
  const { isLoading, currentAddress, accountImported, currentAsset, balance } =
    useContext(AccountContext);
  const { getBalance } = useContext(Web3Context);

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
          <Card sx={{ mb: 2, minHeight: "240px", mt: "100px" }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Stack
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  mt: 1,
                }}
              >
                <Typography sx={{ mr: 6 }}>Aptos Devnet</Typography>
                <Tooltip sx={{ my: "-3px" }} title="Copy address">
                  <Chip label={shortenAddress(currentAddress)} onClick={handleClick} />
                </Tooltip>
              </Stack>
              {isLoading ? (
                <Typography sx={{ mt: 4 }} variant="h6">
                  Updatin balance...
                </Typography>
              ) : (
                <Tooltip title="Switch active asset">
                  <Button
                    variant="outlined"
                    sx={{ width: "260px", height: "64px", mt: "28px" }}
                    onClick={handleAccountAssetsUI}
                  >
                    <Stack
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        mt: 1,
                        py: 2,
                      }}
                    >
                      {darkMode ? (
                        <Box
                          component="img"
                          src={currentAsset.data.logo_dark}
                          sx={{
                            maxWidth: "32px",
                            maxHeight: "32px",
                            mr: "12px",
                            mt: "4px",
                            ml: "12px",
                          }}
                        />
                      ) : (
                        <Box
                          component="img"
                          src={currentAsset.data.logo_light}
                          sx={{
                            maxWidth: "32px",
                            maxHeight: "32px",
                            mr: "12px",
                            mt: "4px",
                            ml: "12px",
                          }}
                        />
                      )}

                      <Typography sx={{ mb: 1 }} variant="h4" align="center" color="textPrimary">
                        {balance}
                      </Typography>
                      <Typography sx={{ ml: "6px" }} color="TextSecondary">
                        {currentAsset.data.symbol}
                      </Typography>
                    </Stack>
                  </Button>
                </Tooltip>
              )}
            </CardContent>
            <CardActions>
              <Stack sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                {currentAsset.id === "aptosCoin" && (
                  <Button
                    sx={{ width: "160px", mt: "-10px" }}
                    color="primary"
                    onClick={handleMintUI}
                  >
                    Faucet
                  </Button>
                )}
              </Stack>
            </CardActions>
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
            <Stack sx={{ display: "flex", alignItems: "center" }}>
              <Button
                variant="outlined"
                sx={{
                  width: "90%",
                  height: "38px",
                  mt: 8,
                }}
                onClick={handleAddAssetUI}
              >
                Import Asset
              </Button>
            </Stack>
          )}
          {accountImported && (
            <Box sx={{ mt: "59px" }}>
              <Footer />
            </Box>
          )}
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
