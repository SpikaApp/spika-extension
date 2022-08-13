import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { PLATFORM } from "../utils/constants";
import { client } from "../utils/client";
import { setMem, getMem, setStore, getStore } from "../utils/store";
import { getConnectedApps, getApp, setApp, removeApp } from "../utils/apps";

const PermissionDialog = () => {
  const [request, setRequest] = useState({});
  const [method, setMethod] = useState("default");
  const [requestSender, setRequestSender] = useState();
  const { spikaWallet, openPermissionDialog, setOpenPermissionDialog } = useContext(UIContext);
  const { accountImported, currentAddress, account, publicAccount } = useContext(AccountContext);
  const _currentRoute = "currentRoute";
  const _request = "currentRequest";
  const _sender = "currentSender";

  let response;

  useEffect(() => {
    if (openPermissionDialog) {
      getRequest();
    }
  }, [openPermissionDialog]);

  useEffect(() => {
    if (request) {
      getSender();
    }
  }, [request]);

  const getRequest = async () => {
    const data = await getMem(PLATFORM, _request);
    setRequest(data);
    if (data !== undefined || data !== null) {
      setMethod(data.method);
    }
  };

  const getSender = async () => {
    const data = await getMem(PLATFORM, _sender);
    setRequestSender(data);
  };

  const sendResponse = async () => {
    await chrome.runtime.sendMessage({
      responseMethod: request.method,
      id: request.id,
      response: response,
    });
  };

  const handleApprove = async () => {
    if (method === "connect") {
      const data = await getApp(currentAddress, requestSender.origin);
      if (!data) {
        const set = await setApp(currentAddress, requestSender.origin);
        if (set) {
          response = publicAccount;
        } else {
          // if something went wrong with saving app return false
          response = false;
        }
      } else {
        response = publicAccount;
      }
    }
    if (method === "account") {
      response = publicAccount;
    }
    if (method === "signTransaction") {
      const txnRequest = request.args;
      try {
        const signedTxn = await client.signTransaction(account, txnRequest);
        response = signedTxn;
      } catch (error) {
        console.log(error);
        response = false;
      }
    }
    if (method === "signAndSubmitTransaction") {
      const txnRequest = request.args;
      try {
        const signedTxn = await client.signTransaction(account, txnRequest);
        const submittedTxn = await client.submitTransaction(signedTxn);
        response = submittedTxn;
      } catch (error) {
        console.log(error);
        response = false;
      }
    }
    sendResponse(response);
    clearDialog();
    window.close();
  };

  const handleCancel = () => {
    response = false;
    sendResponse(response);
    clearDialog();
    window.close();
  };

  const clearDialog = () => {
    setOpenPermissionDialog(false);
    setDefaultRoute();
  };

  const setDefaultRoute = () => {
    setMem(PLATFORM, _currentRoute, "/");
  };

  return (
    <Box>
      {spikaWallet ? (
        <div>
          {accountImported && (
            <div>
              {(method === "connect" || method === "account") && (
                <Dialog fullScreen align="center" open={openPermissionDialog}>
                  <DialogTitle> {requestSender.origin}</DialogTitle>
                  <DialogContent sx={{ maxWidth: 375 }}>
                    <Box
                      component="img"
                      sx={{
                        height: 48,
                        width: 48,
                      }}
                      alt="favicon"
                      src={requestSender.tab.favIconUrl}
                    />
                    <Typography sx={{ mt: 2, mb: 4 }} variant="h5">
                      {requestSender.tab.title}
                    </Typography>
                    <Typography variant="body1" color="warning.dark">
                      Website is requesting access to the following account information:
                    </Typography>
                    <Box sx={{ width: "100%", maxWidth: 320, mt: 4 }}>
                      <List>
                        <ListItem disablePadding>
                          <ListItemIcon sx={{ ml: 2 }}>
                            <InfoIcon />
                          </ListItemIcon>
                          <ListItemText primary="View account address" />
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemIcon sx={{ ml: 2 }}>
                            <InfoIcon />
                          </ListItemIcon>
                          <ListItemText primary="View account public key" />
                        </ListItem>
                      </List>
                    </Box>
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
                    <Button variant="outlined" sx={{ mr: 4 }} onClick={handleCancel}>
                      Reject
                    </Button>
                    <Button variant="contained" onClick={handleApprove}>
                      Approve{" "}
                    </Button>
                  </Stack>
                  <Loading />
                  <AlertDialog />
                </Dialog>
              )}
              {method === "signTransaction" && (
                <Dialog fullScreen align="center" open={openPermissionDialog}>
                  <DialogTitle> {requestSender.origin}</DialogTitle>
                  <DialogContent sx={{ maxWidth: 375 }}>
                    <Box
                      component="img"
                      sx={{
                        height: 48,
                        width: 48,
                      }}
                      alt="favicon"
                      src={requestSender.tab.favIconUrl}
                    />
                    <Typography sx={{ mt: 2, mb: 4 }} variant="h5">
                      {requestSender.tab.title}
                    </Typography>
                    <Typography variant="body1" color="warning.dark">
                      Website is requesting the following method:
                    </Typography>
                    <Typography sx={{ mt: 4 }} variant="h5">
                      {method}
                    </Typography>
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
                    <Button variant="outlined" sx={{ mr: 4 }} onClick={handleCancel}>
                      Reject
                    </Button>
                    <Button variant="contained" onClick={handleApprove}>
                      Approve{" "}
                    </Button>
                  </Stack>
                  <Loading />
                  <AlertDialog />
                </Dialog>
              )}
              {method === "signAndSubmitTransaction" && (
                <Dialog fullScreen align="center" open={openPermissionDialog}>
                  <DialogTitle> {requestSender.origin}</DialogTitle>
                  <DialogContent sx={{ maxWidth: 375 }}>
                    <Box
                      component="img"
                      sx={{
                        height: 48,
                        width: 48,
                      }}
                      alt="favicon"
                      src={requestSender.tab.favIconUrl}
                    />
                    <Typography sx={{ mt: 2, mb: 4 }} variant="h5">
                      {requestSender.tab.title}
                    </Typography>
                    <Typography variant="body1" color="warning.dark">
                      Website is requesting the following method:
                    </Typography>
                    <Typography sx={{ mt: 4 }} variant="h5">
                      {method}
                    </Typography>
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
                    <Button variant="outlined" sx={{ mr: 4 }} onClick={handleCancel}>
                      Reject
                    </Button>
                    <Button variant="contained" onClick={handleApprove}>
                      Approve{" "}
                    </Button>
                  </Stack>
                  <Loading />
                  <AlertDialog />
                </Dialog>
              )}
            </div>
          )}
        </div>
      ) : (
        <Dialog fullScreen align="center" open={openPermissionDialog}>
          <DialogTitle>Account not found</DialogTitle>
          <DialogContent sx={{ maxWidth: 375 }}>
            <Typography sx={{ mt: 4 }} variant="body1" color="warning.dark">
              Spika wallet is not initialized. <br />
              Create or import account before accessing websites.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
      <Loading />
      <AlertDialog />
    </Box>
  );
};

export default PermissionDialog;
