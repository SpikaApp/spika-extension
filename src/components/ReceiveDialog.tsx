/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import { useContext } from "react";
import logo from "../assets/logo_bg.png";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import copyToClipboard from "../utils/copyToClipboard";
import AlertDialog from "./AlertDialog";
import Loading from "./Loading";

const ReceiveDialog = (): JSX.Element => {
  const { openReceiveDialog, setOpenReceiveDialog } = useContext(UIContext);
  const { currentAddress } = useContext(AccountContext);

  const handleClick = () => {
    copyToClipboard(currentAddress!);
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
              value={currentAddress!}
              includeMargin={false}
              level="M"
              size={128}
              imageSettings={{ src: logo, excavate: true, height: 25, width: 25 }}
            />
          </Paper>
          <TextField sx={{ width: 275, mt: 2, mb: 2 }} id="output-field" multiline maxRows={6} value={currentAddress} />
          <Button variant="outlined" onClick={handleClick}>
            Copy to clipboard
          </Button>
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
