/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, Dialog, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useContext, useEffect } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";

const ResetWalletDialog = (): JSX.Element => {
  const { openResetWalletDialog, setOpenResetWalletDialog, setOpenLoginDialog } = useContext(UIContext);
  const {
    alertSignal,
    mnemonic,
    setMnemonic,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleImport,
  } = useContext(AccountContext);

  useEffect(() => {
    if (openResetWalletDialog) {
      setPassword("");
      setConfirmPassword("");
    }
  }, [openResetWalletDialog]);

  useEffect(() => {
    // 31: Account successfully imported
    if (alertSignal === 11) {
      setOpenResetWalletDialog(false);
      setOpenLoginDialog(false);
    }
  }, [alertSignal]);

  const handleCancel = (): void => {
    setMnemonic("");
    setPassword("");
    setConfirmPassword("");
    setOpenResetWalletDialog(false);
  };

  const handleReset = async (): Promise<void> => {
    await handleImport();
  };

  return (
    <Dialog open={openResetWalletDialog} onClose={handleCancel}>
      <DialogTitle sx={{ alignSelf: "center" }}>Reset Wallet</DialogTitle>
      <DialogContent sx={{ maxWidth: 375 }}>
        <Stack sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            sx={{ mb: "30px", width: "275px" }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { textAlign: "left" } }}
            fullWidth={true}
            multiline={true}
            rows={3}
            autoComplete="off"
            autoFocus={true}
            type="string"
            placeholder="Recovery phrase"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
          />
          <TextField
            sx={{ mb: "20px", width: "275px" }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { textAlign: "left" } }}
            fullWidth={true}
            autoComplete="off"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            sx={{ width: "275px" }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { textAlign: "left" } }}
            fullWidth={true}
            autoComplete="off"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          onClick={handleReset}
        >
          Reset
        </Button>
      </Stack>
    </Dialog>
  );
};

export default ResetWalletDialog;
