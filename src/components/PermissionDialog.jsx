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
  Tooltip,
  Grid,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import InfoIcon from "@mui/icons-material/Info";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import { PLATFORM } from "../utils/constants";
import { setMem, getMem, setStore, getStore } from "../lib/store";
import { getConnectedApps, getApp, setApp, removeApp } from "../lib/apps";
import shortenAddress from "../utils/shorten_address";
import copyToClipboard from "../utils/copy_clipboard";

const PermissionDialog = () => {
  const [request, setRequest] = useState({});
  const [method, setMethod] = useState("default");
  const [requestSender, setRequestSender] = useState();
  const { spikaWallet, openPermissionDialog, setOpenPermissionDialog } = useContext(UIContext);
  const { accountImported, currentAddress, account, publicAccount } = useContext(AccountContext);
  const { externalSignTransaction, externalSignAndSubmitTransaction } = useContext(Web3Context);
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
    if (request.method === "signTransaction" || request.method === "signAndSubmitTransaction") {
      if (request.args === undefined) {
        handleCancel();
      }
      if (
        request.args.arguments[0] === undefined ||
        request.args.arguments[1] === undefined ||
        request.args.function === undefined ||
        request.args.type_arguments[0] === undefined
      ) {
        handleCancel();
      }
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
      const result = await externalSignTransaction(request.args);
      response = result;
    }
    if (method === "signAndSubmitTransaction") {
      const result = await externalSignAndSubmitTransaction(request.args);
      response = result;
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

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "start",
    color: theme.palette.text.secondary,
  }));

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
                    <Button
                      variant="outlined"
                      sx={{ width: "121px", mr: 4 }}
                      onClick={handleCancel}
                    >
                      Reject
                    </Button>
                    <Button
                      sx={{
                        background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                        width: "121px",
                      }}
                      variant="contained"
                      onClick={handleApprove}
                    >
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
                      Confirm transaction:
                    </Typography>
                    <Typography sx={{ mt: 4 }} variant="body1">
                      To: {shortenAddress(request.args.arguments[0])}
                      <br />
                      Amount: {request.args.arguments[1]}
                      <br />
                      Function: {request.args.function}
                      <br />
                      Type: {request.args.type_arguments[0]}
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
                    <Button
                      variant="outlined"
                      sx={{ width: "121px", mr: 4 }}
                      onClick={handleCancel}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                        width: "154px",
                      }}
                      onClick={handleApprove}
                    >
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
                    <Typography variant="body1">Approval required</Typography>
                    {/* <Grid container spacing={1}> */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Item>
                        <Typography variant="subtitle1" sx={{ mt: 1, ml: 1 }}>
                          To:{" "}
                          <Tooltip title={request.args.arguments[0]}>
                            <Chip
                              sx={{ mt: "-4px" }}
                              label={shortenAddress(request.args.arguments[0])}
                              onClick={() => copyToClipboard(request.args.arguments[0])}
                            />
                          </Tooltip>
                          <br />
                          Amount: {request.args.arguments[1]}
                          <br />
                          Function: {request.args.function} <br />
                          Type: {request.args.type_arguments[0]}
                        </Typography>
                      </Item>
                    </Grid>
                    {/* </Grid> */}
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
                    <Button
                      variant="outlined"
                      sx={{ width: "121px", mr: 4 }}
                      onClick={handleCancel}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                        width: "121px",
                      }}
                      onClick={handleApprove}
                    >
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
