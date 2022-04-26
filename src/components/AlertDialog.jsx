import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";

const AlertDialog = () => {
  const { openAlertDialog, setOpenAlertDialog, setOpenMintDialog, setOpenSendDialog } = useContext(UIContext);
  const { alertSignal, setAlertSignal, alertTitle, alertMessage } = useContext(AccountContext);

  const navigate = useNavigate();

  const handleOpen = () => {
    alertSignal > 0 && setOpenAlertDialog(true);
  };

  const handleClose = () => {
    switch (alertSignal) {
      case 1: // Account created
      case 11: // Account imported
        setOpenAlertDialog(false);
        navigate("/");
        break;
      case 21: // Coins minted
        setOpenAlertDialog(false);
        setOpenMintDialog(false);
        navigate("/");
        break;
      case 31: // Transaction sent
        setOpenAlertDialog(false);
        setOpenSendDialog(false);
        break;
        setOpenAlertDialog(false);
        break;
      case 2: // Failed create account
      case 12: // Failed import account
      case 22: // Failed mint coins
      case 32: // Transaction failed
      case 41: // Account loaded from localStorage
      case 42: // Failed load account
        setOpenAlertDialog(false);
        break;
    }
    setAlertSignal(0);
  };

  useEffect(() => {
    handleOpen();
  }, [alertSignal]);

  return (
    <Dialog
      open={openAlertDialog}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{alertTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{alertMessage}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
