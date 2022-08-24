import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Container, Typography, Box, Button, Stack, Link } from "@mui/material";
import spika_bg from "../assets/spika_bg.png";
import { PLATFORM } from "../utils/constants";

const Onboarding = () => {
  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: "100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h5" align="center" color="textPrimary" gutterBottom>
          <b>Welcome!</b>
        </Typography>
        <Typography sx={{ mt: 1, mb: 3 }} variant="subtitle" align="center" color="textPrimary">
          <b>Create or import existing account to start working with wallet.</b>
        </Typography>
        <Stack direction="column" align="center">
          <Button
            variant="contained"
            component={RouterLink}
            to="create"
            sx={{
              mb: 1.5,
              width: 191,
              background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
            }}
          >
            Create Account
          </Button>
          <Link component={RouterLink} to="import">
            <Typography
              sx={{ fontWeight: 500, textDecorationLine: "underline" }}
              variant="body"
              color="link"
            >
              Import Account
            </Typography>
          </Link>
        </Stack>
        {(PLATFORM === "http:" || PLATFORM === "https:") && (
          <Typography
            variant="caption"
            align="center"
            color="textPrimary"
            sx={{ fontWeight: 400, mt: 2 }}
          >
            For optimal experience it is advisable to install Spika as browser{" "}
            <Link
              href="https://chrome.google.com/webstore/detail/spika/fadkojdgchhfkdkklllhcphknohbmjmb"
              underline="none"
              target="_blank"
            >
              {" "}
              extension
            </Link>
            . Some features may not be supported when running in browser's tab.
          </Typography>
        )}
        {PLATFORM === "chrome-extension:" && (
          <Typography
            variant="caption"
            align="center"
            color="textPrimary"
            sx={{ fontWeight: 400, mt: 2 }}
          >
            Spika is connected to Aptos Devnet. All account addresses and resources will be deleted
            with scheduled weekly Devnet update.
          </Typography>
        )}
      </Box>
      <Box
        sx={{ display: "flex", justifyContent: "start", alignItems: "center", mt: 3 }}
        component="img"
        src={spika_bg}
      />
    </Container>
  );
};

export default Onboarding;
