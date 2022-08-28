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
} from "@mui/material";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";

const ChangePasswordDialog = () => {
  const { openChangePasswordDialog, setOpenChangePasswordDialog } = useContext(UIContext);
  const {
    password,
    setPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    clearPasswords,
    handleChangePassword,
  } = useContext(AccountContext);

  const handleCancel = () => {
    setOpenChangePasswordDialog(false);
    clearPasswords();
  };

  return (
    <Dialog open={openChangePasswordDialog}>
      <DialogTitle>Change password</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ width: "275px" }}>
          Set a new account password. Please note, Spika wallet is not saving user passwords, thus
          unable to provide assistance in event of loss.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ display: "flex", flexDirection: "column" }}>
        <form className="login-form">
          <input hidden type="text" autoComplete="username" value={undefined}></input>
          <Stack>
            <TextField
              sx={{ marginBottom: 2, marginRight: 2, marginLeft: 2, width: 260 }}
              label="Old password"
              type="password"
              autoFocus={true}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              sx={{ marginBottom: 2, marginRight: 2, marginLeft: 2, width: 260 }}
              label="New password"
              type="password"
              autoFocus={false}
              autoComplete="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              sx={{ marginBottom: 2, marginRight: 2, marginLeft: 2, width: 260 }}
              label="Confirm password"
              type="password"
              autoFocus={false}
              autoComplete="current-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Stack>
        </form>

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
            onClick={handleChangePassword}
          >
            Change
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
