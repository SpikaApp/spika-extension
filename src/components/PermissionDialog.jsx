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
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import InfoIcon from "@mui/icons-material/Info";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import { PLATFORM } from "../utils/constants";
import { setMem, getMem } from "../lib/store";
import { getApp, setApp } from "../lib/apps";
import shortenAddress from "../utils/shorten_address";
import logo from "../assets/spika_logo_200.png";
import spika from "../assets/spika_color.svg";

const PermissionDialog = () => {
  const [request, setRequest] = useState({});
  const [method, setMethod] = useState("default");
  const [requestSender, setRequestSender] = useState();
  const { spikaWallet, openPermissionDialog, setOpenPermissionDialog, isPopup, setIsPopup } =
    useContext(UIContext);
  const { isLoading, setIsLoading, alertSignal, accountImported, currentAddress, publicAccount } =
    useContext(AccountContext);
  const {
    isValidTransaction,
    estimatedTxnResult,
    estimateTransaction,
    signMessage,
    signTransaction,
    signAndSubmitTransaction,
  } = useContext(Web3Context);
  const _currentRoute = "currentRoute";
  const _request = "currentRequest";
  const _sender = "currentSender";

  let response;

  useEffect(() => {
    if (openPermissionDialog) {
      setIsPopup(true);
      getRequest();
    }
  }, [openPermissionDialog]);

  useEffect(() => {
    if (request) {
      getSender();
    }
  }, [request]);

  useEffect(() => {
    if (accountImported) {
      if (request.method === "signTransaction" || request.method === "signAndSubmitTransaction") {
        estimate();
      }
    }
  }, [accountImported]);

  useEffect(() => {
    if (isPopup) {
      if (alertSignal === 33 || alertSignal === 34) {
        response = false;
        sendResponse();
      }
    }
  }, [alertSignal]);

  useEffect(() => {
    if (method !== "default" && !isPopup) {
      clearDialog();
      window.close();
    }
  }, [isPopup]);

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

  const estimate = async () => {
    setIsLoading(true);
    await estimateTransaction(request.args);
    setIsLoading(false);
  };

  const handleApprove = async () => {
    switch (method) {
      case "connect":
        const data = await getApp(publicAccount, requestSender.origin);
        if (!data) {
          const set = await setApp(publicAccount, requestSender.origin);
          if (set) {
            response = publicAccount;
          } else {
            // if something went wrong with saving app return false
            response = false;
          }
        } else {
          response = publicAccount;
        }
        break;
      case "account":
        response = publicAccount;
        break;
      case "signMessage":
        response = await signMessage(request.args);
        break;
      case "signTransaction":
        setIsLoading(true);
        response = await signTransaction(request.args);
        setIsLoading(false);
        break;
      case "signAndSubmitTransaction":
        setIsLoading(true);
        response = await signAndSubmitTransaction(request.args);
        setIsLoading(false);
        break;
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
    setMethod("default");
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
    "& textarea": {
      fontFamily: "monospace",
    },
  }));

  return (
    <Box>
      {spikaWallet ? (
        <div>
          {accountImported && (
            <div>
              {(method === "connect" || method === "account") && (
                <Dialog
                  fullScreen
                  sx={{ borderRadius: "0" }}
                  align="center"
                  open={openPermissionDialog}
                >
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
                    <Typography variant="body1">
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
                        <ListItem disablePadding>
                          <ListItemIcon sx={{ ml: 2 }}>
                            <InfoIcon />
                          </ListItemIcon>
                          <ListItemText primary="View account auth key" />
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
                      Approve
                    </Button>
                  </Stack>
                </Dialog>
              )}
              {method === "signMessage" && (
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
                    <div>
                      <Typography variant="body1">
                        This website is requesting to sign the following:
                      </Typography>
                      <Grid sx={{ width: "320px", mt: 2 }} container spacing={1}>
                        <Grid item xs={12}>
                          <Typography align="start" variant="body1" sx={{ ml: 0.5 }}>
                            Message
                          </Typography>
                          <Item>
                            <pre>{JSON.stringify(request.args, null, 2)}</pre>
                          </Item>
                        </Grid>
                      </Grid>
                    </div>
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
                      Sign
                    </Button>
                  </Stack>
                </Dialog>
              )}
              {(method === "signTransaction" || method === "signAndSubmitTransaction") && (
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
                    {isValidTransaction && (
                      <div>
                        <Typography variant="body1">Transaction approval required</Typography>
                        <Grid sx={{ width: "320px", mt: 2 }} container spacing={1}>
                          <Grid item xs={6}>
                            <Typography align="start" variant="subtitle2" sx={{ ml: 0.5 }}>
                              Network fee
                            </Typography>
                            <Item>~ {estimatedTxnResult.gas_used}</Item>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography align="start" variant="subtitle2" sx={{ ml: 0.5 }}>
                              Max gas amount
                            </Typography>
                            <Item>{estimatedTxnResult.max_gas_amount}</Item>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography align="start" variant="subtitle2" sx={{ ml: 0.5 }}>
                              Sender
                            </Typography>
                            <Tooltip sx={{ cursor: "pointer" }} title={estimatedTxnResult.sender}>
                              <Item>{shortenAddress(estimatedTxnResult.sender)}</Item>
                            </Tooltip>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography align="start" variant="subtitle2" sx={{ ml: 0.5 }}>
                              Sequence number
                            </Typography>
                            <Item>{estimatedTxnResult.sequence_number}</Item>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography align="start" variant="subtitle2" sx={{ ml: 0.5 }}>
                              Payload
                            </Typography>
                            <Item>
                              <pre>{JSON.stringify(request.args, null, 2)}</pre>
                            </Item>
                          </Grid>
                        </Grid>
                      </div>
                    )}
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
                    {isValidTransaction ? (
                      <Button
                        variant="contained"
                        sx={{
                          background:
                            "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                          width: "121px",
                        }}
                        onClick={handleApprove}
                      >
                        Approve{" "}
                      </Button>
                    ) : (
                      <Button variant="contained" disabled sx={{ width: "121px" }}>
                        Approve{" "}
                      </Button>
                    )}
                  </Stack>
                  <Loading />
                </Dialog>
              )}
            </div>
          )}
        </div>
      ) : (
        <Dialog fullScreen align="center" open={openPermissionDialog}>
          <DialogTitle align="center"> </DialogTitle>
          <DialogContent>
            <Stack
              sx={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "270px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box component="img" src={spika} sx={{ width: "100px", height: "50px", mt: 2 }} />
              <Box
                component="img"
                src={logo}
                sx={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: "128px",
                  height: "128px",
                }}
              />

              <Typography align="center" sx={{ mt: 2 }} variant="subtitle2">
                Wallet is not initialized. <br />
                Valid address is required in order to interact with this website. Open Spika
                extension and setup your account first.
              </Typography>

              <Typography align="center" sx={{ mt: 2 }} variant="subtitle2">
                Need help? <br />
                Check{" "}
                <Link href="https://docs.spika.app" underline="none" target="_blank" color="link">
                  guidelines
                </Link>{" "}
                or contact{" "}
                <Link href="mailto:support@spika.app" underline="none" target="_blank" color="link">
                  support
                </Link>{" "}
                for assistance.
              </Typography>
            </Stack>
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
