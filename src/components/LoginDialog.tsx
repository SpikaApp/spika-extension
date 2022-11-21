import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useContext } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";

const LoginDialog = (): JSX.Element => {
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

  const handleCancel = (): void => {
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
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", mt: 2, mb: 2 }}>
            <Button sx={{ width: "115px" }} variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              sx={{
                background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                width: "115px",
                ml: 4,
              }}
              variant="contained"
              onClick={handleRevealMnemonic}
            >
              Unlock
            </Button>
          </Stack>
        )}
        {privateKeyRequired && (
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", mt: 2, mb: 2 }}>
            <Button sx={{ width: "115px" }} variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                marginLeft: 4,
                background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                width: "115px",
              }}
              onClick={handleRevealPrivateKey}
            >
              Unlock
            </Button>
          </Stack>
        )}
        {!mnemonicRequired && !privateKeyRequired && (
          <Button
            variant="contained"
            onClick={handleLogin}
            sx={{
              mb: 2,
              background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
              width: "115px",
            }}
          >
            Login
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;
