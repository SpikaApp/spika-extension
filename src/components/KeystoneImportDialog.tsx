/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
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
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { UIContext } from "../context/UIContext";
import { IKeystoneAccount, IUR } from "../interface";
import { getNotImportedKeystoneAccounts, importKeystoneAccount } from "../core/spikaAccount";
import shortenAddress from "../utils/shortenAddress";

import keystone_dark from "../assets/keystone_dark.svg";
import keystone_light from "../assets/keystone_light.svg";

const KeystoneImportDialog = (): JSX.Element => {
  const { openKeystoneImportDialog, setOpenKeystoneImportDialog, keystoneScanResult, setKeystoneScanResult, darkMode } =
    useContext(UIContext);
  const [keystoneKeyring, setKeystoneKeyring] = useState<IKeystoneAccount[] | undefined>(undefined);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (openKeystoneImportDialog && keystoneScanResult) {
      processUR(keystoneScanResult);
    }
  }, [openKeystoneImportDialog]);

  useEffect(() => {
    if (keystoneKeyring) {
      if (keystoneKeyring.length > 0) {
        setLoaded(true);
        console.log("loaded");
      } else {
        setLoaded(false);
        console.log("not loaded");
      }
    } else {
      setLoaded(false);
    }
  }, [keystoneKeyring]);

  const processUR = async (ur: IUR): Promise<void> => {
    const result = await getNotImportedKeystoneAccounts(ur);
    setKeystoneKeyring(result);
  };

  const handleAddAccount = async (account: IKeystoneAccount): Promise<void> => {
    await importKeystoneAccount(account);
    const result = await getNotImportedKeystoneAccounts(keystoneScanResult!);
    console.log(result);
    if (!result || result.length === 0) {
      handleCancel();
    }
    setKeystoneKeyring(result);
  };

  const handleCancel = (): void => {
    setOpenKeystoneImportDialog(false);
    setKeystoneScanResult(undefined);
    setLoaded(false);
  };

  return (
    <Dialog open={openKeystoneImportDialog} onClose={handleCancel}>
      <DialogTitle sx={{ alignSelf: "center", mb: "-12px" }}>Import Accounts</DialogTitle>
      <DialogContent sx={{ minHeight: "145px" }}>
        {loaded ? (
          <Paper sx={{ width: "260px", bgcolor: "background.paper" }}>
            <List component="nav" sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "255px" }}>
              {keystoneKeyring!.map((account: IKeystoneAccount) => (
                <Stack key={`${account.name}`}>
                  <ListItem>
                    <ListItemAvatar sx={{ mr: "-12px" }}>
                      <Avatar sx={{ width: "30px", height: "30px" }} src={darkMode ? keystone_dark : keystone_light} />
                    </ListItemAvatar>
                    <ListItemText
                      sx={{ mt: "-10px", mb: "-10px" }}
                      primary={account.name}
                      primaryTypographyProps={{ fontSize: "16px" }}
                      secondary={`(${shortenAddress(account.account)})`}
                      secondaryTypographyProps={{ fontSize: "16px" }}
                    />
                  </ListItem>
                  <IconButton
                    sx={{
                      display: "flex",
                      position: "absolute",
                      ml: "205px",
                      mt: "3px",
                    }}
                    onClick={() => handleAddAccount(account)}
                  >
                    <Tooltip title="Add account">
                      <AddCircleOutlineIcon />
                    </Tooltip>
                  </IconButton>
                </Stack>
              ))}
            </List>
          </Paper>
        ) : (
          <Typography variant="h6" align="center" sx={{ mt: "24px", width: "250px", maxWidth: "275px" }}>
            No accounts found
          </Typography>
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
        ></Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeystoneImportDialog;
