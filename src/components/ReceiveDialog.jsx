import { useContext } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { QRCodeCanvas } from "qrcode.react";
import useAxios from "../utils/useAxios";
import { NODE_URL } from "../context/AccountContext";

const ReceiveDialog = () => {
  const { openReceiveDialog, setOpenReceiveDialog } = useContext(UIContext);
  const { currentAddress } = useContext(AccountContext);
  const { result: chain_id } = useAxios(NODE_URL, "chain_id");

  const handleClick = () => {
    navigator.clipboard.writeText(currentAddress);
  };

  const handleClose = () => {
    setOpenReceiveDialog(false);
  };

  return (
    <Dialog open={openReceiveDialog} onClose={handleClose}>
      <DialogTitle>
        <Stack sx={{ display: "flex", alignItems: "center" }}>Your Account Address</Stack>
      </DialogTitle>
      <DialogContent>
        {/* <DialogContentText sx={{ marginBottom: 2 }}>Provide recipient address and amount:</DialogContentText> */}
        <Stack direction="column" sx={{ display: "flex", alignItems: "center", maxWidth: 300 }}>
          <QRCodeCanvas value={currentAddress} includeMargin="true" />
          <TextField
            sx={{ width: 275, mt: 2, mb: 2 }}
            id="output-field"
            multiline
            maxRows={6}
            value={currentAddress}
          />
          <Button variant="outlined" onClick={handleClick}>
            Copy to clipboard
          </Button>
          <Typography align="center" sx={{ my: 2 }} color="warning.main">
            Network: Aptos Devnet
            <br />
            Chain id: {chain_id}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default ReceiveDialog;
