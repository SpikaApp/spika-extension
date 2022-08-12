import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
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
import { setMem } from "../utils/store";

const PermissionDialog = () => {
  const [request, setRequest] = useState();
  const [method, setMethod] = useState("nil");
  const [origin, setOrigin] = useState();
  const { spikaWallet, openPermissionDialog, setOpenPermissionDialog } = useContext(UIContext);
  const { accountImported, currentAddress, publicAccount } = useContext(AccountContext);
  const _currentRoute = "CURRENT_ROUTE";
  let response;

  useEffect(() => {
    getRequest();
  }, [accountImported]);

  useEffect(() => {
    getOrigin();
  }, [request]);

  const getRequest = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const rawRequest = urlParams.get("request");
    setRequest(JSON.parse(rawRequest));
  };

  const getOrigin = () => {
    const params = new URLSearchParams(window.location.search);
    setOrigin(params.get("origin"));
  };

  const sendResponse = async () => {
    await chrome.runtime.sendMessage({
      method: request.method,
      args: response,
      id: request.id,
    });
  };

  const handleApprove = async () => {
    if (method === "connect") {
      response = publicAccount;
    }
    if (method === "signTransaction") {
      const data = await client.generateTransaction(currentAddress, request.payload);
      response = data;
    }
    sendResponse(response);
    handleCancel();
  };

  const handleCancel = () => {
    setOpenPermissionDialog(false);
    setDefaultRoute();
    window.close();
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
              {method === "connect" && (
                <Dialog fullScreen align="center" open={openPermissionDialog}>
                  <DialogTitle>Title</DialogTitle>
                  <DialogContent sx={{ maxWidth: 375 }}>
                    <Box
                      component="img"
                      sx={{
                        height: 48,
                        width: 48,
                      }}
                      alt="title"
                      src="https://www.example.com"
                    />
                    <Typography sx={{ mt: 2, mb: 4 }} variant="body1">
                      https://example.com
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
            </div>
          )}
        </div>
      ) : (
        <Dialog fullScreen align="center" open={openPermissionDialog}>
          <DialogTitle>Account not found</DialogTitle>
          <DialogContent sx={{ maxWidth: 375 }}>
            <Typography variant="body1" color="warning.dark">
              Spika wallet is not initialized yet. Create or import account before accessing
              websites.
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
