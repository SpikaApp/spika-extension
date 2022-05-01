import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";

const AlertDialog = () => {
  const { openAlertDialog, setOpenAlertDialog, setOpenMintDialog, setOpenSendDialog } = useContext(UIContext);
  const {
    alertSignal,
    setAlertSignal,
    alertTitle,
    setAlertTitle,
    alertMessage,
    setAlertMessage,
    setMnemonic,
    handleLogout,
  } = useContext(AccountContext);

  const navigate = useNavigate();

  const handleClick = () => {
    navigator.clipboard.writeText(alertMessage);
  };

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
      case 91:
        setOpenAlertDialog(false);
        setAlertSignal(0);
        setAlertTitle("");
        setAlertMessage("");
        setMnemonic("");
        break;
      case 2: // Failed create account
      case 12: // Failed import account
      case 22: // Failed mint coins
      case 32: // Transaction failed
      case 41: // Account loaded from localStorage
      case 42: // Failed load account
      case 52: // Password field cannot be empty
      case 53: // Passwords do not match
      case 54: // Password must at least 6 characters long
      case 55: // Failed load account
      case 92: // No mnemonic phrase found
        setOpenAlertDialog(false);
        break;
      case 93: // Unencrypted data is not supported in this version. Please login again to start using encryption
        setOpenAlertDialog(false);
        handleLogout();
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
      {alertSignal === 91 ? (
        <DialogTitle id="alert-dialog-title">
          {alertTitle}
          <Tooltip title="Copy to clipboard">
            <IconButton aria-label="copyToClipboard" onClick={handleClick}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </DialogTitle>
      ) : (
        <DialogTitle id="alert-dialog-title">{alertTitle}</DialogTitle>
      )}
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
