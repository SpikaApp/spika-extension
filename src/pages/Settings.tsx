import { Button, Card, CardContent, Container, Stack } from "@mui/material";
import { useContext } from "react";
import AccountDetailsDialog from "../components/AccountDetailsDialog";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import Footer from "../components/Footer";
import NetworkDialog from "../components/NetworkDialog";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";

const Settings = (): JSX.Element => {
  const {
    handleMnemonicUI,
    handlePrivateKeyUI,
    handleChangePasswordUI,
    handleChangeNetworkUI,
    setOpenAccountDetailsDialog,
  } = useContext(UIContext);
  const { accountImported } = useContext(AccountContext);

  return (
    <Container maxWidth="xs">
      <Card sx={{ mb: 2, mt: "100px", minHeight: "450px" }}>
        <CardContent sx={{ alignSelf: "center", mt: 1 }}>
          {accountImported && (
            <Stack sx={{ width: "200px" }}>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={handleMnemonicUI}>
                Show Recovery Phrase
              </Button>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={handlePrivateKeyUI}>
                Show Private Key
              </Button>
              <Button
                sx={{ mb: 2 }}
                variant="outlined"
                onClick={() => {
                  setOpenAccountDetailsDialog(true);
                }}
              >
                Public Account Details
              </Button>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={handleChangePasswordUI}>
                Change Password
              </Button>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={handleChangeNetworkUI}>
                Change Network
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
      <Footer />
      <AccountDetailsDialog />
      <ChangePasswordDialog />
      <NetworkDialog />
    </Container>
  );
};

export default Settings;
