import React, { useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
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
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import DownloadIcon from "@mui/icons-material/Download";
import Loading from "./components/Loading";
import AlertDialog from "./components/AlertDialog";
import MintDialog from "./components/MintDialog";
import SendDialog from "./components/SendDialog";
import ReceiveDialog from "./components/ReceiveDialog";
import { UIContext } from "./context/UIContext";
import { AccountContext } from "./context/AccountContext";
import shortenAddress from "./utils/shortenAddress";
import aptos_light from "./assets/aptos_light.png";
import aptos_dark from "./assets/aptos_dark.png";

const Wallet = () => {
  const { darkMode, handleMintUI, handleSendUI, handleReceiveUI } = useContext(UIContext);
  const { currentAddress, accountImported, balance, getBalance } = useContext(AccountContext);

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
    navigator.clipboard.writeText(currentAddress);
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <AccountBalanceWalletIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        Your Wallet
      </Typography>
      <Card>
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {accountImported ? (
            <div>
              <Stack sx={{ alignItems: "center" }}>
                <Typography sx={{ mb: 1.5 }} color="info.main">
                  Network: Aptos Devnet
                </Typography>

                <Tooltip title="Copy address">
                  <Chip
                    sx={{ marginBottom: 1 }}
                    label={shortenAddress(currentAddress)}
                    onClick={handleClick}
                  />
                </Tooltip>
              </Stack>
            </div>
          ) : (
            <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
              Welcome
            </Typography>
          )}
          {accountImported ? (
            <Stack sx={{ display: "flex", alignItems: "center", my: -2 }}>
              {darkMode ? (
                <CardMedia sx={{ mb: 1.5 }} component="img" image={aptos_dark} alt="aptos" />
              ) : (
                <CardMedia sx={{ mb: 1.5 }} component="img" image={aptos_light} alt="aptos" />
              )}

              <Typography
                sx={{ mb: 1 }}
                variant="h6"
                align="center"
                color="textSecondary"
                gutterBottom
              >
                {balance} TestCoin
              </Typography>
            </Stack>
          ) : (
            <Typography align="center" color="textSecondary" gutterBottom>
              Create or import existing account to start working with wallet
            </Typography>
          )}
        </CardContent>
        {accountImported ? (
          <CardActions>
            <Stack sx={{ display: "flex", alignItems: "center" }}>
              <Button
                sx={{ mb: 4, width: 100 }}
                variant="outlined"
                startIcon={<CloudQueueIcon />}
                onClick={handleMintUI}
              >
                Mint
              </Button>

              <Stack direction="row">
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
        ) : (
          <CardActions>
            <Button variant="outlined" component={RouterLink} to="create">
              Create Account
            </Button>
            <Button variant="contained" component={RouterLink} to="import">
              Import Account
            </Button>
          </CardActions>
        )}
      </Card>
      <Loading />
      <MintDialog />
      <SendDialog />
      <ReceiveDialog />
      <AlertDialog />
    </Container>
  );
};

export default Wallet;
