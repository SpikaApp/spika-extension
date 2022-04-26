import { useContext } from "react";
import { Container, Typography, Link, Card, CardContent, CardActions, Button } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import KeyIcon from "@mui/icons-material/Key";
import AlertDialog from "./components/AlertDialog";
import { AccountContext } from "./context/AccountContext";
import { UIContext } from "./context/UIContext";

const About = () => {
  const { setOpenAlertDialog } = useContext(UIContext);
  const { setAlertSignal, setAlertTitle, setAlertMessage } = useContext(AccountContext);

  const handleMnemonic = () => {
    try {
      var data = localStorage.getItem("mnemonic");
      setAlertSignal(91);
      setAlertTitle("Mnemonic Phrase");
      setAlertMessage(data);
      setOpenAlertDialog(true);
    } catch (error) {
      setAlertSignal(92);
      setAlertTitle("Error");
      setAlertMessage("No mnemonic found");
      setOpenMnemonicDialog(true);
    }
  };

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
        Blockchain
      </Typography>
      <Card>
        <CardContent>
          <Typography align="center" color="textPrimary" gutterBottom>
            Wallet version 0.0.1 <br />
            Aptos SDK version 0.0.15
            <br />
            Copyrights 2022 by{" "}
            <Link href="https://github.com/xorgal" underline="none">
              {" "}
              xorgal
            </Link>
          </Typography>
        </CardContent>
        <CardActions>
          <Button variant="outlined" endIcon={<KeyIcon />} onClick={handleMnemonic}>
            Reveal Mnemonic
          </Button>
        </CardActions>
      </Card>
      <AlertDialog />
    </Container>
  );
};

export default About;
