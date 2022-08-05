import { useContext } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Stack,
} from "@mui/material";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import useAxios from "../utils/useAxios";
import { NODE_URL } from "../utils/constants";

const SendDialog = () => {
  const { openSendDialog, setOpenSendDialog } = useContext(UIContext);
  const { recipientAddress, setRecipientAddress, amount, setAmount, handleEstimate } =
    useContext(AccountContext);
  const { result: chain_id } = useAxios(NODE_URL, "chain_id");

  const handleCancel = () => {
    setAmount("");
    setOpenSendDialog(false);
  };

  return (
    <Dialog align="center" open={openSendDialog} onClose={handleCancel}>
      <DialogTitle>Send Transaction</DialogTitle>
      <DialogContent sx={{ maxWidth: 375 }}>
        <Typography color="warning.main">
          Transaction will be submitted on chain id {chain_id}
        </Typography>
        <TextField
          sx={{ mt: 4, mb: 4 }}
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
      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          mt: 2,
          mb: 2,
        }}
      >
        <Button variant="outlined" sx={{ mr: 4 }} onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleEstimate}>
          Send
        </Button>
      </Stack>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default SendDialog;
