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

const SendDialog = () => {
  const { openSendDialog, setOpenSendDialog } = useContext(UIContext);
  const { currentAsset } = useContext(AccountContext);
  const {
    chainId,
    recipientAddress,
    setRecipientAddress,
    amount,
    setAmount,
    maxGasAmount,
    setMaxGasAmount,
    handleEstimate,
  } = useContext(Web3Context);

  const handleCancel = () => {
    setRecipientAddress("");
    setAmount("");
    setOpenSendDialog(false);
  };

  return (
    <Dialog align="center" open={openSendDialog} onClose={handleCancel}>
      <DialogTitle>Send {currentAsset.data.symbol}</DialogTitle>
      <DialogContent sx={{ maxWidth: 375 }}>
        <Typography variant="body1" color="warning.dark">
          Transaction will be submitted on chain id {chainId}
        </Typography>
        <Stack sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            sx={{ mt: 4, mb: 4 }}
            id="recipientAddress"
            label="Address"
            InputLabelProps={{ shrink: true }}
            multiline={true}
            rows={3}
            fullWidth={true}
            placeholder="0x..."
            type="string"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
          <TextField
            sx={{ mb: 4, width: "200px" }}
            id="amount"
            label="Amount"
            InputLabelProps={{ shrink: true }}
            fullWidth={true}
            placeholder={`Amount in ${currentAsset.data.symbol}`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <TextField
            sx={{ width: "200px" }}
            id="maxGasAmount"
            label="Max Gas Amount"
            InputLabelProps={{ shrink: true }}
            fullWidth={false}
            type="number"
            value={maxGasAmount}
            onChange={(e) => setMaxGasAmount(e.target.value.toString())}
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
        <Button sx={{ width: "121px", mr: 4 }} variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          sx={{
            background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
            width: "121px",
          }}
          variant="contained"
          onClick={handleEstimate}
        >
          Estimate
        </Button>
      </Stack>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default SendDialog;
