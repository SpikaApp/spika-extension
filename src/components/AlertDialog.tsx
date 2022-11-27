import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Link as RouterLink, NavigateFunction, useNavigate } from "react-router-dom";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { aptosCoin } from "../lib/coin";
import copyToClipboard from "../utils/copyToClipboard";
import debug from "../utils/debug";

const AlertDialog = () => {
  const [isTransaction, setIsTransaction] = useState<boolean>(false);
  const {
    openAlertDialog,
    setOpenAlertDialog,
    setOpenMintDialog,
    setOpenSendDialog,
    setOpenConfirmSendDialog,
    setOpenCreateCollectionDialog,
    setOpenCreateNftDialog,
    setOpenChangePasswordDialog,
    setOpenAddAssetDialog,
    setOpenNetworkDialog,
    setIsPopup,
    isError,
  } = useContext(UIContext);
  const {
    setAccountImported,
    alertSignal,
    alertTitle,
    alertMessage,
    clearAlert,
    setCurrentAsset,
    handleLogout,
    setMnemonic,
    setNewMnemonic,
  } = useContext(AccountContext);

  useEffect(() => {
    if (alertSignal === 31 || alertSignal === 61) {
      setIsTransaction(true);
      debug.log(`alertSignal: ${alertSignal}`);
    }
    handleOpen();
  }, [alertSignal]);

  useEffect(() => {
    if (!openAlertDialog) {
      setIsTransaction(false);
    }
  }, [openAlertDialog]);

  const navigate: NavigateFunction = useNavigate();

  const handleOpen = () => {
    // if transaction estimated as valid => handle TransactionDialog
    // instead of sending alert, else => proceed with alert
    if (alertSignal !== 30) {
      alertSignal > 0 && setOpenAlertDialog(true);
    }
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
      case 33: // Transaction estimated as invalid
      case 34: // Failed estimate transaction
        setOpenAlertDialog(false);
        setOpenSendDialog(false);
        setOpenConfirmSendDialog(false);
        setIsTransaction(false);
        setIsPopup(false);
        break;
      case 56: // Password successfully changed
        setOpenAlertDialog(false);
        setOpenChangePasswordDialog(false);
        break;
      case 61: // Collection Created
        setOpenAlertDialog(false);
        setOpenCreateCollectionDialog(false);
        setIsTransaction(false);
        break;
      case 71: // NFT Created
        setOpenAlertDialog(false);
        setOpenCreateNftDialog(false);
        setIsTransaction(false);
        break;
      case 81: // Private key required
        setOpenAlertDialog(false);
        break;
      case 91: // Mnemonic required
        setOpenAlertDialog(false);
        break;
      case 101: // New asset successfully added
        setOpenAlertDialog(false);
        setOpenAddAssetDialog(false);
        break;
      case 121: // Network changed successfully
        setOpenAlertDialog(false);
        setOpenNetworkDialog(false);
        setAccountImported(true);
        setCurrentAsset(aptosCoin);
        break;
      case 2: // Failed create account
      case 3: // Invalid mnemonic
      case 12: // Failed import account
        setAccountImported(false);
        setMnemonic("");
        setNewMnemonic("");
        setOpenAlertDialog(false);
        break;
      case 41: // Account loaded from localStorage
      case 42: // Failed to load account
      case 43: // Failed to switch account
        setAccountImported(false);
        // This will cause extension to throw 404 and needs to be fixed.
        navigate(0);
        break;
      case 22: // Failed mint coins
      case 32: // Transaction failed
      case 52: // Password field cannot be empty
      case 53: // Passwords do not match
      case 54: // Password must at least 6 characters long
      case 55: // Failed load account
      case 57: // Incorrect current password
      case 58: // New password shall not be the same
      case 62: // Failed create collection
      case 63: // Failed estimate collection
      case 72: // Failed create nft
      case 73: // Failed estimate nft
      case 92: // No mnemonic phrase found
      case 102: // New custom asset successfully added
      case 103: // Failed to add new asset
      case 104: // Error, Select asset from the list or add custom token to continue.
      case 112: // Failed to find asset on chain
      case 122: // Network registration failed
      case 132: // Invalid address field
      case 133: // Ivalid amount field
      case 134: // Not enough balance to execute transaction
        setOpenAlertDialog(false);
        setIsPopup(false);
        break;
      case 93: // Unencrypted data is not supported in this version. Please login again to start using encryption
        setOpenAlertDialog(false);
        setIsPopup(false);
        handleLogout();
        break;
    }
    clearAlert();
  };

  const handleClick = () => {
    copyToClipboard(alertMessage);
  };

  return (
    <Dialog open={openAlertDialog} onClose={handleClose}>
      {alertSignal === 81 || alertSignal === 91 ? (
        <DialogTitle align="center">{alertTitle}</DialogTitle>
      ) : (
        <DialogTitle>
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "start", mr: 2 }}>
            {isError && <ErrorIcon sx={{ mt: "4px", mr: "6px", color: "error.main" }} />}
            {isError === false && <CheckCircleIcon sx={{ mt: "4px", mr: "6px", color: "success.main" }} />}
            <Typography variant="h6" sx={{ color: isError ? "error.main" : "success.main" }}>
              {alertTitle}
            </Typography>
          </Stack>
        </DialogTitle>
      )}
      <DialogContent sx={{ minWidth: 250, maxWidth: 375 }}>
        {isTransaction && (
          <Stack component="span" sx={{ maxWidth: 250 }}>
            <Typography component="span">
              Open transactions
              <Link
                sx={{ ml: 0.5 }}
                component={RouterLink}
                to="/transactions"
                underline="none"
                color="link"
                onClick={handleClose}
              >
                log
              </Link>{" "}
              or view full details in{" "}
              <Link
                href={`https://explorer.devnet.aptos.dev/txn/${alertMessage}`}
                target="_blank"
                underline="none"
                color="link"
                onClick={handleClose}
              >
                Aptos Explorer {""}
                <OpenInNewIcon sx={{ fontSize: 16 }} />
              </Link>
            </Typography>
          </Stack>
        )}
        {alertSignal === 81 || alertSignal === 91 ? (
          <Stack sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <TextField
              sx={{ width: 250, marginBottom: 2 }}
              multiline
              maxRows={6}
              variant="outlined"
              value={alertMessage}
            />
            <Stack component="span" sx={{ maxWidth: 250 }}>
              <Typography component="span" align="center" sx={{ mb: 2 }} color="warning.dark">
                Never share your secret phrase or private key with anyone.
                <br />
                Use with caution.
              </Typography>
            </Stack>
            <Button variant="outlined" onClick={handleClick}>
              Copy to clipboard
            </Button>
          </Stack>
        ) : (
          !isTransaction && (
            <Stack sx={{ overflow: "hidden", textOverflow: "ellipsis", wordWrap: "break-word" }}>
              <Typography variant="body2">{alertMessage}</Typography>
            </Stack>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
