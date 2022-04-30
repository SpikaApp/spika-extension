import { useContext } from "react";
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
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
    <Dialog open={openMintDialog} onClose={handleCancel}>
      <DialogTitle>Mint TestCoin</DialogTitle>
      <DialogContent>
        {/* <DialogContentText sx={{ marginBottom: 2 }}>Enter amount to mint:</DialogContentText> */}
        <TextField
          sx={{ marginTop: 2, width: 200 }}
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
        <Button onClick={handleMint}>Mint</Button>
      </DialogActions>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default MintDialog;
