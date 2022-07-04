import { useContext } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import useAxios from "../utils/useAxios";
import { NODE_URL } from "../context/AccountContext";

const SendDialog = () => {
  const { openSendDialog, setOpenSendDialog } = useContext(UIContext);
  const { recipientAddress, setRecipientAddress, amount, setAmount, handleSend } =
    useContext(AccountContext);
  const { result: chain_id } = useAxios(NODE_URL, "chain_id");

  const handleCancel = () => {
    setAmount("");
    setOpenSendDialog(false);
  };

  return (
    <Dialog open={openSendDialog} onClose={handleCancel}>
      <DialogTitle>Send Transaction</DialogTitle>
      <DialogContent>
        <Typography align="left" color="warning.main">
          Confirm destination network Aptos and recipient's address exist and registered on chain id{" "}
          {chain_id}. Resources sent to wrong or non-existing address will be lost.
        </Typography>
        {/* <DialogContentText sx={{ marginBottom: 2 }}>Provide recipient address and amount:</DialogContentText> */}
        <TextField
          sx={{ marginTop: 4, marginBottom: 2 }}
          id="recipientAddress"
          label="Recipient's Address"
          fullWidth={true}
          type="string"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          sx={{ width: 200 }}
          id="amount"
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSend}>Send</Button>
      </DialogActions>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default SendDialog;
