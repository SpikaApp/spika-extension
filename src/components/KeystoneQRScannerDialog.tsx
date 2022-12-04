import { AnimatedQRScanner, URType } from "@keystonehq/animated-qr";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useCallback, useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import debug from "../utils/debug";

const KeystoneQRScannerDialog = (): JSX.Element => {
  const {
    openKeystoneQRScannerDialog,
    setOpenKeystoneQRScannerDialog,
    keystoneScanResult,
    setKeystoneScanResult,
    handleKeystoneImportUI,
  } = useContext(UIContext);
  const { throwAlert } = useContext(AccountContext);
  const [scanError, setScanError] = useState<string>("");
  const [scanCompleted, setScanCompleted] = useState<boolean>(false);

  // Reset state when KystoneDialog is closed.
  useEffect(() => {
    if (openKeystoneQRScannerDialog === false) {
      resetState();
    }
  }, [openKeystoneQRScannerDialog === false]);

  // Set state upon receiving scan result handle errors.
  useEffect(() => {
    if (scanCompleted === true) {
      if (keystoneScanResult) {
        switch (keystoneScanResult.type) {
          case "crypto-multi-accounts":
            setOpenKeystoneQRScannerDialog(false);
            handleKeystoneImportUI();
            break;
        }
      }
    } else if (scanError) {
      throwAlert({ signal: 142, title: "QR Scanner Error", message: scanError, error: true });
      debug.log("QR scanner error:", scanError);
      setOpenKeystoneQRScannerDialog(false);
    }
  }, [scanCompleted === true]);

  // Handle successfull scan.
  const handleScan = useCallback((ur: { type: string; cbor: string }) => {
    setKeystoneScanResult(ur);
    setScanCompleted(true);
  }, []);

  // Handle error while scannning.
  const handleError = useCallback((error: string) => {
    setScanError(error);
    setScanCompleted(true);
  }, []);

  // Handle close Keystone Dialog.
  const handleCancel = (): void => {
    resetState();
    setOpenKeystoneQRScannerDialog(false);
  };

  // Reset state and prepare for next job.
  const resetState = (): void => {
    setKeystoneScanResult(undefined);
    setScanError("");
    setScanCompleted(false);
  };

  return (
    <Dialog open={openKeystoneQRScannerDialog} onClose={handleCancel}>
      <DialogTitle sx={{ alignSelf: "center", mb: "-12px" }}>Connect Keystone Wallet</DialogTitle>
      <DialogContent sx={{ minHeight: "250px", width: "300px", maxWidth: 375, mb: "-12px" }}>
        <Typography align="center" sx={{ mb: "15px" }}>
          Please scan the QR code
        </Typography>
        <AnimatedQRScanner
          urTypes={[URType.CRYPTO_MULTI_ACCOUNTS]}
          handleScan={handleScan}
          handleError={handleError}
          options={{
            width: 250,
            blur: true,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeystoneQRScannerDialog;
