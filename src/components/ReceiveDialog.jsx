import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import { useContext } from "react";
import logo from "../assets/logo_bg.png";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import copyToClipboard from "../utils/copyToClipboard";
import AlertDialog from "./AlertDialog";
import Loading from "./Loading";

const ReceiveDialog = () => {
  const { openReceiveDialog, setOpenReceiveDialog } = useContext(UIContext);
  const { currentAddress, currentNetwork } = useContext(AccountContext);
  const { chainId } = useContext(Web3Context);

  const handleClick = () => {
    copyToClipboard(currentAddress);
  };

  const handleClose = () => {
    setOpenReceiveDialog(false);
  };

  return (
    <Dialog open={openReceiveDialog} onClose={handleClose}>
      <DialogTitle>
        <Stack sx={{ display: "flex", alignItems: "center" }}>Account Address</Stack>
      </DialogTitle>
      <DialogContent>
        {/* <DialogContentText sx={{ marginBottom: 2 }}>Provide recipient address and amount:</DialogContentText> */}
        <Stack direction="column" sx={{ display: "flex", alignItems: "center", maxWidth: 300 }}>
          <Paper
            sx={{
              width: "148px",
              height: "148px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
            }}
          >
            <QRCodeCanvas
              value={currentAddress}
              includeMargin={false}
              level="M"
              size={128}
              imageSettings={{ src: logo, excavate: true, height: 30, width: 30 }}
            />
          </Paper>
          <TextField sx={{ width: 275, mt: 2, mb: 2 }} id="output-field" multiline maxRows={6} value={currentAddress} />
          <Button variant="outlined" onClick={handleClick}>
            Copy to clipboard
          </Button>
          <Typography noWrap align="left" variant="body1" sx={{ ml: "75px", my: 3, width: "200px" }}>
            Network: {currentNetwork.name} <br />
            Chain id: {chainId}
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
