import { useContext } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Stack,
} from "@mui/material";
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
      <DialogTitle align="center">Confirm Logout</DialogTitle>
      <DialogContent sx={{ maxWidth: 320 }}>
        <DialogContentText align="center" sx={{ marginBottom: 2 }}>
          Remember to save secret recovery phrase before logout
          <br />
        </DialogContentText>
      </DialogContent>
      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          mt: 2,
          mb: 4,
        }}
      >
        <Button sx={{ mr: 4 }} variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleLogout}>
          Confirm
        </Button>
      </Stack>
    </Dialog>
  );
};

export default LogoutDialog;
