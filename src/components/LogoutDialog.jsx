import { useContext } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";

const LogoutDialog = () => {
  const { openLogoutDialog, setOpenLogoutDialog } = useContext(UIContext);
  const { handleLogout } = useContext(AccountContext);

  const handleCancel = () => {
    setOpenLogoutDialog(false);
  };

  return (
    <Dialog open={openLogoutDialog}>
      <DialogTitle>Confirm Logout</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ marginBottom: 2 }}>
          Confirm your mnemonic phrase is saved before logout
          <br />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleLogout}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;
