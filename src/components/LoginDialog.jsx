import { useContext } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";

const LoginDialog = () => {
  const { password, setPassword, handleLogin, handleRevealMnemonic, handleRevealPrivateKey } =
    useContext(AccountContext);
  const {
    openLoginDialog,
    setOpenLoginDialog,
    mnemonicRequired,
    setMnemonicRequired,
    privateKeyRequired,
    setPrivateKeyRequired,
  } = useContext(UIContext);

  const handleCancel = () => {
    setOpenLoginDialog(false);
    setMnemonicRequired(false);
    setPrivateKeyRequired(false);
    setPassword("");
  };
  return (
    <Dialog open={openLoginDialog}>
      {mnemonicRequired || privateKeyRequired ? (
        <DialogTitle>Unlock required</DialogTitle>
      ) : (
        <DialogTitle>Login</DialogTitle>
      )}
      <DialogContent>
        <DialogContentText>Enter password to continue</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ display: "flex", flexDirection: "column" }}>
        <form className="login-form">
          <input hidden type="text" autoComplete="username" value={undefined}></input>
          <TextField
            sx={{ marginBottom: 2, marginRight: 2, marginLeft: 2, width: 260 }}
            id="login-prompt"
            label="Password"
            type="password"
            autoFocus={true}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </form>
        {mnemonicRequired && (
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", mb: 2 }}>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" sx={{ marginLeft: 4 }} onClick={handleRevealMnemonic}>
              Unlock
            </Button>
          </Stack>
        )}
        {privateKeyRequired && (
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", mb: 2 }}>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" sx={{ marginLeft: 4 }} onClick={handleRevealPrivateKey}>
              Unlock
            </Button>
          </Stack>
        )}
        {!mnemonicRequired && !privateKeyRequired && (
          <Button variant="contained" onClick={handleLogin} sx={{ mb: 2 }}>
            Login
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;
