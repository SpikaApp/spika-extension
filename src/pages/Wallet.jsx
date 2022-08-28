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
import ConfirmSendDialog from "../components/ConfirmSendDialog";
import ReceiveDialog from "../components/ReceiveDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import shortenAddress from "../utils/shorten_address";
import copyToClipboard from "../utils/copy_clipboard";

const Wallet = () => {
  const { darkMode, handleMintUI, handleSendUI, handleReceiveUI } = useContext(UIContext);
  const { currentAddress, accountImported, currentAsset, balance } = useContext(AccountContext);
  const { getBalance } = useContext(Web3Context);

  useEffect(() => {
    if (accountImported) {
      const updateAccountResources = window.setInterval(() => {
        getBalance();
      }, 10000);
      return () => window.clearInterval(updateAccountResources);
    }
    return undefined;
  }, [accountImported]);

  const handleClick = () => {
    copyToClipboard(currentAddress);
  };

  return (
    <Box>
      {accountImported && (
        <Container maxWidth="xs">
          <Card sx={{ mb: 2, minHeight: "198px", mt: "100px" }}>
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
              <Stack
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  mt: "24px",
                }}
              >
                {darkMode ? (
                  <Box
                    component="img"
                    src={currentAsset[0].logo_dark}
                    sx={{ maxWidth: "32px", maxHeight: "32px", mr: "12px", mt: "4px", ml: "12px" }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={currentAsset[0].logo_light}
                    sx={{ maxWidth: "32px", maxHeight: "32px", mr: "12px", mt: "4px", ml: "12px" }}
                  />
                )}

                <Typography
                  sx={{ mb: 1 }}
                  variant="h4"
                  align="center"
                  color="textPrimary"
                  gutterBottom
                >
                  {balance}
                </Typography>
                <Typography sx={{ ml: "6px" }} color="TextSecondary">
                  {currentAsset[0].ticker}
                </Typography>
              </Stack>
            </CardContent>
            <CardActions>
              <Button
                sx={{ width: "122px" }}
                variant="outlined"
                color="primary"
                onClick={handleMintUI}
              >
                Faucet
              </Button>
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
