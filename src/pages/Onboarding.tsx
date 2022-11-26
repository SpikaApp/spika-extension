import { Box, Button, Container, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import spika_bg from "../assets/spika_bg.png";
import { PLATFORM } from "../utils/constants";

const Onboarding = (): JSX.Element => {
  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: "100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h5" align="center" color="textPrimary" gutterBottom>
          <b>Welcome!</b>
        </Typography>
        <Typography sx={{ mt: 1, mb: 3 }} variant="subtitle1" align="center" color="textPrimary">
          <b>Create or import existing account to start working with wallet.</b>
        </Typography>
        <Stack sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
            <Typography sx={{ fontWeight: 500, textDecorationLine: "underline" }} variant="body1" color="link">
              Import Account
            </Typography>
          </Link>
        </Stack>
        {(PLATFORM === "http:" || PLATFORM === "https:") && (
          <Typography variant="caption" align="center" color="textPrimary" sx={{ fontWeight: 400, mt: 2 }}>
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
          <Typography align="center" sx={{ fontWeight: 400, mt: 2 }} variant="subtitle2">
            Need help setting up your account? <br />
            Check{" "}
            <Link href="https://docs.spika.app" underline="none" target="_blank" color="link">
              guidelines
            </Link>{" "}
            or contact{" "}
            <Link href="mailto:support@spika.app" underline="none" target="_blank" color="link">
              support
            </Link>{" "}
            for assistance.
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 3 }}>
        <Box component="img" src={spika_bg} />
      </Box>
    </Container>
  );
};

export default Onboarding;
