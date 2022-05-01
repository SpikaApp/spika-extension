import { useContext, useEffect } from "react";
import { Container, Typography, Link, Card, CardContent, CardActions, Button } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import KeyIcon from "@mui/icons-material/Key";
import AlertDialog from "./components/AlertDialog";
import { AccountContext } from "./context/AccountContext";
import { UIContext } from "./context/UIContext";
import useAxios from "./utils/useAxios";
import { NODE_URL } from "./context/AccountContext";

const About = () => {
  const { accountImported } = useContext(AccountContext);
  const { handleMnemonicUI } = useContext(UIContext);
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
            Wallet version 0.0.3 <br />
            Aptos SDK version 0.0.18
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
            <Button variant="outlined" endIcon={<KeyIcon />} onClick={handleMnemonicUI}>
              Reveal Mnemonic
            </Button>
          )}
        </CardActions>
      </Card>
      <AlertDialog />
    </Container>
  );
};

export default About;
