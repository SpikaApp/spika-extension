import { useContext } from "react";
import { Container, Typography, Link, Card, Box, CardContent, Stack } from "@mui/material";
import TwitterIcon from "@mui/icons-material/Twitter";
import spika_logo from "../assets/spika_logo_128.png";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { EXTENSION_VERSION, APTOS_SDK_VERSION } from "../utils/constants";

const About = () => {
  const { darkMode } = useContext(UIContext);

  return (
    <Container maxWidth="xs">
      <Card sx={{ mt: "100px", minHeight: "305px" }}>
        <CardContent>
          <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
            Spika Aptos Wallet v{EXTENSION_VERSION}
          </Typography>
          <Typography sx={{ mb: "-12px" }} variant="subtitle1" align="center" color="textPrimary">
            Aptos SDK version {APTOS_SDK_VERSION}
            <br />
            <Link
              href="https://docs.spika.app/terms-and-conditions/license"
              underline="none"
              target="_blank"
              color="link"
            >
              {" "}
              License
            </Link>
            <br />
            <Link
              href="https://docs.spika.app/terms-and-conditions/privacy-policy"
              underline="none"
              target="_blank"
              color="link"
            >
              {" "}
              Privacy Policy
            </Link>
            <br />
            <Link href="mailto:support@spika.app" underline="none" target="_blank" color="link">
              Support
            </Link>
            <Stack
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
                mb: 2,
              }}
            >
              <Link
                href="https://spika.app"
                color={darkMode ? "white" : "black"}
                underline="none"
                target="_blank"
              >
                <Box
                  sx={{ height: "48px", width: "48px", mr: 2 }}
                  component="img"
                  src={spika_logo}
                />
              </Link>
              <Link
                href="https://www.twitter.com/SpikaApp"
                color="#1DA1F2"
                underline="none"
                target="_blank"
              >
                <TwitterIcon sx={{ fontSize: 42 }} />
              </Link>
            </Stack>
          </Typography>
        </CardContent>
      </Card>
      <Box sx={{ mt: "158px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography align="center" variant="overline">
          © 2022 Spika. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default About;
