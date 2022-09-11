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
  Paper,
} from "@mui/material";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import { QRCodeCanvas } from "qrcode.react";
import copyToClipboard from "../utils/copy_clipboard";
import logo from "../assets/logo_bg.png";
import spika from "../assets/spika_color.svg";
import aptos from "../assets/aptos_light.png";

const ReceiveDialog = () => {
  const { openReceiveDialog, setOpenReceiveDialog } = useContext(UIContext);
  const { currentAddress } = useContext(AccountContext);
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
          <Typography align="center" variant="body1" sx={{ my: 3 }} color="warning.dark">
            Aptos Devnet chain id {chainId}
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
