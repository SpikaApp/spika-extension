import React, { useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Container, Typography, Card, CardActions, CardContent, CardMedia, Button, Chip, Tooltip } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SendIcon from "@mui/icons-material/Send";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import Loading from "./components/Loading";
import AlertDialog from "./components/AlertDialog";
import MintDialog from "./components/MintDialog";
import SendDialog from "./components/SendDialog";
import { UIContext } from "./context/UIContext";
import { AccountContext } from "./context/AccountContext";
import shortenAddress from "./utils/shortenAddress";
import aptos_logo from "./assets/aptos_logo.png";

const Wallet = () => {
  const { handleMintUI, handleSendUI } = useContext(UIContext);
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
        {accountImported && <CardMedia component="img" image={aptos_logo} alt="aptos" />}
        <CardContent>
          {accountImported ? (
            <Tooltip title="Copy address">
              <Chip sx={{ marginBottom: 1 }} label={shortenAddress(currentAddress)} onClick={handleClick} />
            </Tooltip>
          ) : (
            <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
              Welcome
            </Typography>
          )}
          {accountImported ? (
            <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
              {balance} TestCoin
            </Typography>
          ) : (
            <Typography align="center" color="textSecondary" gutterBottom>
              Create or import existing account to start working with wallet
            </Typography>
          )}
        </CardContent>
        {accountImported ? (
          <CardActions>
            <Button variant="outlined" startIcon={<CallReceivedIcon />} onClick={handleMintUI}>
              Mint
            </Button>
            <Button variant="contained" endIcon={<SendIcon />} onClick={handleSendUI}>
              Send
            </Button>
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
      <AlertDialog />
    </Container>
  );
};

export default Wallet;
