import { useContext } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Stack,
  Typography,
} from "@mui/material";
import ReportIcon from "@mui/icons-material/Report";
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
      <DialogTitle>
        <Stack sx={{ display: "flex", flexDirection: "row" }}>
          <ReportIcon sx={{ color: "warning.main", mt: "4px", mr: 1 }} />
          <Typography variant="h6" sx={{ color: "warning.main" }}>
            Confirm action
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ maxWidth: 320 }}>
        <DialogContentText sx={{ display: "flex", flexDirection: "row", mb: 2 }}>
          This will delete all stored data from Spika. Remember to export recovery phrase and any
          imported keys before proceeding.
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
        <Button sx={{ width: "121px", mr: 4 }} variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          sx={{
            background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
            width: "121px",
          }}
          variant="contained"
          onClick={handleLogout}
        >
          Exit
        </Button>
      </Stack>
    </Dialog>
  );
};

export default LogoutDialog;
