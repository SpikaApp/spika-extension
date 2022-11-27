/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, Dialog, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { renameAccount } from "../lib/spikaAccount";
import { setStore } from "../lib/store";
import { PLATFORM } from "../utils/constants";

interface RenameAccountDialogProps {
  accountName: string;
  accountIndex: number;
}

const RenameAccountDialog = (props: RenameAccountDialogProps): JSX.Element => {
  const { openRenameAccountDialog, setOpenRenameAccountDialog } = useContext(UIContext);
  const { setCurrentAddressName } = useContext(AccountContext);
  const [accountName, setAccountName] = useState<string>("");

  const handleCancel = (): void => {
    setAccountName("");
    setOpenRenameAccountDialog(false);
  };

  const handleRename = async (): Promise<void> => {
    await renameAccount(accountName, props.accountIndex);
    setCurrentAddressName(accountName);
    setStore(PLATFORM, "currentAddressName", accountName);
    setAccountName("");
    setOpenRenameAccountDialog(false);
  };

  return (
    <Dialog open={openRenameAccountDialog} onClose={handleCancel}>
      <DialogTitle sx={{ alignSelf: "center" }}>Rename Account</DialogTitle>
      <DialogContent sx={{ maxWidth: 375 }}>
        <Stack sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            sx={{ mb: "20px", width: "275px" }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { textAlign: "left" } }}
            fullWidth={true}
            placeholder={props.accountName}
            type="string"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
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
        {accountName === "" ? (
          <Button variant="contained" sx={{ width: "121px" }} disabled>
            Rename
          </Button>
        ) : (
          <Button
            sx={{
              background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
              width: "121px",
            }}
            variant="contained"
            onClick={handleRename}
          >
            Rename
          </Button>
        )}
      </Stack>
    </Dialog>
  );
};

export default RenameAccountDialog;
