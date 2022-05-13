import { useContext } from "react";
import { Container, Typography, Link, Card, CardContent, CardActions, Stack, Button } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { AccountContext } from "./context/AccountContext";
import { UIContext } from "./context/UIContext";
import useAxios from "./utils/useAxios";
import { NODE_URL } from "./context/AccountContext";

const About = () => {
  const { accountImported } = useContext(AccountContext);
  const { handleMnemonicUI, handlePrivateKeyUI } = useContext(UIContext);
  const { result: chain_id } = useAxios(NODE_URL, "chain_id");

  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <InfoIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        Crypto Wallet in Development
      </Typography>
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        for{" "}
        <Link href="https://aptoslabs.com/" underline="none">
          APTOS
        </Link>{" "}
        Blockchain (id: {chain_id})
      </Typography>
      <Card>
        <CardContent>
          <Typography align="center" color="textPrimary" gutterBottom>
            Wallet version 0.0.4 <br />
            Aptos SDK version 0.0.20
            <br />
            Copyright 2022 by{" "}
            <Link href="https://github.com/xorgal" underline="none">
              {" "}
              xorgal
            </Link>
            <br />
            <Link href="mailto:spika@xorgal.xyz" underline="none">
              spika@xorgal.xyz
            </Link>
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
