/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import {
  Avatar,
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
import { IAccountType, IKeystoneAccount, ISpikaAccount } from "../interface";
import { addSpikaAccount, getKeystoneAccountsFromMasterAccount, getSpikaMasterAccount } from "../lib/spikaAccount";
import shortenAddress from "../utils/shortenAddress";
import ConnectWalletDialog from "./ConnectWalletDialog";
import KeystoneImportDialog from "./KeystoneImportDialog";
import KeystoneQRScannerDialog from "./KeystoneQRScannerDialog";
import RenameAccountDialog from "./RenameAccountDialog";

import keystone_dark from "../assets/keystone_dark.svg";
import keystone_light from "../assets/keystone_light.svg";

const AccountManagerDialog = (): JSX.Element => {
  const {
    openAccountManagerDialog,
    setOpenAccountManagerDialog,
    handleRenameAccountUI,
    openRenameAccountDialog,
    openKeystoneImportDialog,
    handleConnectWalletUI,
    darkMode,
  } = useContext(UIContext);
  const { switchAccount, setAccountImported } = useContext(AccountContext);
  const [accounts, setAccounts] = useState<ISpikaAccount[]>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [wallet, setWallet] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [accountIndex, setAccountIndex] = useState<number>();
  const [accountAddress, setAccountAddress] = useState<string>("");
  const [exAccounts, setExAccounts] = useState<IKeystoneAccount[] | undefined>();
  const [exAccountName, setExAccountName] = useState<string>("");
  const [exAccountIndex, setExAccountIndex] = useState<number>();
  const [exAccountAddress, setExAccountAddress] = useState<string>("");

  useEffect(() => {
    if (openAccountManagerDialog) {
      _getSpikaMasterAccount();
      _getExAccounts();
    }
  }, [openAccountManagerDialog]);

  useEffect(() => {
    if (accounts) {
      setLoaded(true);
    }
  }, [accounts]);

  useEffect(() => {
    if (!openRenameAccountDialog && openAccountManagerDialog) {
      _getSpikaMasterAccount();
      _getExAccounts();
    }
  }, [openRenameAccountDialog]);

  useEffect(() => {
    if (!openKeystoneImportDialog && openAccountManagerDialog) {
      _getSpikaMasterAccount();
      _getExAccounts();
    }
  }, [openKeystoneImportDialog]);

  // Gets ISpikaMasterAccount object from storage.
  const _getSpikaMasterAccount = async (): Promise<void> => {
    const data = await getSpikaMasterAccount();
    setAccounts(data.master);
  };

  const _getExAccounts = async (): Promise<void> => {
    const data = await getKeystoneAccountsFromMasterAccount();
    setExAccounts(data);
  };

  const getAccountName = (): string | undefined => {
    switch (wallet) {
      case "spika":
        return accountName;
      case "keystone":
        return exAccountName;
    }
  };

  const getAccountIndex = (): number | undefined => {
    switch (wallet) {
      case "spika":
        return accountIndex!;
      case "keystone":
        return exAccountIndex!;
    }
  };

  const getAccountAddress = (): string | undefined => {
    switch (wallet) {
      case "spika":
        return accountAddress!;
      case "keystone":
        return exAccountAddress!;
    }
  };

  // Assigns account's name to iSpikaAccount object.
  const handleRename = (_accountName: string, _index: number, _address: string): void => {
    setAccountName(_accountName);
    setAccountIndex(_index);
    setAccountAddress(_address);
    setWallet("spika");
    handleRenameAccountUI();
  };

  const handleRenameKeystoneAccount = (_accountName: string, _index: number, _address: string): void => {
    setExAccountName(_accountName);
    setExAccountIndex(_index);
    setExAccountAddress(_address);
    setWallet("keystone");
    handleRenameAccountUI();
  };

  // onClick loads selected account in state.
  const handleSwitchAccount = async (index: number, type?: IAccountType): Promise<void> => {
    setAccountImported(false);
    await switchAccount(index, type);
    setAccountImported(true);
    setOpenAccountManagerDialog(false);
  };

  // Adds new ISpikaAccount object to ISpikaMasterAccount.
  const handleAddAccount = async (): Promise<void> => {
    await addSpikaAccount();
    await _getSpikaMasterAccount();
  };

  // Opens Connect Hardware Wallet Dialog.
  const handleConnectHW = (): void => {
    handleConnectWalletUI();
  };

  const handleCancel = (): void => {
    setOpenAccountManagerDialog(false);
  };

  return (
    <Dialog open={openAccountManagerDialog}>
      <DialogTitle align="center">Account Manager</DialogTitle>
      <DialogContent sx={{ minHeight: "145px" }}>
        <Paper sx={{ width: "260px", bgcolor: "background.paper" }}>
          {loaded && (
            <List component="nav" sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "248px" }}>
              {accounts!.map((account: ISpikaAccount) => (
                <Stack key={`${account.index.toString()} ${accountName}`}>
                  <ListItemButton onClick={() => handleSwitchAccount(account.index)}>
                    <Tooltip title="Switch account">
                      <ListItem>
                        <ListItemText
                          sx={{ mt: "-10px", mb: "-10px", ml: "8px" }}
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
                    onClick={() => handleRename(account.name, account.index, account.data.account)}
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

        {exAccounts && exAccounts.length > 0 && (
          <Paper sx={{ mt: "10px" }}>
            <List component="nav" sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "255px" }}>
              {exAccounts!.map((account: IKeystoneAccount) => (
                <Stack key={`${account.index.toString()} ${account.name}`}>
                  <ListItemButton onClick={() => handleSwitchAccount(account.index, "hardware")}>
                    <Tooltip title="Switch account">
                      <ListItem>
                        <Avatar
                          sx={{ width: "25px", height: "25px", ml: "-20px", mr: "7px", mt: "0px" }}
                          src={account.device === "keystone" && darkMode ? keystone_dark : keystone_light}
                        />
                        <ListItemText
                          sx={{ mt: "-10px", mb: "-10px" }}
                          primary={account.name}
                          primaryTypographyProps={{ fontSize: "16px" }}
                          secondary={`(${shortenAddress(account.account)})`}
                          secondaryTypographyProps={{ fontSize: "16px" }}
                        />
                      </ListItem>
                    </Tooltip>
                  </ListItemButton>
                  <IconButton
                    sx={{ display: "flex", position: "absolute", ml: "205px", mt: "10px" }}
                    onClick={() => handleRenameKeystoneAccount(account.name, account.index, account.account)}
                  >
                    <Tooltip title="Rename account">
                      <DriveFileRenameOutlineIcon />
                    </Tooltip>
                  </IconButton>
                </Stack>
              ))}
            </List>
          </Paper>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mt: "18px",
            mb: "-12px",
          }}
        >
          <Button variant="outlined" sx={{ width: "165px", mb: "12px" }} onClick={handleAddAccount}>
            Add Account
          </Button>
          <Button variant="outlined" sx={{ width: "165px" }} onClick={handleConnectHW}>
            Connect HW
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
      <RenameAccountDialog
        accountAddress={getAccountAddress()!}
        accountName={getAccountName()!}
        accountIndex={getAccountIndex()!}
        wallet={wallet}
      />
      <ConnectWalletDialog />
      <KeystoneQRScannerDialog />
      <KeystoneImportDialog />
    </Dialog>
  );
};

export default AccountManagerDialog;
