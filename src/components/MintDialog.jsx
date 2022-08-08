import { useContext } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  DialogTitle,
  Stack,
} from "@mui/material";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";

const MintDialog = () => {
  const { openMintDialog, setOpenMintDialog } = useContext(UIContext);
  const { amount, setAmount, handleMint } = useContext(Web3Context);

  const handleCancel = () => {
    setAmount("");
    setOpenMintDialog(false);
  };

  return (
    <Dialog align="center" open={openMintDialog} onClose={handleCancel}>
      <DialogTitle align="center">Mint Test Coins</DialogTitle>
      <DialogContent align="center">
        <Typography variant="body1" sx={{ width: 250 }} color="warning.dark" gutterBottom>
          Max amount per request 20000
          <br />
        </Typography>
        {/* <DialogContentText sx={{ marginBottom: 2 }}>Enter amount to mint:</DialogContentText> */}
        <TextField
          sx={{ marginTop: 3, width: 250 }}
          id="amount"
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            mt: 4,
            mb: 2,
          }}
        >
          <Button variant="outlined" sx={{ mr: 4 }} onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleMint}>
            Mint
          </Button>
        </Stack>
      </DialogContent>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default MintDialog;
