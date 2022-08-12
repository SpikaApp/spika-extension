import React, { useContext, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Tooltip,
  Stack,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SendIcon from "@mui/icons-material/Send";
import DownloadIcon from "@mui/icons-material/Download";
import MintDialog from "../components/MintDialog";
import SendDialog from "../components/SendDialog";
import ConfirmSendDialog from "../components/ConfirmSendDialog";
import ReceiveDialog from "../components/ReceiveDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import aptos_light from "../assets/aptos_light.png";
import aptos_dark from "../assets/aptos_dark.png";
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
          <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
            <AccountBalanceWalletIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
            <br />
            Spika Web Wallet
          </Typography>
          <Card sx={{ mb: 2, minHeight: 350 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Stack sx={{ alignItems: "center", mt: 1 }}>
                <Typography sx={{ mb: 1.5 }}>Network: Aptos Devnet</Typography>
                <Tooltip title="Copy address">
                  <Chip
                    sx={{ mb: 1 }}
                    label={shortenAddress(currentAddress)}
                    onClick={handleClick}
                  />
                </Tooltip>
              </Stack>
              <Stack sx={{ display: "flex", alignItems: "center", my: -2 }}>
                {darkMode ? (
                  <CardMedia
                    sx={{ mb: 1.5 }}
                    component="img"
                    image={currentAsset[0].logo_dark}
                    alt="aptos"
                  />
                ) : (
                  <CardMedia
                    sx={{ mb: 1.5 }}
                    component="img"
                    image={currentAsset[0].logo_light}
                    alt="aptos"
                  />
                )}

                <Typography
                  sx={{ mb: 1 }}
                  variant="h6"
                  align="center"
                  color="textSecondary"
                  gutterBottom
                >
                  {balance} {currentAsset[0].ticker}
                </Typography>
              </Stack>
            </CardContent>
            <CardActions>
              <Stack sx={{ display: "flex", alignItems: "center" }}>
                <Button sx={{ mb: 2.5 }} variant="outlined" onClick={handleMintUI}>
                  Faucet
                </Button>

                <Stack direction="row" sx={{ mt: 2 }}>
                  <Button
                    sx={{ mr: 4 }}
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendUI}
                  >
                    Send
                  </Button>
                  <Button variant="contained" endIcon={<DownloadIcon />} onClick={handleReceiveUI}>
                    Receive
                  </Button>
                </Stack>
              </Stack>
            </CardActions>
          </Card>
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
