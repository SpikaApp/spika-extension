import { useContext } from "react";
import {
  Container,
  Typography,
  Link,
  Card,
  CardContent,
  CardActions,
  Stack,
  Button,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import GitHubIcon from "@mui/icons-material/GitHub";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import useAxios from "../utils/use_axios";
import { NODE_URL } from "../utils/constants";

const About = () => {
  const { accountImported } = useContext(AccountContext);
  const { handleMnemonicUI, handlePrivateKeyUI, darkMode } = useContext(UIContext);
  const { result: chain_id } = useAxios(NODE_URL, "chain_id");

  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <InfoIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        Spika Web Wallet
      </Typography>
      <Card sx={{ mb: 2, minHeight: 350 }}>
        <CardContent>
          <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
            <Link href="https://aptoslabs.com/" underline="none" target="_blank">
              Aptos Devnet
            </Link>{" "}
            chain id {chain_id}
          </Typography>
          <Typography variant="subtitle1" align="center" color="textPrimary">
            Wallet version 0.2.1 <br />
            Aptos SDK version 1.3.3
            <br />
            <Link
              href="https://github.com/xorgal/spika/blob/master/LICENSE"
              underline="none"
              target="_blank"
            >
              {" "}
              License
            </Link>
            <br />
            <Link
              href="https://github.com/xorgal/spika/blob/master/docs/PRIVACY.md"
              underline="none"
              target="_blank"
            >
              {" "}
              Privacy Policy
            </Link>
            <br />
            <Link href="mailto:spika@xorgal.xyz" underline="none" target="_blank">
              Contacts
            </Link>
            <Stack
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Link
                href="https://github.com/xorgal/spika"
                color={darkMode ? "white" : "black"}
                underline="none"
                target="_blank"
              >
                <GitHubIcon sx={{ fontSize: 42 }} />
              </Link>
            </Stack>
          </Typography>
        </CardContent>
        <CardActions>
          {accountImported && (
            <Stack>
              <Button sx={{ marginBottom: 2 }} variant="outlined" onClick={handleMnemonicUI}>
                Show Mnemonic
              </Button>
              <Button variant="outlined" onClick={handlePrivateKeyUI}>
                Show Private Key
              </Button>
            </Stack>
          )}
        </CardActions>
      </Card>
    </Container>
  );
};

export default About;
