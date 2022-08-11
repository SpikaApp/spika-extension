import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardActions,
  CardContent,
  Button,
  Stack,
  Link,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { PLATFORM } from "../utils/constants";

const Onboarding = () => {
  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <AccountBalanceWalletIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        Spika Web Wallet
      </Typography>
      <Card sx={{ mb: 2, minHeight: 350 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
            Welcome
          </Typography>
          <Typography variant="h6" align="center" color="textPrimary">
            Create or import existing account to start working with wallet
          </Typography>
          {(PLATFORM === "http:" || PLATFORM === "https:") && (
            <Typography variant="subtitle1" align="center" color="textPrimary" sx={{ mt: 2 }}>
              For optimal experience it is advisable to install Spika as browser{" "}
              <Link
                href="https://chrome.google.com/webstore/detail/spika/fadkojdgchhfkdkklllhcphknohbmjmb"
                underline="none"
                target="_blank"
              >
                {" "}
                extension
              </Link>
              . Some features may not be supported when running in browser's tab
            </Typography>
          )}
          {PLATFORM === "chrome-extension:" && (
            <Typography variant="subtitle1" align="center" color="textPrimary" sx={{ mt: 2 }}>
              Spika is connected to Aptos Devnet and all account addresses and resources will be
              deleted with scheduled weekly Devnet update
            </Typography>
          )}
        </CardContent>

        <CardActions>
          <Stack direction="column">
            <Button variant="contained" component={RouterLink} to="create" sx={{ mb: 2.5 }}>
              Create Account
            </Button>
            <Button variant="contained" component={RouterLink} to="import">
              Import Account
            </Button>
          </Stack>
        </CardActions>
      </Card>
    </Container>
  );
};

export default Onboarding;
