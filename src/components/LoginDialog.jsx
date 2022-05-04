import { useContext } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  TextField,
} from "@mui/material";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";

const LoginDialog = () => {
  const { password, setPassword, handleLogin, handleRevealMnemonic } = useContext(AccountContext);
  const { openLoginDialog, mnemonicRequired } = useContext(UIContext);

  return (
    <Dialog open={openLoginDialog}>
      <DialogTitle>Unlock required</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter password to continue</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ display: "flex", flexDirection: "column" }}>
        <form className="login-form">
          <input hidden type="text" autoComplete="username" value={undefined}></input>
          <TextField
            sx={{ marginBottom: 4, marginRight: 2, marginLeft: 2 }}
            id="password"
            label="Password"
            type="password"
            autoFocus={true}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </form>
        {mnemonicRequired ? (
          <Button onClick={handleRevealMnemonic}>Unlock</Button>
        ) : (
          <Button onClick={handleLogin}>Unlock</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;
