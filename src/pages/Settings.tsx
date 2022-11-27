import { Button, Card, CardContent, Container, Stack } from "@mui/material";
import { useContext } from "react";
import AccountDetailsDialog from "../components/AccountDetailsDialog";
import AccountManagerDialog from "../components/AccountManagerDialog";
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
    handleAccountManagerUI,
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
              <Button sx={{ mb: 2 }} variant="outlined" onClick={handleAccountManagerUI}>
                Account Manager
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
      <Footer />
      <AccountDetailsDialog />
      <ChangePasswordDialog />
      <NetworkDialog />
      <AccountManagerDialog />
    </Container>
  );
};

export default Settings;
