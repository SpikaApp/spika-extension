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
import { AccountContext } from "../context/AccountContext";

const MintDialog = () => {
  const { openMintDialog, setOpenMintDialog } = useContext(UIContext);
  const { amount, setAmount, handleMint } = useContext(AccountContext);

  const handleCancel = () => {
    setAmount("");
    setOpenMintDialog(false);
  };

  return (
    <Dialog align="center" open={openMintDialog} onClose={handleCancel}>
      <DialogTitle align="center">Mint Test Coins</DialogTitle>
      <DialogContent align="center">
        <Typography variant="overline" sx={{ width: 250 }} color="textSecondary" gutterBottom>
          Max amount 20000
          <br />
        </Typography>
        {/* <DialogContentText sx={{ marginBottom: 2 }}>Enter amount to mint:</DialogContentText> */}
        <TextField
          sx={{ marginTop: 3, width: 200 }}
          id="amount"
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            mt: 4,
          }}
        >
          <Button variant="outlined" sx={{ mr: 2 }} onClick={handleCancel}>
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
