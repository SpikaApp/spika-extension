/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { ISpikaAccount } from "../interface";
import { addSpikaAccount, getSpikaMasterAccount } from "../lib/spikaAccount";
import debug from "../utils/debug";
import shortenAddress from "../utils/shortenAddress";
import RenameAccountDialog from "./RenameAccountDialog";

const AccountManagerDialog = (): JSX.Element => {
  const { openAccountManagerDialog, setOpenAccountManagerDialog, handleRenameAccountUI, openRenameAccountDialog } =
    useContext(UIContext);
  const { switchAccount, setAccountImported } = useContext(AccountContext);
  const [accounts, setAccounts] = useState<ISpikaAccount[]>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [accountName, setAccountName] = useState<string>("");
  const [accountIndex, setAccountIndex] = useState<number>();

  const handleCancel = (): void => {
    setOpenAccountManagerDialog(false);
  };

  useEffect(() => {
    if (openAccountManagerDialog) {
      _getSpikaMasterAccount();
    }
  }, [openAccountManagerDialog]);

  useEffect(() => {
    if (accounts) {
      setLoaded(true);
      debug.log("Accounts:", accounts);
    }
  }, [accounts]);

  useEffect(() => {
    if (!openRenameAccountDialog) {
      _getSpikaMasterAccount();
    }
  }, [openRenameAccountDialog]);

  const _getSpikaMasterAccount = async (): Promise<void> => {
    const data = await getSpikaMasterAccount();
    setAccounts(data.master);
  };

  const handleRename = (_accountName: string, _index: number): void => {
    setAccountName(_accountName);
    setAccountIndex(_index);
    handleRenameAccountUI();
  };

  const handleSwitchAccount = async (index: number): Promise<void> => {
    setAccountImported(false);
    await switchAccount(index);
    setAccountImported(true);
    setOpenAccountManagerDialog(false);
  };

  const handleAddAccount = async (): Promise<void> => {
    await addSpikaAccount();
    await _getSpikaMasterAccount();
  };

  return (
    <Dialog open={openAccountManagerDialog}>
      <DialogTitle align="center">Account Manager</DialogTitle>
      <DialogContent sx={{ minHeight: "145px" }}>
        <Paper sx={{ width: "260px", bgcolor: "background.paper" }}>
          {loaded && (
            <List component="nav" sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "255px" }}>
              {accounts!.map((account: ISpikaAccount) => (
                <Stack key={`${account.index.toString()} ${accountName}`}>
                  <ListItemButton onClick={() => handleSwitchAccount(account.index)}>
                    <Tooltip title="Switch account">
                      <ListItem>
                        <ListItemText
                          sx={{ mt: "-10px", mb: "-10px" }}
                          primary={account.name}
                          primaryTypographyProps={{ fontSize: "16px" }}
                          secondary={`(${shortenAddress(account.data.account)})`}
                          secondaryTypographyProps={{ fontSize: "16px" }}
                        />
                      </ListItem>
                    </Tooltip>
                  </ListItemButton>
                  <IconButton
                    sx={{ display: "flex", position: "absolute", ml: "205px", mt: "10px" }}
                    onClick={() => handleRename(account.name, account.index)}
                  >
                    <Tooltip title="Rename account">
                      <DriveFileRenameOutlineIcon />
                    </Tooltip>
                  </IconButton>
                </Stack>
              ))}
            </List>
          )}
        </Paper>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: "18px", mb: "-12px" }}>
          <Button variant="outlined" sx={{ width: "165px" }} onClick={handleAddAccount}>
            Add Account
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
      <RenameAccountDialog accountName={accountName} accountIndex={accountIndex!} />
    </Dialog>
  );
};

export default AccountManagerDialog;
