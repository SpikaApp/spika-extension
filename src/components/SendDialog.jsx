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
import { Web3Context } from "../context/Web3Context";
import useAxios from "../utils/use_axios";
import { NODE_URL } from "../utils/constants";

const SendDialog = () => {
  const { openSendDialog, setOpenSendDialog } = useContext(UIContext);
  const { currentAsset } = useContext(AccountContext);
  const { recipientAddress, setRecipientAddress, amount, setAmount, handleEstimate } =
    useContext(Web3Context);
  const { result: chain_id } = useAxios(NODE_URL, "chain_id");

  const handleCancel = () => {
    setRecipientAddress("");
    setAmount("");
    setOpenSendDialog(false);
  };

  return (
    <Dialog align="center" open={openSendDialog} onClose={handleCancel}>
      <DialogTitle>Send {currentAsset[0].name}</DialogTitle>
      <DialogContent sx={{ maxWidth: 375 }}>
        <Typography variant="body1" color="warning.dark">
          Transaction will be submitted on chain id {chain_id}
        </Typography>
        <Stack>
          <TextField
            sx={{ mt: 4, mb: 4 }}
            id="recipientAddress"
            label="Address"
            fullWidth={true}
            type="string"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
          <TextField
            id="amount"
            label="Amount"
            fullWidth={true}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Stack>
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
        <Button variant="outlined" sx={{ mr: 4 }} onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleEstimate}>
          Estimate
        </Button>
      </Stack>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default SendDialog;
